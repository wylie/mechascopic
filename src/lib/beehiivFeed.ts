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

const isSafeHref = (href: string): boolean => /^(https?:|mailto:|\/)/i.test(href);
const internalHosts = new Set(["mechascopic.com", "www.mechascopic.com"]);

const sanitizeHref = (href: string): string => {
  const trimmed = href.trim();
  return isSafeHref(trimmed) ? trimmed : "#";
};

const normalizeLinkHref = (href: string): { href: string; openInNewTab: boolean } => {
  const sanitized = sanitizeHref(decodeXmlEntities(href));

  if (sanitized === "#") {
    return { href: "#", openInNewTab: false };
  }

  if (/^mailto:/i.test(sanitized) || sanitized.startsWith("/")) {
    return { href: sanitized, openInNewTab: false };
  }

  try {
    const parsed = new URL(sanitized);
    if (internalHosts.has(parsed.hostname.toLowerCase())) {
      const relative = `${parsed.pathname || "/"}${parsed.search}${parsed.hash}`;
      return { href: relative || "/", openInNewTab: false };
    }

    return { href: parsed.toString(), openInNewTab: true };
  } catch {
    return { href: "#", openInNewTab: false };
  }
};

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");

const sanitizeHtml = (value: string): string => {
  let safeHtml = value
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, "")
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, "")
    .replace(/<div[^>]*beehiiv__footer[\s\S]*$/gi, "")
    .replace(/<!--([\s\S]*?)-->/g, "")
    .replace(/\s+on[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/\r/g, "")
    .replace(/\t/g, " ");

  // Normalize supported structural/formatting tags, removing attributes.
  const allowedTagNames = [
    "a",
    "p",
    "br",
    "ul",
    "ol",
    "li",
    "strong",
    "b",
    "em",
    "i",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "blockquote",
    "code",
    "pre",
  ];

  const placeholders = new Map<string, string>();
  let placeholderIndex = 0;
  const protect = (tag: string): string => {
    const key = `__BEEHIIV_HTML_${placeholderIndex++}__`;
    placeholders.set(key, tag);
    return key;
  };

  safeHtml = safeHtml.replace(/<\s*\/?\s*([a-z0-9]+)\b[^>]*>/gi, (full, tagName: string) => {
    const lower = tagName.toLowerCase();
    const isClosing = /^<\s*\//.test(full);
    const isSelfClosingBr = lower === "br";
    const isAnchor = lower === "a";

    if (!allowedTagNames.includes(lower)) {
      return "";
    }

    if (isAnchor) {
      if (isClosing) {
        return protect("</a>");
      }

      const hrefMatch = full.match(/href\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/i);
      const rawHref = hrefMatch?.[2] ?? hrefMatch?.[3] ?? hrefMatch?.[4] ?? "#";
      const { href, openInNewTab } = normalizeLinkHref(rawHref);
      const escapedHref = escapeHtml(href);
      return protect(
        openInNewTab
          ? `<a href="${escapedHref}" target="_blank" rel="noopener noreferrer">`
          : `<a href="${escapedHref}">`,
      );
    }

    if (isSelfClosingBr) {
      return protect("<br>");
    }

    return protect(isClosing ? `</${lower}>` : `<${lower}>`);
  });

  // Strip any remaining unknown markup, then restore safe normalized tags.
  safeHtml = safeHtml.replace(/<[^>]+>/g, "");
  for (const [key, tag] of placeholders.entries()) {
    safeHtml = safeHtml.replaceAll(key, tag);
  }

  safeHtml = safeHtml
    .replace(/\n{3,}/g, "\n\n")
    .replace(/<p>\s*powered by beehiiv\s*<\/p>/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();

  if (!safeHtml) {
    return "";
  }

  return safeHtml;
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
