import { log } from "console";
import { createWriteStream } from "fs";
import { open, readdir, rename, rm } from "fs/promises";
import http from "http";
import mime from "mime-types";

async function severDirectory(req, res) {
  const [url] = req.url.split("?");
  const path = `./storage${decodeURIComponent(url)}`;

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

  if (req.url === "/favicon.ico") {
    res.statusCode = 204;
    return res.end("Favicon not found");
  }

  if (req.method === "GET") {
    const [url, queryString] = req.url.split("?");

    if (url === "/") {
      return await severDirectory(req, res);
    }

    const queryParams = {};
    if (queryString) {
      queryString.split("&").forEach((param) => {
        const [k, v] = param.split("=");
        queryParams[k] = v;
      });
    }

    const decodedPath = `./storage${decodeURIComponent(url)}`;

    let file;
    try {
      file = await open(decodedPath, "r");
      const stats = await file.stat();

      if (stats.isDirectory()) {
        await file.close();
        return await severDirectory(req, res);
      }

      const mimeType = mime.lookup(url) || "application/octet-stream";
      res.setHeader("Content-Type", mimeType);
      res.setHeader("Content-Length", stats.size);

      if (queryParams.action === "download") {
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="${url.split("/").pop()}"`,
        );
      }

      const fileData = await file.readFile();
      res.end(fileData);
    } catch (err) {
      res.statusCode = 404;
      res.end("File not found");
    } finally {
      if (file) await file.close();
    }
  }

  if (req.method === "DELETE") {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", async () => {
      try {
        const data = JSON.parse(body);
        const relativePath = data.filePath;

        const targetPath = `./storage/${relativePath}`;

        console.log(`Attempting to delete: ${targetPath}`);

        await rm(targetPath, { recursive: true, force: true });

        res.writeHead(200, { "Content-Type": "text/plain" });
        res.end(`Deleted: ${relativePath}`);
      } catch (err) {
        console.error("Delete Error:", err);
        res.writeHead(500);
        res.end("Failed to delete file");
      }
    });
  }

  if (req.method === "POST") {
    const fileName = req.headers.filename;
    let count = 0;
    if (!fileName) {
      res.statusCode = 400;
      return res.end("Filename header missing");
    }

    const writeStream = createWriteStream(`./storage/${fileName}`);
    count++;
    req.pipe(writeStream);

    req.on("end", () => {
      console.log(count);
      res.end("File uploaded successfully");
    });
  }
  if (req.method === "PATCH") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", async () => {
      try {
        const data = JSON.parse(body);
        const oldPath = `./storage/${data.oldName}`;
        const newPath = `./storage/${data.newName}`;

        await rename(oldPath, newPath);

        res.writeHead(200, { "Content-Type": "text/plain" });
        res.end("Rename successful");
      } catch (err) {
        console.error(err);
        res.writeHead(500);
        res.end("Rename failed: " + err.message);
      }
    });
    return;
  }
});

server.listen(3000, () => {
  console.log("Server running at http://localhost:3000/");
});
