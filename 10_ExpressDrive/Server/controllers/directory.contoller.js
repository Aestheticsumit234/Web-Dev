import { rm, writeFile } from "fs/promises";
import path from "path"; // delete krna hai
import { safePath } from "../utils/safePath.js"; // iska koi kaam nhi hai ab
import DirectoriesDB from "../DirectoriesDB.json" with { type: "json" }; // delete krna hai
import filesDataJSON from "../filesDB.json" with { type: "json" }; // dele krna hai
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

// when i done the file controller i will do it for file in directory and then i will do it for directory and file together because when i delete directory i need to delete all files in this directory and all sub directories and all files in sub directories
export const deleteDirectory = async (req, res) => {
  try {
    const { user, db } = req;
    const id = req.params.id ? new ObjectId(req.params.id) : user.rootDirId;

    if (!id) {
      return res.status(400).json({ error: "Directory ID required" });
    }

    const targetDir = DirectoriesDB.find(
      (d) => d.id === id && d.userId === userId,
    );

    if (!targetDir) {
      return res
        .status(403)
        .json({ error: "Directory not found or unauthorized" });
    }

    const recursiveDelete = async (dirId) => {
      const dirIndex = DirectoriesDB.findIndex((d) => d.id === dirId);
      if (dirIndex === -1) return;

      const dirData = DirectoriesDB[dirIndex];

      if (dirData.files) {
        for (const fileId of dirData.files) {
          const fIndex = filesDataJSON.findIndex((f) => f.id === fileId);
          if (fIndex !== -1) {
            const file = filesDataJSON[fIndex];
            const physicalPath = safePath(
              BASE_PUBLIC,
              `${file.id}${file.extension}`,
            );
            try {
              await rm(physicalPath, { force: true });
            } catch (err) {
              console.error(`Failed to delete physical file: ${physicalPath}`);
            }
            filesDataJSON.splice(fIndex, 1);
          }
        }
      }

      if (dirData.directories) {
        for (const subDirId of [...dirData.directories]) {
          await recursiveDelete(subDirId);
        }
      }

      DirectoriesDB.splice(dirIndex, 1);
    };

    const parentId = targetDir.parentDirId;
    await recursiveDelete(id);

    const parentDir = DirectoriesDB.find((d) => d.id === parentId);
    if (parentDir && parentDir.directories) {
      parentDir.directories = parentDir.directories.filter((dId) => dId !== id);
    }

    await Promise.all([
      writeFile("./filesDB.json", JSON.stringify(filesDataJSON, null, 2)),
      writeFile("./DirectoriesDB.json", JSON.stringify(DirectoriesDB, null, 2)),
    ]);

    res.json({ message: "Directory and all contents deleted successfully" });
  } catch (error) {
    console.error("Delete Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
