import { MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

export const client = new MongoClient(process.env.MONGO_URL);

const connectDB = async () => {
  await client.connect();
  const db = client.db();
  console.log("Database connected Sucessfully!");
  return db;
};

process.on("SIGINT", async () => {
  await client.close();
  console.log("Database Disconnected Sucessfully!");
  process.exit(0);
});

export default connectDB;
