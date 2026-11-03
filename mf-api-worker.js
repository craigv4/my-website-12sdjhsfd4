const ALLOWED_ORIGIN = "https://craigv4.github.io";

export default {
  async fetch(request) {
    const origin = request.headers.get("Origin");
    const corsHeaders = {
      "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      Vary: "Origin",
    };

    if (origin !== ALLOWED_ORIGIN) {
      return new Response("Origin not allowed", { status: 403 });
    }

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== "GET") {
      return new Response("Method not allowed", {
        status: 405,
        headers: corsHeaders,
      });
    }

    const match = new URL(request.url).pathname.match(/^\/mf\/(\d+)\/?$/);
    if (!match) {
      return new Response("Not found", { status: 404, headers: corsHeaders });
    }

    const upstream = await fetch(`https://api.mfapi.in/mf/${match[1]}`, {
      headers: { Accept: "application/json" },
    });

    return new Response(upstream.body, {
      status: upstream.status,
      headers: {
        ...corsHeaders,
        "Cache-Control": "public, max-age=300",
        "Content-Type": "application/json; charset=utf-8",
      },
    });
  },
};
