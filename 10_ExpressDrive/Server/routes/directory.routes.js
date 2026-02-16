import express from "express";
import {
  createDirectory,
  readDirectory,
} from "../controllers/directory.contoller.js";

const router = express.Router();

router.get("/:id?", readDirectory);

router.post("/:parentdirId?", createDirectory);

export default router;
