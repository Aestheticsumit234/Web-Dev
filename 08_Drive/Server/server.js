import { open, readdir, readFile } from "fs/promises";
import http from "http";

async function severDirectory(req, res, BoilerplateCode) {
  const allAssets = await readdir("./storage" + req.url);
  let dynamicHTML = "";

  allAssets.forEach((asset) => {
    dynamicHTML += `<a href=".${req.url === "/" ? "" : req.url}/${asset}">${asset}</a><br>`;
  });

  return res.end(BoilerplateCode.replace("${dynamicHTML}", dynamicHTML));
}

const server = http.createServer(async (req, res) => {
  const BoilerplateCode = await readFile("./index.html", "utf-8");
  if (req.url === "/favicon.ico") return;

  if (req.url === "/") {
    await severDirectory(req, res, BoilerplateCode);
  } else {
    let file;

    try {
      file = await open(`./storage${decodeURIComponent(req.url)}`, "r");
      const stats = await file.stat();

      if (stats.isDirectory()) {
        await file.close();
        return await severDirectory(req, res, BoilerplateCode);
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
