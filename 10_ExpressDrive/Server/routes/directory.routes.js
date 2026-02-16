import express from "express";
import {
  createDirectory,
  readDirectory,
  renameDirectory,
  deleteDirectory,
} from "../controllers/directory.contoller.js";

const router = express.Router();

router.get("/:id?", readDirectory);
router.post("/:parentdirId?", createDirectory);
router.patch("/:id", renameDirectory);
router.delete("/:id", deleteDirectory);

export default router;
