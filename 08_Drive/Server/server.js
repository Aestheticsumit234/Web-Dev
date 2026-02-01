import { log } from "console";
import { open, readdir, readFile } from "fs/promises";
import http from "http";
import mime from "mime-types";

async function severDirectory(req, res, BoilerplateCode) {
  const [url, queryString] = req.url.split("?");
  const allAssets = await readdir(`./storage${url}`, { withFileTypes: true });
  let dynamicHTML = "";
  allAssets.forEach((asset) => {
    const isDir = asset.isDirectory();
    const name = asset.name;
    dynamicHTML += `<div>${name}
            <a href="${url === "/" ? "" : url}/${name}?action=open&test=1234">Open</a>
             ${isDir ? "" : `<a href="${url === "/" ? "" : url}/${name}?action=download">Download</a>`}
        </div>`;
  });
  return res.end(BoilerplateCode.replace("${dynamicHTML}", dynamicHTML));
}

const server = http.createServer(async (req, res) => {
  const BoilerplateCode = await readFile("./index.html", "utf-8");
  if (req.url === "/favicon.ico") return res.end("fevicon is not available!");
  if (req.url === "/") {
    await severDirectory(req, res, BoilerplateCode);
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
        return await severDirectory(req, res, BoilerplateCode);
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
