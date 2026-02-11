import express from "express";
import {
  createDirectory,
  readDirectory,
} from "../controllers/directory.contoller.js";

const router = express.Router();

router.get("/?*", readDirectory);

router.post("/?*", createDirectory);

export default router;
