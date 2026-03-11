/**
 * 所有外部 API 调用都通过本地 Vite 服务的 /api-proxy 端点中转，
 * 由 Node.js 发起实际请求，彻底绕过浏览器 CORS 限制。
 */
export function proxyFetch(url, options = {}) {
  const { headers = {}, ...rest } = options;
  return fetch("/api-proxy", {
    ...rest,
    headers: {
      ...headers,
      "x-proxy-target": url,
    },
  });
}
