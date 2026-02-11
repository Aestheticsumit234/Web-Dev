import { mkdir, readdir, stat } from "fs/promises";
import path from "path";

const BASE_PUBLIC = path.resolve("./public");
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

export const readDirectory = async (req, res) => {
  try {
    const { 0: dirname = "" } = req.params;

    const fullDirPath = safePath(BASE_PUBLIC, dirname);

    const fileList = await readdir(fullDirPath);

    const resData = [];
    for (const file of fileList) {
      const filePath = path.join(fullDirPath, file);
      const stats = await stat(filePath);

      resData.push({ item: file, isDirectory: stats.isDirectory() });
    }
    res.json(resData);
  } catch (err) {
    console.log(err);
    res.status(400).json({ error: "Invalid directory path" });
  }
};

export const createDirectory = async (req, res) => {
  try {
    const { 0: dirname = "" } = req.params;

    const fullPath = safePath(BASE_PUBLIC, dirname);

    await mkdir(fullPath, { recursive: true });

    res.json({ message: "Folder created successfully" });
  } catch (err) {
    res.status(400).json({ error: "Invalid folder path" });
  }
};
