import express from "express";
import {
  createDirectory,
  readDirectory,
  renameDirectory,
  deleteDirectory,
} from "../controllers/directory.contoller.js";
import { authenticateUser } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/:id?", authenticateUser, readDirectory);
router.post("/:parentdirId?", authenticateUser, createDirectory);
router.patch("/:id", authenticateUser, renameDirectory);
router.delete("/:id", authenticateUser, deleteDirectory);

export default router;
