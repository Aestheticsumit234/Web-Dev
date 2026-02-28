import { createWriteStream } from "fs";
import fs from "fs/promises";
import { rm } from "fs/promises";
import path from "path";
import { safePath } from "../utils/safePath.js";
import { ObjectId } from "mongodb";

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
    req.pipe(writeStream);

    req.on("end", async () => {
      return res.status(200).json({ message: "File uploaded successfully" });
    });

    req.on("error", async (err) => {
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
    const id = req.params.id ? new ObjectId(req.params.id) : user.rootDirId;
    const { newFilename } = req.body;

    const filePath = await db
      .collection("files")
      .findOne({ _id: id, userId: user._id });

    if (!filePath) {
      return res.status(404).json({ error: "File not found or unauthorized" });
    }

    await db
      .collection("files")
      .updateOne({ _id: filePath._id }, { $set: { name: newFilename } });
    res.status(200).json({ message: "File renamed successfully" });
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: "Rename failed" });
  }
};

export const deleteFiles = async (req, res) => {
  try {
    const { user, db } = req;
    const id = req.params.id ? new ObjectId(req.params.id) : user.rootDirId;

    const checkFile = await db
      .collection("files")
      .findOne({ _id: id, userId: user._id });

    if (!checkFile) {
      return res.status(404).json({ error: "File not found in database" });
    }

    const fileName = `${checkFile._id}${checkFile.extension}`;
    console.log("-->", fileName);
    const filePath = safePath(BASE_PUBLIC, fileName);

    await rm(filePath, { force: true });
    await db.collection("files").deleteOne({ _id: id });

    // FileJsonData.splice(fileIndex, 1);

    // const parentDirData = DirectoriesDB.find(
    //   (dir) => dir.id === fileData.parentDirId,
    // );

    // if (parentDirData && Array.isArray(parentDirData.files)) {
    //   parentDirData.files = parentDirData.files.filter(
    //     (fileId) => fileId !== id,
    //   );
    // }

    // await writeFile("./filesDB.json", JSON.stringify(FileJsonData, null, 2));
    // await writeFile(
    //   "./DirectoriesDB.json",
    //   JSON.stringify(DirectoriesDB, null, 2),
    // );

    res.status(200).json({ message: "File deleted successfully" });
  } catch (err) {
    console.error("DELETE ERROR:", err);
    res.status(500).json({ error: "Delete failed" });
  }
};

export const getFile = async (req, res) => {
  const { user, db } = req;
  const id = req.params.id ? new ObjectId(req.params.id) : user.rootDirId;
  const fileCollection = db.collection("files");

  const fileData = await fileCollection.findOne({ _id: id });

  if (!fileData) {
    return res.status(404).json({ error: "File not found or unauthorized" });
  }

  const { extension } = fileData;
  const filePath = `${id}${extension}`;

  try {
    const safe = safePath(BASE_PUBLIC, filePath);

    if (req.query.action === "download") {
      return res.download(safe, fileData.name);
    }

    res.sendFile(safe);
  } catch (err) {
    console.log(err);
    return res.status(400).json({ error: "Invalid file path" });
  }
};
