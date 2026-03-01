import type { APIRoute } from "astro";
import { SITE } from "../../../config";
import { getLatestYouTubeVideos, resolveYouTubeChannelId } from "../../../lib/youtubeFeed";

export const GET: APIRoute = async () => {
  const channelId = await resolveYouTubeChannelId({
    channelId: SITE.youtubeChannelId,
    channelUrl: SITE.youtube,
    channelHandle: SITE.youtubeHandle,
  });

  if (!channelId) {
    return new Response(
      JSON.stringify(
        {
          ok: false,
          error: "Could not resolve YouTube channel ID. Set SITE.youtubeChannelId in src/config.ts.",
          items: [],
        },
        null,
        2,
      ),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Cache-Control": "public, max-age=60",
        },
      },
    );
  }

  const items = await getLatestYouTubeVideos(channelId, 3, {
    excludeShorts: true,
    scanLimit: 15,
  });

  return new Response(
    JSON.stringify(
      {
        ok: true,
        channelId,
        count: items.length,
        items: items.map((item) => ({
          title: item.title,
          link: item.link,
          thumbnail: item.thumbnail,
          videoId: item.videoId,
          publishedAt: item.publishedAt,
        })),
      },
      null,
      2,
    ),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "public, max-age=60",
      },
    },
  );
};
