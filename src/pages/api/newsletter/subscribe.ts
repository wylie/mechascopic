import type { APIRoute } from "astro";

const BEEHIIV_API_BASE = "https://api.beehiiv.com/v2";

const badRequest = (error: string, status = 400) =>
  new Response(JSON.stringify({ ok: false, error }), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
  });

const extractBeehiivErrorMessage = (payload: unknown) => {
  if (!payload || typeof payload !== "object") {
    return "";
  }

  const maybePayload = payload as {
    message?: unknown;
    error?: unknown;
    errors?: Array<{ message?: unknown; error?: unknown; field?: unknown }>;
  };

  if (typeof maybePayload.message === "string" && maybePayload.message.trim()) {
    return maybePayload.message.trim();
  }

  if (typeof maybePayload.error === "string" && maybePayload.error.trim()) {
    return maybePayload.error.trim();
  }

  if (Array.isArray(maybePayload.errors) && maybePayload.errors.length > 0) {
    const first = maybePayload.errors[0];
    const firstMessage =
      typeof first?.message === "string"
        ? first.message.trim()
        : typeof first?.error === "string"
          ? first.error.trim()
          : "";
    if (firstMessage) {
      return firstMessage;
    }
  }

  return "";
};

const isAlreadySubscribedMessage = (message: string) => {
  const normalized = message.toLowerCase();
  return (
    normalized.includes("already subscribed") ||
    normalized.includes("already exists") ||
    normalized.includes("already been taken") ||
    normalized.includes("existing subscription")
  );
};

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

    const rawBody = await response.text();
    let payload: unknown = null;
    if (rawBody) {
      try {
        payload = JSON.parse(rawBody);
      } catch {
        payload = null;
      }
    }
    if (!response.ok) {
      const apiMessage = extractBeehiivErrorMessage(payload);
      const textFallback = rawBody.trim();
      const fallbackMessage =
        textFallback && !textFallback.startsWith("<") ? textFallback.slice(0, 240) : "Subscription failed.";

      // Beehiiv may return duplicate-subscription errors with non-2xx status.
      if ((response.status === 400 || response.status === 409) && isAlreadySubscribedMessage(apiMessage)) {
        return new Response(JSON.stringify({ ok: true, alreadySubscribed: true }), {
          status: 200,
          headers: {
            "Content-Type": "application/json; charset=utf-8",
          },
        });
      }

      if (response.status === 401 || response.status === 403) {
        return badRequest("Newsletter signup configuration is invalid. Please contact support.", 500);
      }

      return badRequest(apiMessage || fallbackMessage, response.status);
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
