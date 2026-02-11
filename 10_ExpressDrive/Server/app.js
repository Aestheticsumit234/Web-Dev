import express from "express";
import cors from "cors";
import { createWriteStream } from "fs";
import { mkdir, readdir, rename, rm, stat, unlink } from "fs/promises";
import path from "path";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const PORT = process.env.PORT || 8080;

app.use(
  cors({
    origin: ["http://localhost:5173"],
  }),
);

const BASE_PUBLIC = path.resolve("./public");
const BASE_TRASH = path.resolve("./trash");

function safePath(base, userPath = "") {
  const resolved = path.resolve(base, userPath);

  if (!resolved.startsWith(base)) {
    throw new Error("Path Traversal Attempt Blocked");
  }

  if (userPath.includes("..")) {
    throw new Error("Invalid Path");
  }

  return resolved;
}

app.get("/directory/?*", async (req, res) => {
  try {
    const { 0: dirname = "" } = req.params;

    const fullDirPath = safePath(BASE_PUBLIC, dirname);

    const fileList = await readdir(fullDirPath);

    const resData = [];
    for (const file of fileList) {
      const filePath = path.join(fullDirPath, file);
      const stats = await stat(filePath);

      resData.push({ item: file, isDirectory: stats.isDirectory() });
    }
    res.json(resData);
  } catch (err) {
    console.log(err);
    res.status(400).json({ error: "Invalid directory path" });
  }
});

app.post("/directory/?*", async (req, res) => {
  try {
    const { 0: dirname = "" } = req.params;

    const fullPath = safePath(BASE_PUBLIC, dirname);

    await mkdir(fullPath, { recursive: true });

    res.json({ message: "Folder created successfully" });
  } catch (err) {
    res.status(400).json({ error: "Invalid folder path" });
  }
});

app.get("/files/:filePath(*)", async (req, res) => {
  try {
    const filePath = req.params.filePath;

    const safe = safePath(BASE_PUBLIC, filePath);

    if (req.query.action === "download") {
      res.set("Content-Disposition", "attachment");
    }

    res.sendFile(safe);
  } catch (err) {
    res.status(400).json({ error: "Invalid file path" });
  }
});

app.delete("/files/:filePath(*)", async (req, res) => {
  try {
    const filePath = req.params.filePath;

    const source = safePath(BASE_PUBLIC, filePath);
    const destination = safePath(BASE_TRASH, filePath);

    const stats = await stat(source);

    const dirParts = filePath.split("/").slice(0, -1).join("/");
    if (dirParts) {
      await mkdir(safePath(BASE_TRASH, dirParts), { recursive: true });
    }

    if (stats.isDirectory()) {
      await mkdir(destination, { recursive: true });
      await rm(source, { recursive: true, force: true });
      return res.json({ message: "Folder deleted successfully" });
    }

    await rename(source, destination);

    res.json({ message: "File deleted successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Delete failed" });
  }
});

app.patch("/files/*", async (req, res) => {
  try {
    const { 0: filePath } = req.params;
    const { newFilename } = req.body;

    const oldPath = safePath(BASE_PUBLIC, filePath);
    const newPath = safePath(BASE_PUBLIC, newFilename);

    await rename(oldPath, newPath);
    res.status(200).json({ message: "File renamed successfully" });
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: "Rename failed" });
  }
});

app.post("/files/*", async (req, res) => {
  try {
    const { 0: filename } = req.params;
    const uploadPath = safePath(BASE_PUBLIC, filename);

    const writeStream = createWriteStream(uploadPath);

    req.pipe(writeStream);

    writeStream.on("finish", () => {
      res.status(200).json({ message: "File uploaded successfully" });
    });

    writeStream.on("error", () => {
      res.status(500).json({ error: "File upload failed" });
    });
  } catch (error) {
    res.status(400).json({ error: "Invalid upload path" });
  }
});

app.get("/trash", async (req, res) => {
  try {
    const fileList = await readdir(BASE_TRASH);
    res.json(fileList);
  } catch (err) {
    res.status(500).json({ error: "Unable to read trash" });
  }
});
app.post("/trash/:filename", async (req, res) => {
  try {
    const { filename } = req.params;
    const trashed = safePath(BASE_TRASH, filename);
    const publicPath = safePath(BASE_PUBLIC, filename);

    await rename(trashed, publicPath);
    res.status(200).json({ message: "File restored successfully" });
  } catch (error) {
    res.status(400).json({ error: "Restore failed" });
  }
});
app.delete("/trash/:filename(*)", async (req, res) => {
  try {
    const filePath = req.params.filename;
    const fullPath = safePath(BASE_TRASH, filePath);

    const stats = await stat(fullPath);

    if (stats.isDirectory()) {
      await rm(fullPath, { recursive: true, force: true });
      res.json({ message: "Folder deleted permanently" });
    } else {
      await rm(fullPath, { force: true });
      res.json({ message: "File deleted permanently" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Permanent delete failed" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
