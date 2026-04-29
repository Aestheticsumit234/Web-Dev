import "dotenv/config";
import app from "./src/app.js";
import connectDB from "./src/common/config/db.js";

const PORT = process.env.PORT || 4000;
const start = async () => {
  await connectDB();
  app.listen(PORT, () =>
    console.log(
      `Server listening on port ${PORT} in ${process.env.NODE_ENV} mode`,
    ),
  );
};

start().catch((err) => {
  console.log(`Error starting server: ${err}`);
  process.exit(1);
});
