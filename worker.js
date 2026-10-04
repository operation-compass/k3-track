export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const response = await env.ASSETS.fetch(request);

    if (
      url.pathname === "/" ||
      url.pathname === "/index.html" ||
      url.pathname === "/assets/k3-track-og.png"
    ) {
      const headers = new Headers(response.headers);
      headers.set("cache-control", "no-cache, no-store, must-revalidate");
      headers.set("x-k3-build", "20261005-og-fix");
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers
      });
    }

    return response;
  }
};
