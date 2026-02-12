import express from "express";
import {
  deleteFiles,
  downloadFiles,
  renameFiles,
  uploadFiles,
} from "../controllers/files.controller.js";

const router = express.Router();

router.post("/:filename(*)", uploadFiles);
router.patch("/*", renameFiles);
router.get("/:filePath(*)", downloadFiles);
router.delete("/:filePath(*)", deleteFiles);

export default router;
