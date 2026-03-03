import { rm } from "fs/promises";
import { ObjectId } from "mongodb";
const BASE_PUBLIC = path.resolve("./public");
import path from "path";
import { safePath } from "../utils/safePath.js";
import Directory from "../model/directory.model.js";
import File from "../model/Files.model.js";

// read directory contents completed
export const readDirectory = async (req, res) => {
  try {
    const { user, db } = req;
    const id = req.params.id || user.rootDirId;

    const directoriesData = await Directory.findOne({
      _id: id,
      userId: user._id,
    });

    if (!directoriesData) {
      return res.status(404).json({ message: "Directory not found" });
    }
    const file = await File.find({
      parentDirId: directoriesData._id,
    }).lean();
    const directories = await Directory.find({
      parentDirId: directoriesData._id,
    }).lean();

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

// create directory completed
export const createDirectory = async (req, res) => {
  try {
    const { user } = req;
    const parentDirId = req.params.parentdirId || user.rootDirId;
    const dirname = req.headers.dirname;

    const parentDir = await Directory.findOne({
      _id: parentDirId,
      userId: user._id,
    });

    if (!parentDir) {
      return res
        .status(403)
        .json({ error: "Parent directory not found or unauthorized" });
    }

    await Directory.insertOne({
      name: dirname,
      userId: user._id,
      parentDirId,
    });

    res.json({ message: "Directory created successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// rename directory completed
export const renameDirectory = async (req, res) => {
  try {
    const { user, db } = req;
    const { id } = req.params;
    const { newFilename } = req.body;

    if (!id || !newFilename) {
      return res.status(400).json({ error: "Invalid data" });
    }

    const dirData = await Directory.findById({
      _id: id,
      userId: user._id,
    });

    if (!dirData) {
      return res
        .status(403)
        .json({ error: "Directory not found or unauthorized" });
    }

    await Directory.updateOne(
      { _id: dirData._id },
      { $set: { name: newFilename } },
    );
    res.json({ message: "Directory renamed successfully" });
  } catch (error) {
    console.error("Rename Directory Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// delete directory
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
      for (let { _id } of Directories) {
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
