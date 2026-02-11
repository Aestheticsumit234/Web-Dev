import { readdir, rename, rm, stat } from "fs/promises";
import path from "path";

const BASE_PUBLIC = path.resolve("./public");
const BASE_TRASH = path.resolve("./trash");

function safePath(base, userPath = "") {
  const resolved = path.resolve(base, userPath);

  if (!resolved.startsWith(base)) {
    throw new Error("Path Traversal Attempt Blocked");
  }

  if (userPath.includes("..")) {
    throw new Error("Invalid Path");
  }

  return resolved;
}
export const getTrash = async (req, res) => {
  try {
    const fileList = await readdir(BASE_TRASH);
    res.json(fileList);
  } catch (err) {
    res.status(500).json({ error: "Unable to read trash" });
  }
};

export const permanentDelete = async (req, res) => {
  try {
    const filePath = req.params.filename;
    const fullPath = safePath(BASE_TRASH, filePath);

    const stats = await stat(fullPath);

    if (stats.isDirectory()) {
      await rm(fullPath, { recursive: true, force: true });
      res.json({ message: "Folder deleted permanently" });
    } else {
      await rm(fullPath, { force: true });
      res.json({ message: "File deleted permanently" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Permanent delete failed" });
  }
};

export const restoreTrash = async (req, res) => {
  try {
    const { filename } = req.params;
    const trashed = safePath(BASE_TRASH, filename);
    const publicPath = safePath(BASE_PUBLIC, filename);

    await rename(trashed, publicPath);
    res.status(200).json({ message: "File restored successfully" });
  } catch (error) {
    res.status(400).json({ error: "Restore failed" });
  }
};
