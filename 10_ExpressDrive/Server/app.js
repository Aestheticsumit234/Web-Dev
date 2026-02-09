import { log } from "console";
import express from "express";
import { createWriteStream } from "fs";
import { mkdir, readdir, rename, rm } from "fs/promises";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const PORT = process.env.PORT || 8080;

app.use((req, res, next) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "*");
  res.set("Access-Control-Allow-Headers", "*");
  next();
});
// GET function(list)
app.get("/", async (req, res) => {
  const fileList = await readdir("./public");
  res.json(fileList);
});
// yaha Trash ka function likha hai
app.get("/trash", async (req, res) => {
  const fileList = await readdir("./Trash");
  res.json(fileList);
});

// GET function(download)
app.get("/:filename", async (req, res) => {
  const { filename } = req.params;
  if (req.query.action === "download") {
    res.set("Content-Disposition", "attachment");
  }
  res.sendFile(`${import.meta.dirname}/public/${filename}`);
});

// DELETE function(move to trash)
app.delete("/:filename", async (req, res) => {
  const { filename } = req.params;
  const filepath = `./public/${filename}`;
  const trashPath = `./trash/${filename}`;
  try {
    await mkdir("./Trash", { recursive: true });
    await rename(filepath, trashPath);
    res.status(200).json({ message: "File deleted successfully" });
  } catch (error) {
    console.log(error);
  }
});
// PATCH function(rename)
app.patch("/:filename", async (req, res) => {
  const { filename } = req.params;
  const { newFilename } = req.body;
  const filepath = `./public/${filename}`;
  const newFilepath = `./public/${newFilename}`;
  try {
    await rename(filepath, newFilepath);
    res.status(200).json({ message: "File renamed successfully" });
  } catch (error) {
    console.log(error);
  }
});

app.post("/:filename", async (req, res) => {
  const { filename } = req.params;
  const filepath = `./public/${filename}`;
  try {
    const writeStream = createWriteStream(filepath);
    req.pipe(writeStream);
    res.status(200).json({ message: "File uploaded successfully" });
  } catch (error) {}
});

// trash to public
app.post("/trash/:filename", async (req, res) => {
  const { filename } = req.params;
  const filepath = `./Trash/${filename}`;
  const publicPath = `./public/${filename}`;
  try {
    await rename(filepath, publicPath);
    res.status(200).json({ message: "File restored successfully" });
  } catch (error) {
    console.log(error);
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
