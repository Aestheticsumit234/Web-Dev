import { rm } from "fs/promises";
import path from "path"; // delete krna hai
import { safePath } from "../utils/safePath.js"; // iska koi kaam nhi hai ab
import { ObjectId } from "mongodb";

const BASE_PUBLIC = path.resolve("./public");

// read directory contents
export const readDirectory = async (req, res) => {
  try {
    const { user, db } = req;
    const id = req.params.id
      ? new ObjectId(req.params.id)
      : new ObjectId(user.rootDirId);
    const dirCollection = db.collection("directories");

    const directoriesData = await dirCollection.findOne({
      _id: id,
      userId: user._id,
    });

    if (!directoriesData) {
      return res.status(404).json({ message: "Directory not found" });
    }
    const file = await db
      .collection("files")
      .find({ parentDirId: directoriesData._id })
      .toArray();
    const directories = await dirCollection
      .find({ parentDirId: directoriesData._id })
      .toArray();

    res.json({
      ...directoriesData,
      file,
      directories,
    });
  } catch (error) {
    console.error("Read Directory Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const createDirectory = async (req, res) => {
  try {
    const { user, db } = req;
    const parentDirId = req.params.parentdirId
      ? new ObjectId(req.params.parentdirId)
      : user.rootDirId;
    const dirname = req.headers.dirname;
    const dirCollection = db.collection("directories");

    const parentDir = await dirCollection.findOne({ _id: parentDirId });

    if (!parentDir) {
      return res
        .status(403)
        .json({ error: "Parent directory not found or unauthorized" });
    }

    const saveDir = await dirCollection.insertOne({
      name: dirname,
      userId: user._id,
      parentDirId,
    });

    res.json({ message: "Directory created successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const renameDirectory = async (req, res) => {
  try {
    const { user, db } = req;
    const { id } = req.params;
    const { newFilename } = req.body;
    const dirCollection = db.collection("directories");

    if (!id || !newFilename) {
      return res.status(400).json({ error: "Invalid data" });
    }

    const dirData = await dirCollection.findOne({
      _id: new ObjectId(id),
      userId: user._id,
    });

    if (!dirData) {
      return res
        .status(403)
        .json({ error: "Directory not found or unauthorized" });
    }

    await dirCollection.updateOne(
      { _id: dirData._id },
      { $set: { name: newFilename } },
    );
    res.json({ message: "Directory renamed successfully" });
  } catch (error) {
    console.error("Rename Directory Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const deleteDirectory = async (req, res) => {
  try {
    const { user, db } = req;
    const id = req.params.id ? new ObjectId(req.params.id) : user.rootDirId;
    const dirCollection = db.collection("directories");
    const fileCollection = db.collection("files");

    const dirData = await dirCollection.findOne(
      { _id: id, userId: user._id },
      { projection: { _id: 1 } },
    );

    if (!dirData) {
      return res
        .status(403)
        .json({ error: "Directory not found or unauthorized" });
    }
    const getDirectoryContents = async (parentId) => {
      let fileData = await fileCollection
        .find(
          { parentDirId: parentId },
          { projection: { _id: 1, extension: 1 } },
        )
        .toArray();
      let Directories = await dirCollection
        .find({ parentDirId: parentId }, { projection: { _id: 1 } })
        .toArray();
      for (let { _id, name } of Directories) {
        const { fileData: childFile, Directories: childDirectories } =
          await getDirectoryContents(new ObjectId(_id));

        fileData = [...fileData, ...childFile];
        Directories = [...Directories, ...childDirectories];
      }

      return {
        fileData,
        Directories,
      };
    };

    const { fileData, Directories } = await getDirectoryContents(id);

    for (let { _id, extension } of fileData) {
      const filePath = safePath(BASE_PUBLIC, `${_id}${extension}`);
      await rm(filePath, { force: true });
    }

    await fileCollection.deleteMany({
      _id: { $in: fileData.map((id) => id._id) },
    });
    await dirCollection.deleteMany({
      _id: { $in: [...Directories.map((id) => id._id), id] },
    });

    await dirCollection.deleteOne({ _id: id });
    res.json({ message: "Directory and all contents deleted successfully" });
  } catch (error) {
    console.error("Delete Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
