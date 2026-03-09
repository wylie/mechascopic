import type { APIRoute } from "astro";

const BEEHIIV_API_BASE = "https://api.beehiiv.com/v2";

const badRequest = (error: string, status = 400) =>
  new Response(JSON.stringify({ ok: false, error }), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
  });

export const POST: APIRoute = async ({ request }) => {
  const beehiivApiKey = import.meta.env.BEEHIIV_API_KEY;
  const beehiivPublicationId = import.meta.env.BEEHIIV_PUBLICATION_ID;

  if (!beehiivApiKey || !beehiivPublicationId) {
    return badRequest(
      "Newsletter signup is not configured yet. Add BEEHIIV_API_KEY and BEEHIIV_PUBLICATION_ID.",
      500,
    );
  }

  let email = "";
  let firstName = "";

  const contentType = request.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    const body = (await request.json().catch(() => null)) as { email?: string; firstName?: string } | null;
    email = (body?.email || "").trim();
    firstName = (body?.firstName || "").trim();
  } else if (contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    email = String(formData.get("email") || "").trim();
    firstName = String(formData.get("firstName") || "").trim();
  }

  if (firstName.length > 80) {
    firstName = firstName.slice(0, 80);
  }

  if (!email) {
    return badRequest("Please enter an email address.");
  }

  if (!firstName) {
    return badRequest("Please enter your first name.");
  }

  const looksLikeEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!looksLikeEmail) {
    return badRequest("Please enter a valid email address.");
  }

  try {
    const response = await fetch(`${BEEHIIV_API_BASE}/publications/${beehiivPublicationId}/subscriptions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${beehiivApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        first_name: firstName || undefined,
        reactivate_existing: true,
        send_welcome_email: true,
        utm_source: "mechascopic-site",
      }),
    });

    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      const apiMessage =
        payload && typeof payload === "object" && "message" in payload
          ? String((payload as { message?: string }).message)
          : "Subscription failed.";

      return badRequest(apiMessage, response.status);
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
    });
  } catch {
    return badRequest("Could not subscribe right now. Please try again.", 502);
  }
};

export const GET: APIRoute = async () =>
  new Response(JSON.stringify({ ok: false, error: "Use POST to subscribe." }), {
    status: 405,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      Allow: "POST",
    },
  });
