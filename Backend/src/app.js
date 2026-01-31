import express from "express";
import cookieParser from "cookie-parser";
import helthcheckRouter from "./routes/helthcheck.routes.js";
import userRouter from "./routes/user.routes.js";
import { ApiError } from "./utils/api-error.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/v1/helthcheck", helthcheckRouter);
app.use("/api/v1/users", userRouter);

// Global error handler
app.use((err, req, res, next) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors,
    });
  }

  console.error("Unexpected Error:", err);
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
});

export default app;
