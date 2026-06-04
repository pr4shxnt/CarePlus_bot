import "dotenv/config";
import mongoose from "mongoose";
import { generateDailyReportsForToday } from "../services/report.service";
import { Report } from "../models/Report";

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/jarvis";

async function main() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB.");

  // Delete today's report if it exists, to make sure it's completely fresh
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const dateStr = `${year}-${month}-${day}`;

  const deleted = await Report.deleteMany({ date: dateStr });
  console.log(`Deleted ${deleted.deletedCount} existing report(s) for date ${dateStr}.`);

  console.log("Generating daily reports...");
  await generateDailyReportsForToday();
  console.log("Daily report generated successfully!");
  
  await mongoose.disconnect();
}

main().catch(console.error);
