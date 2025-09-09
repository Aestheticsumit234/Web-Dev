import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { AddTodo } from "../Feature/todo/todoSlice";

const AddForm = () => {
  const [input, setInput] = useState("");
  const Dispatch = useDispatch()

  const addTodo = () => {
    if (input.trim() === "") return;
    Dispatch(AddTodo(input))
    setInput("");
  };

  

  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Add a new task..."
      />
      <button
        onClick={addTodo}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
      >
        Add
      </button>
    </div>
  );
};

export default AddForm;
