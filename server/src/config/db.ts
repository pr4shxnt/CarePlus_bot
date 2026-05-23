import mongoose from "mongoose";

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 3000;

export async function connectDB(uri: string): Promise<void> {
  let attempt = 0;
  while (attempt < MAX_RETRIES) {
    try {
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log(`🍃 MongoDB connected: ${uri.replace(/\/\/.*@/, "//***@")}`);
      return;
    } catch (err) {
      attempt++;
      console.error(`MongoDB connection failed (attempt ${attempt}/${MAX_RETRIES}):`, (err as Error).message);
      if (attempt < MAX_RETRIES) await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
    }
  }
  console.error("Could not connect to MongoDB. Exiting.");
  process.exit(1);
}

mongoose.connection.on("disconnected", () => console.warn("⚠️ MongoDB disconnected."));
mongoose.connection.on("reconnected", () => console.log("🔄 MongoDB reconnected."));
