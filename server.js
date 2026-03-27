const express = require("express");
const { createProxyMiddleware, responseInterceptor } = require("http-proxy-middleware");

const app = express();

app.use("/", createProxyMiddleware({
  target: "https://educationbluesky.com",
  changeOrigin: true,
  ws: true,
  selfHandleResponse: true,

  router: (req) => {
    return "https://educationbluesky.com";
  },

  onProxyReq(proxyReq) {
    proxyReq.removeHeader("cookie");
    proxyReq.setHeader("host", "educationbluesky.com");
  },

  onProxyRes: responseInterceptor(async (buffer, proxyRes) => {
    delete proxyRes.headers["set-cookie"];

    if (proxyRes.headers["location"]) {
      proxyRes.headers["location"] =
        proxyRes.headers["location"]
          .replace(/https:\/\/educationbluesky\.com/g, "https://nowgg.fun")
          .replace(/https:\/\/now\.gg/g, "https://nowgg.fun");
    }

    let body = buffer.toString("utf8");

    body = body
      .replace(/https:\/\/educationbluesky\.com/g, "https://nowgg.fun")
      .replace(/https:\/\/now\.gg/g, "https://nowgg.fun");

    return body;
  })
}));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Proxy running"));
