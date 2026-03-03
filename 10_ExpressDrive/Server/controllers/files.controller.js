import { createWriteStream } from "fs";
import { rm } from "fs/promises";
import path from "path";
import { safePath } from "../utils/safePath.js";
import { ObjectId } from "mongodb";
import File from "../model/Files.model.js";

const BASE_PUBLIC = path.resolve("./public");

export const uploadFiles = async (req, res) => {
  try {
    const { user, db } = req;
    const parentDirId = req.params.parentDirId
      ? new ObjectId(req.params.parentDirId)
      : user.rootDirId;
    const dirCollection = db.collection("directories");
    const fileCollection = db.collection("files");

    const parentDireData = await dirCollection.findOne({
      _id: parentDirId,
      userId: user._id,
    });

    if (!parentDireData) {
      return res
        .status(403)
        .json({ error: "Unauthorized access to this directory" });
    }

    const filename = req.headers.filename || "untitled";
    const extension = path.extname(filename);

    const insertedFile = await fileCollection.insertOne({
      name: filename,
      extension,
      userId: user._id,
      parentDirId: parentDireData._id,
    });

    const fileId = insertedFile.insertedId.toString();
    const uploadPath = safePath(BASE_PUBLIC, `${fileId}${extension}`);
    const writeStream = createWriteStream(uploadPath);

    // Pipe request directly to write stream
    req.pipe(writeStream);

    // Dhyan dein: writeStream events use karne chahiye
    writeStream.on("finish", () => {
      return res.status(200).json({ message: "File uploaded successfully" });
    });

    writeStream.on("error", async (err) => {
      console.error("Write stream error:", err);
      // Clean up failed files and DB records
      await fileCollection.deleteOne({ _id: new ObjectId(fileId) });
      await rm(uploadPath, { force: true });
      if (!res.headersSent) {
        res.status(500).json({ error: "File write failed" });
      }
    });

    req.on("error", async (err) => {
      console.error("Request stream error:", err);
      writeStream.destroy(); // Stop writing if request drops
      await fileCollection.deleteOne({ _id: new ObjectId(fileId) });
      await rm(uploadPath, { force: true });
      if (!res.headersSent) {
        res.status(500).json({ error: "File upload failed" });
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
    const { user, db } = req;
    if (!req.params.id) {
      return res.status(400).json({ error: "File ID is required" });
    }
    const id = new ObjectId(req.params.id);
    const { newFilename } = req.body;

    const fileDoc = await db
      .collection("files")
      .findOne({ _id: id, userId: user._id });

    if (!fileDoc) {
      return res.status(404).json({ error: "File not found or unauthorized" });
    }

    await db
      .collection("files")
      .updateOne({ _id: fileDoc._id }, { $set: { name: newFilename } });
    res.status(200).json({ message: "File renamed successfully" });
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: "Rename failed" });
  }
};

export const deleteFiles = async (req, res) => {
  try {
    const { user, db } = req;
    if (!req.params.id) {
      return res.status(400).json({ error: "File ID is required" });
    }
    const id = new ObjectId(req.params.id);

    const checkFile = await db
      .collection("files")
      .findOne({ _id: id, userId: user._id });

    if (!checkFile) {
      return res.status(404).json({ error: "File not found or unauthorized" });
    }

    const fileName = `${checkFile._id}${checkFile.extension}`;
    const filePath = safePath(BASE_PUBLIC, fileName);

    await rm(filePath, { force: true });
    await db.collection("files").deleteOne({ _id: id });
    res.status(200).json({ message: "File deleted successfully" });
  } catch (err) {
    console.error("DELETE ERROR:", err);
    res.status(500).json({ error: "Delete failed" });
  }
};

export const getFile = async (req, res) => {
  const { user, db } = req;
  if (!req.params.id) {
    return res.status(400).json({ error: "File ID is required" });
  }
  const id = new ObjectId(req.params.id);
  const fileCollection = db.collection("files");

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
