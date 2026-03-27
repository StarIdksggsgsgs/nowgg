const express = require("express");
const { createProxyMiddleware, responseInterceptor } = require("http-proxy-middleware");

const app = express();

// Proxy everything to now.gg
app.use("/", createProxyMiddleware({
  target: "https://educationbluesky.com",
  changeOrigin: true,
  ws: true,
  selfHandleResponse: true,
  onProxyRes: responseInterceptor(async (buffer) => {
    let body = buffer.toString("utf8");
    // Replace all now.gg links with nowgg.fun
    body = body.replace(/https:\/\/now\.gg/g, "https://nowgg.fun");
    return body;
  })
}));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Proxy running on port " + PORT);
});
