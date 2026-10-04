export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const response = await env.ASSETS.fetch(request);

    const fresh =
      url.pathname === "/" ||
      url.pathname.endsWith(".html") ||
      url.pathname.endsWith(".json") ||
      url.pathname === "/assets/k3-track-og-final-v2.jpg";

    if (fresh) {
      const headers = new Headers(response.headers);
      headers.set("cache-control", "no-cache, no-store, must-revalidate");
      headers.set("x-k3-build", "20261005-final-audit");
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers
      });
    }

    return response;
  }
};
