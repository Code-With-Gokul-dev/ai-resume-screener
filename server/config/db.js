import mongoose from "mongoose";
import { setServers } from "node:dns";

setServers(["1.1.1.1", "8.8.8.8"]);

export default async function connectDB() {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is missing. Copy .env.example to .env and fill it in.");
  }

  await mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 8000,
    maxPoolSize: 10,
  });

  console.log("MongoDB connected");
}
