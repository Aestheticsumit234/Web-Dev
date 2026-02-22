import express from "express";
import {
  deleteFiles,
  getFile,
  renameFiles,
  uploadFiles,
} from "../controllers/files.controller.js";
import { authenticateUser } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/:parentDirId?", authenticateUser, uploadFiles);
router.get("/:id", authenticateUser, getFile);
router.patch("/:id", authenticateUser, renameFiles);
router.delete("/:id", authenticateUser, deleteFiles);

export default router;
