import express from "express";

const app = express();

app.use(async (req, res) => {
    try {
        let ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "";
        ip = ip.split(",")[0].trim();
        const firstNumber = ip.match(/\d+/)?.[0] || "1";

        const fullPath = req.originalUrl;

        let targetHost;
        let targetUrl;

        if (fullPath.startsWith("/apps")) {
            const path = fullPath.replace("/apps", "");
            targetHost = `${firstNumber}.nowgg.fun`;
            targetUrl = `https://${targetHost}${path}`;
        } else {
            targetHost = "educationbluesky.com";
            targetUrl = `https://${targetHost}${fullPath}`;
        }

        const upstream = await fetch(targetUrl, {
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

        if (contentType.includes("text/html")) {
            let body = await upstream.text();

            body = body
                .replace(/https:\/\/educationbluesky\.com/g, "")
                .replace(/https:\/\/\d+\.nowgg\.fun/g, "/apps")
                .replace(/\/\/educationbluesky\.com/g, "")
                .replace(/\/\/\d+\.nowgg\.fun/g, "/apps")
                .replace(/href="\//g, 'href="/')
                .replace(/src="\//g, 'src="/')
                .replace(/action="\//g, 'action="/');

            res.send(body);
        } else {
            const buffer = await upstream.arrayBuffer();
            res.send(Buffer.from(buffer));
        }

    } catch (e) {
        res.status(500).send("Proxy error: " + e.message);
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT);
