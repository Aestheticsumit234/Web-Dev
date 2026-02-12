import { createWriteStream } from "fs";
import { mkdir, rename, rm, stat } from "fs/promises";
import path from "path";
import { safePath } from "../utils/safePath.js";

const BASE_PUBLIC = path.resolve("./public");
const BASE_TRASH = path.resolve("./trash");

export const uploadFiles = async (req, res) => {
  try {
    const filename = req.params[0];
    console.log(filename);
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
};

export const renameFiles = async (req, res) => {
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
};

export const deleteFiles = async (req, res) => {
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
};

export const downloadFiles = async (req, res) => {
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
};
