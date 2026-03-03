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
    const { user } = req;
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
    const { user } = req;
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
export const deleteDirectory = async (req, res, next) => {
  try {
    const { user } = req;
    const id = req.params.id;

    if (!id) {
      return res.status(400).json({ error: "Directory ID is required" });
    }
    const dirData = await Directory.findOne({ _id: id, userId: user._id });

    if (!dirData) {
      return res
        .status(403)
        .json({ error: "Directory not found or unauthorized" });
    }

    const getDeepContents = async (parentId) => {
      let allFiles = await File.find({ parentDirId: parentId });
      let allDirs = await Directory.find({ parentDirId: parentId });

      for (const subDir of allDirs) {
        const childContent = await getDeepContents(subDir._id);
        allFiles = [...allFiles, ...childContent.allFiles];
        allDirs = [...allDirs, ...childContent.allDirs];
      }

      return { allFiles, allDirs };
    };

    const { allFiles, allDirs } = await getDeepContents(id);

    for (const file of allFiles) {
      const fileName = `${file._id}${file.extension}`;
      const filePath = safePath(BASE_PUBLIC, fileName);

      try {
        await rm(filePath, { force: true });
      } catch (err) {
        console.error(`Failed to delete physical file: ${filePath}`, err);
      }
    }

    const fileIds = allFiles.map((f) => f._id);
    const dirIds = allDirs.map((d) => d._id);

    dirIds.push(id);

    if (fileIds.length > 0) {
      await File.deleteMany({ _id: { $in: fileIds } });
    }

    await Directory.deleteMany({ _id: { $in: dirIds } });

    res.json({
      message: "Directory and all contents deleted successfully",
      deletedFiles: fileIds.length,
      deletedFolders: dirIds.length,
    });
  } catch (error) {
    console.error("Delete Error:", error);
    next(error);
  }
};
