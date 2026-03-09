import type { MiddlewareHandler } from "astro";

const isVercelHost = (hostname: string) => hostname === "mechascopic.vercel.app" || hostname.endsWith(".vercel.app");

const NO_INDEX_HEADER = "noindex, nofollow, noarchive, nosnippet, noimageindex";

export const onRequest: MiddlewareHandler = async (context, next) => {
  const host = context.url.hostname.toLowerCase();
  const onVercelDomain = isVercelHost(host);

  // Ensure bots explicitly stay away from dev-hosted Vercel domains.
  if (onVercelDomain && context.url.pathname === "/robots.txt") {
    return new Response("User-agent: *\nDisallow: /\n", {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Robots-Tag": NO_INDEX_HEADER,
      },
    });
  }

  const response = await next();

  if (onVercelDomain) {
    response.headers.set("X-Robots-Tag", NO_INDEX_HEADER);
  }

  return response;
};
