// reducers
import { createSlice } from "@reduxjs/toolkit";
const initialState = {
  todos: [],
};

 const todoSlice = createSlice({
  name: "todo",
  initialState,
  reducers: {
    AddTodo: (state, action) => {
        const newTodo = {
            id: Date.now(),
            title: action.payload,
            completed: false
        }
        state.todos.push(newTodo)
    },
    DeleteTodo: (state, action) => {
        state.todos = state.todos.filter((todo) => todo.id !== action.payload)
    },

    MarkAsCompleted: (state, action) => {
        const todo = state.todos.find((todo) => todo.id === action.payload)
        todo.completed = !todo.completed
    },

  },
});

export const { AddTodo, DeleteTodo, MarkAsCompleted } = todoSlice.actions;
export default todoSlice.reducer;