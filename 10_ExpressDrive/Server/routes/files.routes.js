import express from "express";
import {
  deleteFiles,
  getFile,
  renameFiles,
  uploadFiles,
} from "../controllers/files.controller.js";

const router = express.Router();

router.post("/:parentDirId?", uploadFiles);
router.get("/:id", getFile);
router.patch("/:id", renameFiles);
router.delete("/:id", deleteFiles);

export default router;
