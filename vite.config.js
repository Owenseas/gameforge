import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

/**
 * 本地 API 代理中间件。
 * 前端调用 /api-proxy，请求头带 x-proxy-target 指定目标 URL。
 * Node.js 在服务端转发，完全绕过浏览器 CORS 限制。
 * 同时支持 vite dev 和 vite preview 两种模式。
 */
function localApiProxy() {
  const handler = async (req, res) => {
    // 处理浏览器预检请求（理论上同源不会触发，防御性保留）
    if (req.method === "OPTIONS") {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Headers", "*");
      res.statusCode = 204;
      res.end();
      return;
    }

    const target = req.headers["x-proxy-target"];
    if (!target) {
      res.statusCode = 400;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: "Missing x-proxy-target header" }));
      return;
    }

    // 收集请求体
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    await new Promise((r) => req.on("end", r));
    const bodyBuf = Buffer.concat(chunks);

    // 只转发必要的请求头，避免 host 等导致上游拒绝
    const forwardHeaders = {};
    if (req.headers["authorization"])
      forwardHeaders["authorization"] = req.headers["authorization"];
    if (req.headers["content-type"])
      forwardHeaders["content-type"] = req.headers["content-type"];

    try {
      const upstream = await fetch(target, {
        method: req.method,
        headers: forwardHeaders,
        body: bodyBuf.length > 0 ? bodyBuf : undefined,
      });

      res.statusCode = upstream.status;

      // 转发上游响应头（跳过可能导致问题的传输层头）
      const skipHeaders = new Set([
        "transfer-encoding",
        "connection",
        "content-encoding",
        "content-length",
      ]);
      upstream.headers.forEach((v, k) => {
        if (!skipHeaders.has(k)) res.setHeader(k, v);
      });

      const buf = await upstream.arrayBuffer();
      res.end(Buffer.from(buf));
    } catch (e) {
      res.statusCode = 502;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: e.message }));
    }
  };

  return {
    name: "local-api-proxy",
    configureServer(server) {
      server.middlewares.use("/api-proxy", handler);
    },
    configurePreviewServer(server) {
      server.middlewares.use("/api-proxy", handler);
    },
  };
}

export default defineConfig({
  plugins: [react(), localApiProxy()],
});
