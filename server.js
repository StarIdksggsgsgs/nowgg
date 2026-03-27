const express = require("express");
const { createProxyMiddleware, responseInterceptor } = require("http-proxy-middleware");

const app = express();

app.use("/", createProxyMiddleware({
  target: "https://educationbluesky.com",
  changeOrigin: true,
  ws: true,
  selfHandleResponse: true,
  followRedirects: false,

  onProxyReq(proxyReq) {
    proxyReq.removeHeader("cookie");
    proxyReq.setHeader("host", "educationbluesky.com");
  },

  onProxyRes: responseInterceptor(async (buffer, proxyRes, req, res) => {
    delete proxyRes.headers["set-cookie"];

    if (proxyRes.statusCode >= 300 && proxyRes.statusCode < 400 && proxyRes.headers["location"]) {
      let redirect = proxyRes.headers["location"];
      redirect = redirect
        .replace(/https:\/\/educationbluesky\.com/g, "https://nowgg.fun")
        .replace(/https:\/\/now\.gg/g, "https://nowgg.fun");
      res.statusCode = 302;
      res.setHeader("location", redirect);
      return "";
    }

    let body = buffer.toString("utf8");

    body = body
      .replace(/https:\/\/educationbluesky\.com/g, "https://nowgg.fun")
      .replace(/https:\/\/now\.gg/g, "https://nowgg.fun")
      .replace(/window\.location\s*=\s*['"]https?:\/\/(educationbluesky\.com|now\.gg)/g, "window.location='https://nowgg.fun");

    if (proxyRes.headers["content-type"] && proxyRes.headers["content-type"].includes("application/json")) {
      try {
        const json = JSON.parse(body);
        const str = JSON.stringify(json).replace(/https:\/\/educationbluesky\.com/g, "https://nowgg.fun")
                                        .replace(/https:\/\/now\.gg/g, "https://nowgg.fun");
        return str;
      } catch {
        return body;
      }
    }

    return body;
  })
}));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Proxy running"));
