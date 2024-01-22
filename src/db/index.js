import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
  try {
    const ConnectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URL}/${DB_NAME}`
    );
    console.log(`\n MongoDB Conneted DB Host: ${ConnectionInstance.connection.host}`);
  } catch (error) {
    console.log("mongoose Connection failed", error);
    process.exit(1);
  }
};

export default connectDB;
