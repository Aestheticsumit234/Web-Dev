import { mkdir, readdir, stat, writeFile } from "fs/promises";
import path from "path";
import { safePath } from "../utils/safePath.js";
import DirectoriesDB from "../DirectoriesDB.json" with { type: "json" };
import filesDataJSON from "../filesDB.json" with { type: "json" };

const BASE_PUBLIC = path.resolve("./public");

export const readDirectory = async (req, res) => {
  try {
    const { id } = req.params;
    const currentDirectory = !id
      ? DirectoriesDB[0]
      : DirectoriesDB.find((folder) => folder.id === id);

    if (!currentDirectory) {
      return res
        .status(404)
        .json({ error: "Directory not found", file: [], directories: [] });
    }
    const file = (currentDirectory.files || [])
      .map((fileId) => filesDataJSON.find((f) => f.id === fileId))
      .filter(Boolean);

    const directories = (currentDirectory.directories || [])
      .map((dirId) => DirectoriesDB.find((d) => d.id === dirId))
      .filter(Boolean);

    res.json({
      ...currentDirectory,
      file,
      directories,
    });
  } catch (error) {
    console.error("Read Directory Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const createDirectory = async (req, res) => {
  try {
    const { dirname } = req.headers;
    const parentDirId = req.params.parentdirId || DirectoriesDB[0].id;
    const id = crypto.randomUUID();

    const fullPath = safePath(BASE_PUBLIC, dirname);

    const parentDir = DirectoriesDB.find((folder) => folder.id === parentDirId);
    parentDir.directories.push(id);

    DirectoriesDB.push({
      id: id,
      name: dirname,
      parentDirId,
      directories: [],
    });
    await writeFile("./DirectoriesDB.json", JSON.stringify(DirectoriesDB));
    res.json({ message: "Directory created successfully" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
