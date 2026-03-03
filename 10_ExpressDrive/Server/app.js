import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

import directoryRouter from "./routes/directory.routes.js";
import filesRoutes from "./routes/files.routes.js";
import trashRoutes from "./routes/trash.routes.js";
import authRoutes from "./routes/auth.routes.js";
import connectDB from "./Storage/connectDB.js";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// All Middlewares yaha hai
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST", "PATCH", "DELETE"],
    credentials: true,
  }),
);

// Routes
app.use("/auth", authRoutes);
app.use("/directory", directoryRouter);
app.use("/files", filesRoutes);
app.use("/trash", trashRoutes);

// Server Connection and db connectionm
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
