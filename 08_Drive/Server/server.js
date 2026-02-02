import { log } from "console";
import { open, readdir, readFile } from "fs/promises";
import http from "http";
import mime from "mime-types";

async function severDirectory(req, res) {
  const [url] = req.url.split("?");
  const allAssets = await readdir(`./storage${url}`, { withFileTypes: true });
  res.setHeader("Content-Type", "application/json");
  return res.end(JSON.stringify(allAssets));
}

const server = http.createServer(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    return res.end();
  }

  if (req.url === "/favicon.ico") {
    res.statusCode = 204;
    return res.end(" Favicon not found");
  }

  if (req.url === "/") {
    await severDirectory(req, res);
  } else {
    const [url, queryString] = req.url.split("?");
    console.log({ url, queryString });

    const querryParams = {};
    if (queryString) {
      queryString.split("&").forEach((param) => {
        const [key, value] = param.split("=");
        querryParams[key] = value;
      });
    }

    console.log(querryParams);

    let file;
    try {
      file = await open(`./storage${decodeURIComponent(url)}`, "r");
      const stats = await file.stat();
      if (stats.isDirectory()) {
        await file.close();
        return await severDirectory(req, res);
      }

      res.setHeader("Content-Type", mime.lookup(url));
      res.setHeader("Content-Length", stats.size);

      if (querryParams.action === "download") {
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="${url.slice(1)}"`,
        );
      }

      const fileData = await file.readFile();
      res.end(fileData);
    } catch (error) {
      res.statusCode = 404;
      res.end("File not found");
    } finally {
      if (file) await file.close();
    }
  }
});

server.listen(3000, () => {
  console.log("Server running at http://localhost:3000/");
});
