import { rm, writeFile } from "fs/promises";
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

    if (!file) {
      return res
        .status(404)
        .json({ error: "File not found", file: [], directories: [] });
    }

    const directories = (currentDirectory.directories || [])
      .map((dirId) => DirectoriesDB.find((d) => d.id === dirId))
      .filter(Boolean);

    if (!directories) {
      return res
        .status(404)
        .json({ error: "Directory not found", file: [], directories: [] });
    }

    res.json({
      ...currentDirectory,
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
    const { dirname } = req.headers;
    const parentDirId = req.params.parentdirId || DirectoriesDB[0].id;
    if (!parentDirId) {
      return res.status(400).json({ error: "Parent directory not found" });
    }

    const id = crypto.randomUUID();

    const fullPath = safePath(BASE_PUBLIC, dirname);

    const parentDir = DirectoriesDB.find((folder) => folder.id === parentDirId);

    if (!parentDir) {
      return res.status(404).json({ error: "Parent directory not found" });
    }

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

export const renameDirectory = async (req, res) => {
  try {
    const { id } = req.params;
    const { newFilename } = req.body;
    if (!id || !newFilename) {
      return res.status(400).json({ error: "Directory not found" });
    }
    const dirData = DirectoriesDB.find((dir) => dir.id === id);

    if (!dirData) {
      return res.status(404).json({ error: "Directory not found" });
    }
    dirData.name = newFilename;
    await writeFile("./DirectoriesDB.json", JSON.stringify(DirectoriesDB));

    res.json({ message: "Directory renamed successfully" });
  } catch (error) {
    console.error("Rename Directory Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const deleteDirectory = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Directory not found" });
    }

    const recursiveDelete = async (dirId) => {
      const dirIndex = DirectoriesDB.findIndex((d) => d.id === dirId);
      if (dirIndex === -1) {
        return res.status(404).json({ error: "Directory not found" });
      }
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

    const targetDir = DirectoriesDB.find((d) => d.id === id);
    if (!targetDir) {
      return res.status(404).json({ error: "Directory not found" });
    }

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
