import express from "express";
import fetch from "node-fetch";

const app = express();

app.use(async (req, res) => {
    try {
        const fullPath = req.originalUrl;

        let ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "";
        ip = ip.split(",")[0].trim();
        const firstNumber = ip.match(/\d+/)?.[0] || "1";

        let target;
        if (fullPath.startsWith("/apps")) {
            const appPath = fullPath.replace("/apps/", "");
            target = `https://${firstNumber}.nowgg.fun/${appPath}`;
        } else {
            target = "https://educationbluesky.com" + fullPath;
        }

        const upstream = await fetch(target, {
            method: req.method,
            headers: {
                "user-agent": req.headers["user-agent"] || "",
                "accept": req.headers["accept"] || "*/*",
                "accept-language": req.headers["accept-language"] || "",
                "content-type": req.headers["content-type"] || ""
            },
            body: ["GET","HEAD"].includes(req.method) ? undefined : req
        });

        const contentType = upstream.headers.get("content-type") || "";
        let body;

        if (contentType.includes("text") || contentType.includes("json") || contentType.includes("javascript")) {
            body = await upstream.text();

            body = body
                .replace(/https:\/\/educationbluesky\.com/g, "")
                .replace(/https:\/\/\d+\.nowgg\.fun/g, "/apps")
                .replace(/href="\//g, 'href="/')
                .replace(/src="\//g, 'src="/')
                .replace(/action="\//g, 'action="/');
        } else {
            const buf = await upstream.arrayBuffer();
            body = Buffer.from(buf);
        }

        res.status(upstream.status);

        upstream.headers.forEach((value, key) => {
            const k = key.toLowerCase();
            if (
                k !== "set-cookie" &&
                k !== "content-security-policy" &&
                k !== "x-frame-options"
            ) {
                res.setHeader(key, value);
            }
        });

        res.send(body);
    } catch {
        res.status(500).send("Proxy error");
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT);
