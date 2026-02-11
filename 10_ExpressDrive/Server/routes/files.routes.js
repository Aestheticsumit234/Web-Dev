import express from "express";
import {
  deleteFiles,
  downloadFiles,
  renameFiles,
  uploadFiles,
} from "../controllers/files.controller.js";

const router = express.Router();

router.get("/:filePath(*)", downloadFiles);
router.delete("/:filePath(*)", deleteFiles);
router.patch("/*", renameFiles);
router.post("/*", uploadFiles);

export default router;
