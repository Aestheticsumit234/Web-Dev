import { createWriteStream } from "fs";
import fs from "fs/promises";
import { rm, writeFile } from "fs/promises";
import path from "path";
import crypto from "crypto";
import { safePath } from "../utils/safePath.js";
import FileJsonData from "../filesDB.json" with { type: "json" };
import DirectoriesDB from "../DirectoriesDB.json" with { type: "json" };

const BASE_PUBLIC = path.resolve("./public");

export const uploadFiles = async (req, res) => {
  try {
    const parentDirId =
      req.params.parentDirId || (DirectoriesDB[0] ? DirectoriesDB[0].id : null);

    if (!parentDirId) {
      return res.status(404).json({ error: "Parent directory not found" });
    }

    const filename = req.headers.filename || "untitled";
    const extension = path.extname(filename);
    const Id = crypto.randomUUID();
    const uploadPath = safePath(BASE_PUBLIC, `${Id}${extension}`);
    const writeStream = createWriteStream(uploadPath);

    req.on("error", (err) => {
      if (!res.headersSent) {
        writeStream.destroy();
        res.status(500).json({ error: "Request stream error" });
      }
    });

    writeStream.on("error", (err) => {
      if (!res.headersSent) {
        return res.status(500).json({ error: "Write stream error" });
      }
    });

    req.pipe(writeStream);

    writeStream.on("finish", async () => {
      try {
        const newFile = {
          id: Id,
          extension: extension,
          filename: filename,
          parentDirId,
        };

        FileJsonData.push(newFile);

        const parentDirData = DirectoriesDB.find(
          (folder) => folder.id === parentDirId,
        );

        if (parentDirData) {
          if (!Array.isArray(parentDirData.files)) {
            parentDirData.files = [];
          }
          parentDirData.files.push(Id);
        }

        await Promise.all([
          fs.writeFile(
            "./DirectoriesDB.json",
            JSON.stringify(DirectoriesDB, null, 2),
          ),
          fs.writeFile("./filesDB.json", JSON.stringify(FileJsonData, null, 2)),
        ]);

        if (!res.headersSent) {
          res
            .status(200)
            .json({ message: "File uploaded successfully", id: Id });
        }
      } catch (innerError) {
        console.error("Post-upload processing error:", innerError);
        if (!res.headersSent) {
          res.status(500).json({ error: "Failed to update database records" });
        }
      }
    });
  } catch (error) {
    console.error("General upload error:", error);
    if (!res.headersSent) {
      res.status(400).json({ error: "Invalid upload request" });
    }
  }
};

export const renameFiles = async (req, res) => {
  try {
    const { id } = req.params;
    const filePath = FileJsonData.find((file) => file.id === id);

    if (!filePath) {
      return res.status(404).json({ error: "File not found in database" });
    }

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
    const fileIndex = FileJsonData.findIndex((file) => file.id === id);

    if (fileIndex === -1) {
      return res.status(404).json({ error: "File not found in database" });
    }

    const fileData = FileJsonData[fileIndex];
    const fileName = `${fileData.id}${fileData.extension}`;
    const filePath = safePath(BASE_PUBLIC, fileName);

    await rm(filePath, { force: true });
    FileJsonData.splice(fileIndex, 1);
    const parentDirData = DirectoriesDB.find(
      (dir) => dir.id === fileData.parentDirId,
    );

    if (parentDirData) {
      parentDirData.files = parentDirData.files.filter(
        (fileId) => fileId !== id,
      );
    }

    await writeFile("./filesDB.json", JSON.stringify(FileJsonData, null, 2));
    await writeFile(
      "./DirectoriesDB.json",
      JSON.stringify(DirectoriesDB, null, 2),
    );

    res.status(200).json({ message: "File deleted successfully" });
  } catch (err) {
    console.error("DELETE ERROR:", err);
    res.status(500).json({ error: "Delete failed" });
  }
}; //✅
export const getFile = async (req, res) => {
  const { id } = req.params;
  const fileData = FileJsonData.find((file) => file.id === id);
  if (!fileData) {
    return res.status(404).json({ error: "File not found in database" });
  }
  const { extension } = fileData;
  const filePath = `${id}${extension}`;
  try {
    const safe = safePath(BASE_PUBLIC, filePath);

    if (req.query.action === "download") {
      res.set(
        "Content-Disposition",
        `attachment; filename=${fileData.filename}`,
      );
    }

    res.sendFile(safe);
  } catch (err) {
    console.log(err);
    return res.status(400).json({ error: "Invalid file path" });
  }
}; //✅
