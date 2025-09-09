import { configureStore } from "@reduxjs/toolkit";
import todoReducer from "../Feature/todo/todoSlice.js";

// Load state from localStorage
const savedState = JSON.parse(localStorage.getItem("reduxState")) || undefined;

export const store = configureStore({
  reducer: {
    todo: todoReducer, 
  },
  preloadedState: savedState, 
});

// Save state to localStorage
store.subscribe(() => {
  localStorage.setItem("reduxState", JSON.stringify(store.getState()));
});
