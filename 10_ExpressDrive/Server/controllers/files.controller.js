import { createWriteStream } from "fs";
import { cp, mkdir, readFile, rename, rm, stat, writeFile } from "fs/promises";
import path from "path";
import { safePath } from "../utils/safePath.js";
import FileJsonData from "../filesDB.json" with { type: "json" };
import TrashJsonData from "../trashDB.json" with { type: "json" };

const BASE_PUBLIC = path.resolve("./public");
const BASE_TRASH = path.resolve("./trash");

export const uploadFiles = async (req, res) => {
  try {
    const { filename } = req.params;
    const extension = path.extname(filename);
    const Id = crypto.randomUUID();
    const uploadPath = safePath(BASE_PUBLIC, `${Id}${extension}`);
    const writeStream = createWriteStream(uploadPath);
    req.pipe(writeStream);
    writeStream.on("finish", async () => {
      FileJsonData.push({
        id: Id,
        extension: extension,
        filename: filename,
      });
      await writeFile("./filesDB.json", JSON.stringify(FileJsonData));
      res.status(200).json({ message: "File uploaded successfully" });
    });

    writeStream.on("error", () => {
      res.status(500).json({ error: "File upload failed" });
    });
  } catch (error) {
    res.status(400).json({ error: "Invalid upload path" });
  }
}; //✅

export const renameFiles = async (req, res) => {
  try {
    const { id } = req.params;
    const filePath = FileJsonData.find((file) => file.id === id);
    const { newFilename } = req.body;
    filePath.filename = newFilename;
    await writeFile("./filesDB.json", JSON.stringify(FileJsonData));
    res.status(200).json({ message: "File renamed successfully" });
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: "Rename failed" });
  }
}; //✅

export const deleteFiles = async (req, res) => {
  try {
    const { id } = req.params;
    const fileDBRaw = await readFile("./filesDB.json", "utf-8");
    const trashDBRaw = await readFile("./trashDB.json", "utf-8");
    const FileJsonData = JSON.parse(fileDBRaw);
    const TrashJsonData = JSON.parse(trashDBRaw);
    const fileIndex = FileJsonData.findIndex((file) => file.id === id);
    if (fileIndex === -1) {
      return res.status(404).json({ error: "File not found in DB" });
    }
    const fileData = FileJsonData[fileIndex];

    const source = safePath(BASE_PUBLIC, `${id}${fileData.extension}`);
    const destination = safePath(BASE_TRASH, `${id}${fileData.extension}`);

    await mkdir(BASE_TRASH, { recursive: true });
    await cp(source, destination, { recursive: true });
    await rm(source, { recursive: true, force: true });

    TrashJsonData.push(fileData);
    FileJsonData.splice(fileIndex, 1);

    await writeFile("./filesDB.json", JSON.stringify(FileJsonData, null, 2));
    await writeFile("./trashDB.json", JSON.stringify(TrashJsonData, null, 2));

    res.json({ message: "File moved to trash successfully" });
  } catch (err) {
    console.error("DELETE ERROR:", err);
    res.status(500).json({ error: "Delete failed" });
  }
}; //✅
export const getFile = async (req, res) => {
  const { id } = req.params;
  const fileData = FileJsonData.find((file) => file.id === id);
  const { extension } = fileData;
  const filePath = `${id}${extension}`;
  try {
    const safe = safePath(BASE_PUBLIC, filePath);

    if (req.query.action === "download") {
      res.set("Content-Disposition", "attachment");
    }

    res.sendFile(safe);
  } catch (err) {
    res.status(400).json({ error: "Invalid file path" });
  }
}; //✅
