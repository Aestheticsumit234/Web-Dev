import { createWriteStream } from "fs";
import { open, readdir, rename, rm } from "fs/promises";
import http from "http";
import mime from "mime-types";

async function severDirectory(req, res, customPath) {
  const path = customPath || `./storage`;
  try {
    const allAssets = await readdir(path, { withFileTypes: true });
    res.setHeader("Content-Type", "application/json");
    return res.end(
      JSON.stringify(
        allAssets.map((f) => ({
          name: f.name,
          isDir: f.isDirectory(),
          isFile: f.isFile(),
        })),
      ),
    );
  } catch (err) {
    res.statusCode = 404;
    return res.end("Folder not found");
  }
}

const server = http.createServer(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, DELETE, PATCH",
  );
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Headers", "*");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    return res.end();
  }

  const [url, queryString] = req.url.split("?");
  const decodedPath = `./storage${decodeURIComponent(url)}`.replace(
    /\/+/g,
    "/",
  );

  if (req.method === "GET") {
    if (url === "/favicon.ico") return ((res.statusCode = 204), res.end());

    let file;
    try {
      file = await open(decodedPath, "r");
      const stats = await file.stat();

      if (stats.isDirectory()) {
        await file.close();
        return await severDirectory(req, res, decodedPath);
      }

      const queryParams = new URLSearchParams(queryString);
      const mimeType = mime.lookup(decodedPath) || "application/octet-stream";
      res.setHeader("Content-Type", mimeType);
      res.setHeader("Content-Length", stats.size);

      if (queryParams.get("action") === "download") {
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="${decodedPath.split("/").pop()}"`,
        );
      }

      const fileData = await file.readFile();
      res.end(fileData);
    } catch (err) {
      res.statusCode = 404;
      res.end("Not found");
    } finally {
      if (file) await file.close();
    }
  }

  if (req.method === "DELETE") {
    let body = "";
    req.on("data", (chunk) => (body += chunk.toString()));
    req.on("end", async () => {
      try {
        const data = JSON.parse(body);
        const targetPath = `./storage/${data.filePath}`.replace(/\/+/g, "/");
        await rm(targetPath, { recursive: true, force: true });
        res.end("Deleted");
      } catch (err) {
        res.statusCode = 500;
        res.end("Delete error");
      }
    });
  }

  if (req.method === "POST") {
    const fileName = req.headers.filename;
    if (!fileName) return ((res.statusCode = 400), res.end("No filename"));

    const uploadPath = `${decodedPath}/${fileName}`.replace(/\/+/g, "/");
    const writeStream = createWriteStream(uploadPath);
    req.pipe(writeStream);
    req.on("end", () => res.end("Uploaded"));
  }

  if (req.method === "PATCH") {
    let body = "";
    req.on("data", (chunk) => (body += chunk.toString()));
    req.on("end", async () => {
      try {
        const data = JSON.parse(body);
        const oldP = `./storage/${data.oldName}`.replace(/\/+/g, "/");
        const newP = `./storage/${data.newName}`.replace(/\/+/g, "/");
        await rename(oldP, newP);
        res.end("Renamed");
      } catch (err) {
        res.statusCode = 500;
        res.end(err.message);
      }
    });
  }
});

server.listen(3000, () => console.log("Server: http://localhost:3000/"));
