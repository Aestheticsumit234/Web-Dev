import { Router } from "express";
import { helthcheck } from "../controllers/helthcheck.controllers.js";

const router = Router();

router.get("/", helthcheck);

export default router;
