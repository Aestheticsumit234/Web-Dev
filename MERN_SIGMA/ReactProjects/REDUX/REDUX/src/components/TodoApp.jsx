import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import AddForm from "./AddForm";
import { DeleteTodo, MarkAsCompleted } from "../Feature/todo/todoSlice";

export default function TodoApp() {
  const Todos = useSelector((state) => state.todo.todos);
  const Dispatch = useDispatch();
  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-2xl shadow-lg">
      <h1 className="text-2xl font-bold text-center mb-4">Todo App</h1>

      {/* Input */}
      <AddForm />

      {/* Todo List */}
      <ul className="mt-4 space-y-3">
        {Todos.map((todo) => (
          <li
            key={todo.id}
            className="flex items-center justify-between p-3 bg-gray-100 rounded-lg"
          >
            <span
              className={`flex-1 ${
                todo.completed ? "line-through text-gray-500" : ""
              }`}
            >
              {todo.title}
            </span>

            {/* Mark as Done Button */}
            <button
              onClick={() => Dispatch(MarkAsCompleted(todo.id))}
              className={`px-3 py-1 rounded-lg text-sm font-medium ${
                todo.completed
                  ? "bg-green-200 text-green-800"
                  : "bg-green-500 text-white hover:bg-green-600"
              }`}
            >
              {todo.completed ? "Undo" : "Done"}
            </button>

            {/* Delete Button */}
            <button
              onClick={() => Dispatch(DeleteTodo(todo.id))}
              className="ml-2 px-3 py-1 rounded-lg text-sm bg-red-500 text-white hover:bg-red-600"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
