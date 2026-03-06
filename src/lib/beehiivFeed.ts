export interface BeehiivPostItem {
  issueNumber: number;
  title: string;
  link: string;
  description: string;
  contentHtml: string;
  excerpt: string;
  pubDate: Date;
}

const decodeXmlEntities = (value: string): string =>
  value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, "/");

const stripCdata = (value: string): string => value.replace(/^<!\[CDATA\[|\]\]>$/g, "").trim();

const stripHtmlTags = (value: string): string =>
  value
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/powered by beehiiv/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");

const sanitizeHtml = (value: string): string => {
  const withoutMarkup = value
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<div[^>]*beehiiv__footer[\s\S]*$/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|tr|table|section|article|li|h[1-6])>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\r/g, "")
    .replace(/\t/g, " ");

  const paragraphs = withoutMarkup
    .split(/\n{1,}/)
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter((line) => line.length > 0 && !/powered by beehiiv/i.test(line));

  if (paragraphs.length === 0) {
    return "";
  }

  return paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("\n");
};

const getExcerpt = (value: string, maxChars = 100): string => {
  const trimmed = value.trim();
  if (trimmed.length <= maxChars) {
    return trimmed;
  }

  return `${trimmed.slice(0, maxChars).trimEnd()}...`;
};

const readTag = (input: string, tag: string): string => {
  const match = input.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return match?.[1]?.trim() ?? "";
};

export const getBeehiivPostsFromRss = async (feedUrl: string, maxItems = 12): Promise<BeehiivPostItem[]> => {
  if (!feedUrl) {
    return [];
  }

  try {
    const response = await fetch(feedUrl);
    if (!response.ok) {
      return [];
    }

    const xml = await response.text();
    const itemMatches = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)].slice(0, maxItems);

    const parsed = itemMatches
      .map((match) => {
        const itemXml = match[1] ?? "";
        const title = decodeXmlEntities(stripCdata(readTag(itemXml, "title")));
        const link = stripCdata(readTag(itemXml, "link"));
        const description = decodeXmlEntities(stripCdata(readTag(itemXml, "description")));
        const contentEncoded = decodeXmlEntities(stripCdata(readTag(itemXml, "content:encoded")));
        const pubDateRaw = stripCdata(readTag(itemXml, "pubDate"));
        const pubDate = pubDateRaw ? new Date(pubDateRaw) : null;
        const contentHtml = sanitizeHtml(contentEncoded || description);
        const excerptSource = stripHtmlTags(contentHtml || description);
        const excerpt = getExcerpt(excerptSource, 100);

        if (!title || !link || !pubDate || Number.isNaN(pubDate.getTime())) {
          return null;
        }

        return {
          title,
          link,
          description,
          contentHtml,
          excerpt,
          pubDate,
        };
      })
      .filter(
        (
          item,
        ): item is Omit<BeehiivPostItem, "issueNumber"> => item !== null,
      );

    const withIssueNumbers = parsed
      .sort((first, second) => first.pubDate.getTime() - second.pubDate.getTime())
      .map((item, index) => ({
        ...item,
        issueNumber: index + 1,
      }));

    return withIssueNumbers.sort((first, second) => second.pubDate.getTime() - first.pubDate.getTime());
  } catch {
    return [];
  }
};
