import type { RequestHandler } from "express";

// Basic demo whitelist to avoid open proxy abuse
const ALLOWED_HOSTS = new Set([
  "example.com",
  "www.example.com",
  "httpbin.org",
  "duckduckgo.com",
  "www.duckduckgo.com",
  "bing.com",
  "www.bing.com",
]);

function isAllowed(url: URL) {
  return ALLOWED_HOSTS.has(url.hostname);
}

export const handleProxy: RequestHandler = async (req, res) => {
  try {
    const { url } = req.query as { url?: string };
    const node = (req.params.node || "direct").toString();

    if (!url) {
      return res.status(400).json({ error: "Missing 'url' query parameter" });
    }

    let target: URL;
    try {
      target = new URL(url);
    } catch {
      return res.status(400).json({ error: "Invalid target URL" });
    }

    if (!isAllowed(target)) {
      return res.status(403).json({ error: "Target host not allowed for proxy" });
    }

    if (req.method !== "GET") {
      return res.status(405).json({ error: "Only GET is allowed" });
    }

    const upstream = await fetch(target.toString(), {
      // Pass through a minimal set of headers
      headers: {
        "User-Agent": req.get("user-agent") || "AuroraOS-Proxy",
        Accept: req.get("accept") || "*/*",
      },
      redirect: "follow",
    });

    const contentType = upstream.headers.get("content-type") || "text/plain";

    res.setHeader("x-aurora-proxy", node);
    res.setHeader("content-type", contentType);

    // Stream the body
    if (!upstream.body) {
      return res.status(502).json({ error: "Upstream had no body" });
    }

    // For text and json, buffer and send to ensure CORS headers are set
    if (contentType.includes("application/json") || contentType.includes("text/")) {
      const text = await upstream.text();
      return res.status(upstream.status).send(text);
    }

    // For other types, just stream as-is
    const reader = upstream.body.getReader();
    res.status(upstream.status);

    const pump = async () => {
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(value);
      }
      res.end();
    };

    pump().catch((err) => {
      console.error("Proxy stream error:", err);
      if (!res.headersSent) {
        res.status(500).json({ error: "Proxy stream error" });
      } else {
        res.end();
      }
    });
  } catch (err) {
    console.error("Proxy error:", err);
    res.status(500).json({ error: "Proxy error" });
  }
};
