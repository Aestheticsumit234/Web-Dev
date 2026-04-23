import type { Request, Response } from "express";
import {
  todoValidationSchemema,
  type Todo,
} from "../validation/todo.schema.js";

class todoController {
  private _db: Todo[];

  constructor() {
    this._db = [];
  }

  public handleGetAllTodo(req: Request, res: Response) {
    const todos = this._db;
    return res.json({ todos });
  }

  public async handleInsertTodo(req: Request, res: Response) {
    try {
      const rowData = req.body;
      const todo = await todoValidationSchemema.parseAsync(rowData);
      this._db.push(todo);
      return res.status(201).json({ todo });
    } catch (error) {
      return res.status(400).json({ error });
    }
  }

  public async handleGetTodoById(req: Request, res: Response) {
    try {
      const id = req.params.id;
      const todo = this._db.find((todo) => todo.id === id);
      return res.json({ todo });
    } catch (error) {
      return res.status(400).json({ error });
    }
  }

  public async handleUpdateTodo(req: Request, res: Response) {
    try {
      const id = req.params.id;
      console.log(id);
      const rowData = req.body;
      console.log(rowData);
      const todo = await todoValidationSchemema.parseAsync(rowData);
      const index = this._db.findIndex((todo) => todo.id === id);
      this._db[index] = todo;
      return res.json({ todo });
    } catch (error) {
      return res.status(400).json({ error });
    }
  }

  public async handleDeleteTodo(req: Request, res: Response) {
    try {
      const id = req.params.id;
      const todo = this._db.find((todo) => todo.id === id);
      const index = this._db.findIndex((todo) => todo.id === id);
      this._db.splice(index, 1);
      return res.json({ todo });
    } catch (error) {
      return res.status(400).json({ error });
    }
  }
}

export default todoController;

// t5hi
