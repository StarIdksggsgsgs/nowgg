const express = require("express");
const { createProxyMiddleware, responseInterceptor } = require("http-proxy-middleware");

const app = express();

app.use("/", createProxyMiddleware({
  target: "https://educationbluesky.com",
  changeOrigin: true,
  ws: true,
  selfHandleResponse: true,
  onProxyRes: responseInterceptor(async (buffer, proxyRes, req) => {
    let body = buffer.toString("utf8");
    delete proxyRes.headers['set-cookie'];
    let ipPrefix = req.ip.split(".").slice(0,3).join(".");
    body = body.replace(/https:\/\/educationbluesky\.com/g, `${ipPrefix}.nowgg.fun`);
    return body;
  })
}));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Proxy running"));
