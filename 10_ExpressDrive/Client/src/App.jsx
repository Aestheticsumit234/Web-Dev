import React from "react";
import { Route, Router, Routes } from "react-router-dom";
import DirectoryView from "./DirectoryView";

const App = () => {
  return (
    <Routes>
      <Route path="/*" element={<DirectoryView />} />
    </Routes>
  );
};

export default App;
