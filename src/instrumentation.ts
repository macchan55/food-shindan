// Next.js instrumentation hook (runs once when the server process starts).
// Some hosting/dev environments route all outbound HTTP(S) through a proxy declared via the
// standard HTTPS_PROXY/https_proxy env vars. Node's built-in fetch (undici) does not honor
// those automatically the way curl does, so without this, server-side calls to Supabase (or
// any other external host) silently go direct and can be blocked by network egress rules.
// This is a no-op wherever no proxy env var is set (e.g. typical production deploys).
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const proxyUrl = process.env.HTTPS_PROXY || process.env.https_proxy;
  if (!proxyUrl) return;

  const { setGlobalDispatcher, ProxyAgent } = await import("undici");
  setGlobalDispatcher(new ProxyAgent(proxyUrl));
}
