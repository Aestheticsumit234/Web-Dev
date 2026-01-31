import app from "./src/app.js";
import dotenv from "dotenv";
import connedDB from "./src/db/db.js";

dotenv.config();

const PORT = process.env.PORT || 8000;

connedDB()
  .then(() => {
    app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
  })
  .catch((error) => {
    console.log("Database Connection failed", error);
  });
