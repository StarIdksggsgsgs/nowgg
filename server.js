const express = require("express");
const { createProxyMiddleware, responseInterceptor } = require("http-proxy-middleware");

const app = express();

app.use((req, res, next) => {
  req.userIP = req.headers["x-user-ip"] || "0.0.0.0";
  next();
});

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

    let firstIP = req.userIP.split(".")[0] || "0";

    const convertUrl = (url) => {
      if (!url.includes(".com")) return url;
      const path = url.split(".com")[1] || "";
      return `https://tetosarcade.win/algebra.html?url=${firstIP}.nowgg.fun${path}`;
    };

    if (proxyRes.statusCode >= 300 && proxyRes.statusCode < 400 && proxyRes.headers["location"]) {
      res.statusCode = 302;
      res.setHeader("location", convertUrl(proxyRes.headers["location"]));
      return "";
    }

    let body = buffer.toString("utf8");

    body = body.replace(/https:\/\/educationbluesky\.com[^\s"'<>]*/g, (m) => convertUrl(m));
    body = body.replace(/https:\/\/now\.gg[^\s"'<>]*/g, (m) => convertUrl(m));

    body = body.replace(/window\.location\s*=\s*['"]([^'"]+)['"]/g, (m, url) => {
      return `window.location="${convertUrl(url)}"`;
    });

    if (proxyRes.headers["content-type"]?.includes("application/json")) {
      try {
        const json = JSON.parse(body);
        return JSON.stringify(json).replace(/https:\/\/(educationbluesky\.com|now\.gg)[^"']*/g, (m) => convertUrl(m));
      } catch {
        return body;
      }
    }

    if (proxyRes.headers["content-type"]?.includes("text/html")) {
      const inject = `
<script>
if (!window.__ip_sent__) {
  window.__ip_sent__ = true;
  fetch("https://api.ipify.org?format=json")
    .then(r => r.json())
    .then(d => {
      fetch("/", {
        headers: { "x-user-ip": d.ip }
      });
    });
}
</script>
`;
      body = body.replace("</head>", inject + "</head>");
    }

    return body;
  })
}));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Proxy running"));
