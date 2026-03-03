import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const connectDBS = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Database connected successfully!!");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
};

export default connectDBS;
