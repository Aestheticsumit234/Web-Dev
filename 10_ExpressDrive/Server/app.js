import express from "express";
import cors from "cors";

import directoryRouter from "./routes/directory.routes.js";
import filesRoutes from "./routes/files.routes.js";
import trashRoutes from "./routes/trash.routes.js";
import authRoutes from "./routes/auth.routes.js";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const PORT = process.env.PORT || 8080;

app.use(
  cors({
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST", "PATCH", "DELETE"],
    credentials: true,
  }),
);

app.use("/users", authRoutes);
app.use("/directory", directoryRouter);
app.use("/files", filesRoutes);
app.use("/trash", trashRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
