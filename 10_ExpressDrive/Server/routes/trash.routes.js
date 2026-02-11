import express from "express";
import {
  getTrash,
  permanentDelete,
  restoreTrash,
} from "../controllers/trash.controller.js";

const router = express.Router();

router.get("/", getTrash);
router.post("/:filename", restoreTrash);
router.delete("/:filename(*)", permanentDelete);

export default router;
