import { createWriteStream } from "fs";
import { rm } from "fs/promises";
import path from "path";
import { safePath } from "../utils/safePath.js";
import File from "../model/Files.model.js";
import Directory from "../model/directory.model.js";

const BASE_PUBLIC = path.resolve("./public");

export const uploadFiles = async (req, res, next) => {
  try {
    const { user } = req;

    const parentDirId = req.params.parentDirId || user.rootDirId;

    const parentDireData = await Directory.findOne({
      _id: parentDirId,
      userId: user._id,
    });

    if (!parentDireData) {
      const err = new Error("Unauthorized access to this directory");
      err.statusCode = 403;
      return next(err);
    }

    const filename = req.headers.filename || "untitled";
    const extension = path.extname(filename);

    const newFile = await File.create({
      name: filename,
      extension,
      userId: user._id,
      parentDirId: parentDireData._id,
    });

    const fileId = newFile._id;
    const uploadPath = safePath(BASE_PUBLIC, `${fileId}${extension}`);
    const writeStream = createWriteStream(uploadPath);

    req.pipe(writeStream);

    writeStream.on("finish", () => {
      if (!res.headersSent) {
        return res.status(200).json({
          message: "File uploaded successfully",
          file: newFile,
        });
      }
    });

    writeStream.on("error", async (err) => {
      console.error("Write stream error:", err);

      await File.findByIdAndDelete(fileId);
      await rm(uploadPath, { force: true });
      if (!res.headersSent) return next(err);
    });

    req.on("error", async (err) => {
      console.error("Request stream error:", err);
      writeStream.destroy();
      await File.findByIdAndDelete(fileId);
      await rm(uploadPath, { force: true });
      if (!res.headersSent) return next(err);
    });
  } catch (error) {
    console.error("General upload error:", error);
    next(error);
  }
};

export const renameFiles = async (req, res) => {
  try {
    const { user } = req;
    if (!req.params.id) {
      return res.status(400).json({ error: "File ID is required" });
    }
    const id = req.params.id;
    const { newFilename } = req.body;

    const fileDoc = await File.findOne({ _id: id, userId: user._id });

    if (!fileDoc) {
      return res.status(404).json({ error: "File not found or unauthorized" });
    }

    await File.updateOne({ _id: fileDoc._id }, { $set: { name: newFilename } });
    res.status(200).json({ message: "File renamed successfully" });
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: "Rename failed" });
  }
};

export const deleteFiles = async (req, res) => {
  try {
    const { user } = req;
    if (!req.params.id) {
      return res.status(400).json({ error: "File ID is required" });
    }
    const id = req.params.id;

    const checkFile = await File.findOne({ _id: id, userId: user._id });

    if (!checkFile) {
      return res.status(404).json({ error: "File not found or unauthorized" });
    }

    const fileName = `${checkFile._id}${checkFile.extension}`;
    const filePath = safePath(BASE_PUBLIC, fileName);

    await rm(filePath, { force: true });
    await File.deleteOne({ _id: id });
    res.status(200).json({ message: "File deleted successfully" });
  } catch (err) {
    console.error("DELETE ERROR:", err);
    res.status(500).json({ error: "Delete failed" });
  }
};

export const getFile = async (req, res) => {
  const { user } = req;
  if (!req.params.id) {
    return res.status(400).json({ error: "File ID is required" });
  }
  const id = req.params.id;

  const fileData = await File.findOne({ _id: id, userId: user._id });

  if (!fileData) {
    return res.status(404).json({ error: "File not found or unauthorized" });
  }

  const { extension } = fileData;
  const filePath = `${id}${extension}`;

  try {
    const safe = safePath(BASE_PUBLIC, filePath);

    const sendErrorHandler = (err) => {
      if (err) {
        console.error("Error sending file:", err);
        if (!res.headersSent) {
          res.status(404).json({ error: "Physical file missing from server" });
        }
      }
    };

    if (req.query.action === "download") {
      return res.download(safe, fileData.name, sendErrorHandler);
    }

    res.sendFile(safe, sendErrorHandler);
  } catch (err) {
    console.log(err);
    return res.status(400).json({ error: "Invalid file path" });
  }
};
