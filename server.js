const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();

app.use("/", createProxyMiddleware({
  target: "https://educationbluesky.com",
  changeOrigin: true,
  ws: true,
  selfHandleResponse: false, // let headers pass through
  onProxyRes(proxyRes, req, res) {
    if (proxyRes.headers['location']) {
      let ipPrefix = req.ip.split('.').slice(0,3).join('.');
      proxyRes.headers['location'] = proxyRes.headers['location']
        .replace('https://educationbluesky.com', `${ipPrefix}.nowgg.fun`);
    }
    delete proxyRes.headers['set-cookie']; // block cookies
  },
  onProxyReq(proxyReq, req, res) {
    proxyReq.removeHeader('cookie'); // prevent sending client cookies
  }
}));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Proxy running"));
