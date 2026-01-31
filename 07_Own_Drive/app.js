import { open, readdir, readFile } from "fs/promises";
import { createReadStream } from "fs";
import http from "http";

const server = http.createServer(async (req, res) => {
  const [url, query] = req.url.split("?");
  console.log(query);

  if (req.url === "/favicon.ico") {
    res.end();
    return;
  }
  if (url === "/") {
    const allFiles = await readdir(`./storage${url}`);
    let dynamicHTML = "";
    const htmlBoilerplate = await readFile("./Boilerplate.html", "utf-8");
    allFiles.forEach((file) => {
      dynamicHTML += `<div id="file-card"><p>${file}</p><div id="actions"><a href="./${file}?action=open">Open</a><a href="./${file}?action=download">Download</a></div> </div>`;
    });
    res.end(`${htmlBoilerplate.replace("${dynamicHTML}", dynamicHTML)}`);
  } else {
    try {
      const fileHandle = await open(`./storage/${decodeURIComponent(url)}`);
      const isFile = await fileHandle.stat();
      if (isFile.isFile()) {
        const file = await fileHandle.createReadStream();
        file.pipe(res);
      } else {
        console.log(req.url);

        try {
          const allFiles = await readdir(
            `./storage/${decodeURIComponent(url)}`,
          );
          let dynamicHTML = "";
          const htmlBoilerplate = await readFile("./Boilerplate.html", "utf-8");
          allFiles.forEach((file) => {
            dynamicHTML += `<div id="file-card"><p>${file}</p><div id="actions"><a href=".${url}/${file}">Open</a><a href=".${url}/${file}">Download</a></div> </div>`;
          });
          res.end(`${htmlBoilerplate.replace("${dynamicHTML}", dynamicHTML)}`);
        } catch (error) {
          console.log("Error in reading folder");
          console.log(error);
          res.end("not found");
        }
      }
    } catch (error) {
      console.log("Error in reading file");
      console.log(error);
      res.end("not found");
    }
  }
});

server.listen(3000, () => {
  console.log("Server is listening on port 3000");
});
