export interface YouTubeVideoItem {
  title: string;
  videoId: string;
  watchUrl: string;
  embedUrl: string;
  link: string;
  thumbnail: string;
  publishedAt: string | undefined;
}

interface GetLatestVideosOptions {
  excludeShorts?: boolean;
  scanLimit?: number;
}

interface WatchPageMetadata {
  lengthSeconds?: number;
  isLiveContent: boolean;
}

const isLikelyShortFromHtml = (html: string): boolean => {
  const shortSignals = [
    "WEB_PAGE_TYPE_SHORTS",
    '"canonicalBaseUrl":"/shorts/',
    "youtube.com/shorts/",
    '"isShortsEligible":true',
    '<link rel="canonical" href="https://www.youtube.com/shorts/',
  ];

  return shortSignals.some((signal) => html.includes(signal));
};

const parseWatchPageMetadata = (html: string): WatchPageMetadata => {
  const lengthMatch = html.match(/"lengthSeconds":"(\d+)"/);
  const liveMatch = html.match(/"isLiveContent":(true|false)/);

  return {
    lengthSeconds: lengthMatch?.[1] ? Number(lengthMatch[1]) : undefined,
    isLiveContent: liveMatch?.[1] === "true",
  };
};

const isShortByShortsUrl = async (videoId: string): Promise<boolean> => {
  try {
    const response = await fetch(`https://www.youtube.com/shorts/${videoId}`, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      },
    });

    if (!response.ok) {
      return false;
    }

    return (response.url || "").includes("/shorts/");
  } catch {
    return false;
  }
};

const decodeXmlEntities = (value: string) =>
  value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

const normalizeHandle = (value: string) => value.trim().replace(/^@/, "").toLowerCase();

const extractHandleFromUrl = (url?: string): string => {
  if (!url || !url.includes("/@")) {
    return "";
  }

  return normalizeHandle(url.split("/@")[1].split(/[/?#]/)[0] || "");
};

const htmlMatchesHandle = (html: string, handle: string): boolean => {
  const expected = normalizeHandle(handle);
  if (!expected) {
    return false;
  }

  const directHandleRegex = new RegExp(`@${expected}([\\"'/?#<]|$)`, "i");
  return directHandleRegex.test(html);
};

const parseYouTubeChannelIdFromHtml = (html: string): string => {
  const channelIdFromJson = html.match(/"channelId":"(UC[^"]+)"/);
  if (channelIdFromJson?.[1]) {
    return channelIdFromJson[1];
  }

  const canonicalMatch = html.match(/<link rel="canonical" href="https:\/\/www\.youtube\.com\/channel\/(UC[^"]+)"/);
  if (canonicalMatch?.[1]) {
    return canonicalMatch[1];
  }

  return "";
};

export const resolveYouTubeChannelId = async (
  options: { channelId?: string; channelUrl?: string; channelHandle?: string },
): Promise<string> => {
  if (options.channelId) {
    return options.channelId;
  }

  const handle = normalizeHandle(options.channelHandle || extractHandleFromUrl(options.channelUrl));

  if (!handle) {
    return "";
  }

  try {
    const response = await fetch(`https://www.youtube.com/@${handle}`);
    if (!response.ok) {
      return "";
    }

    const html = await response.text();
    if (!htmlMatchesHandle(html, handle)) {
      return "";
    }
    return parseYouTubeChannelIdFromHtml(html);
  } catch {
    return "";
  }
};

export const getLatestYouTubeVideos = async (
  channelId: string,
  count = 3,
  options: GetLatestVideosOptions = {},
): Promise<YouTubeVideoItem[]> => {
  if (!channelId) {
    return [];
  }

  try {
    const feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
    const response = await fetch(feedUrl);

    if (!response.ok) {
      return [];
    }

    const xml = await response.text();
    const scanLimit = Math.max(count, options.scanLimit ?? count * 5);
    const entryMatches = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].slice(0, scanLimit);

    const parsed = entryMatches
      .map((match) => {
        const entry = match[1];
        const videoIdMatch = entry.match(/<yt:videoId>([^<]+)<\/yt:videoId>/);
        const titleMatch = entry.match(/<title>([\s\S]*?)<\/title>/);
        const publishedMatch = entry.match(/<published>([^<]+)<\/published>/);

        if (!videoIdMatch || !titleMatch) {
          return null;
        }

        const videoId = videoIdMatch[1].trim();
        const title = decodeXmlEntities(titleMatch[1].trim());

        return {
          title,
          videoId,
          watchUrl: `https://www.youtube.com/watch?v=${videoId}`,
          embedUrl: `https://www.youtube.com/embed/${videoId}`,
          link: `https://www.youtube.com/watch?v=${videoId}`,
          thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
          publishedAt: publishedMatch?.[1],
        };
      })
      .filter((video): video is YouTubeVideoItem => video !== null);

    if (!options.excludeShorts) {
      return parsed.slice(0, count);
    }

    const shortsFlags = await Promise.all(
      parsed.map(async (video) => {
        try {
          const isShortFromShortsRoute = await isShortByShortsUrl(video.videoId);
          if (isShortFromShortsRoute) {
            return true;
          }

          const shortCheckResponse = await fetch(video.watchUrl, {
            headers: {
              "User-Agent":
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
            },
          });

          if (!shortCheckResponse.ok) {
            return false;
          }

          const finalUrl = shortCheckResponse.url || "";
          if (finalUrl.includes("/shorts/")) {
            return true;
          }

          const html = await shortCheckResponse.text();
          if (isLikelyShortFromHtml(html)) {
            return true;
          }

          const metadata = parseWatchPageMetadata(html);
          if (!metadata.isLiveContent && typeof metadata.lengthSeconds === "number" && metadata.lengthSeconds <= 61) {
            return true;
          }

          return false;
        } catch {
          return false;
        }
      }),
    );

    return parsed.filter((_, index) => !shortsFlags[index]).slice(0, count);
  } catch {
    return [];
  }
};
