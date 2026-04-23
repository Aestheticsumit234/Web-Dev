import express from "express";
import todoController from "./contoller.js";

const router = express.Router();

const controller = new todoController();

router.get("/", controller.handleGetAllTodo.bind(controller));
router.get("/:id", controller.handleGetTodoById.bind(controller));

router.post("/", controller.handleInsertTodo.bind(controller));

router.patch("/:id", controller.handleUpdateTodo.bind(controller));
router.delete("/:id", controller.handleDeleteTodo.bind(controller));

export default router;
