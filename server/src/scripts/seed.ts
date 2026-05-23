/**
 * Comprehensive Seed script — establishes a fully linked ecosystem.
 * Run: bun src/scripts/seed.ts
 */
import "dotenv/config";
import mongoose from "mongoose";
import { User } from "../models/User";
import { Patient } from "../models/Patient";
import { Session } from "../models/Session";
import { v4 as uuidv4 } from "uuid";

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/jarvis";

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB. Establishing fully linked ecosystem...");

  // Clear existing seed data to prevent duplicates
  const testEmails = [
    "doctor@jarvis.dev", 
    "guardian@jarvis.dev", 
    "admin@jarvis.dev", 
    "prashant@careplus.com"
  ];
  await User.deleteMany({ email: { $in: testEmails } });
  await Patient.deleteMany({ botId: { $in: ["pi_demo_01", "bot_1", "664f1234567890abcdef1234"] } });
  await Session.deleteMany({ botId: { $in: ["bot_1", "pi_demo_01"] } });

  // 1. Create Doctor
  const doctor = await new User({
    name: "Dr. Sharma",
    email: "doctor@jarvis.dev",
    passwordHash: "doctor1234",
    role: "doctor",
    specialization: "Geriatric Medicine",
    licenseNumber: "NMC-12345",
  }).save();

  // 2. Create Guardian
  const guardian = await new User({
    name: "Ram Adhikari",
    email: "guardian@jarvis.dev",
    passwordHash: "guardian1234",
    role: "guardian",
    patientBotId: "bot_1",
    relationship: "Son",
  }).save();

  // 3. Create Patient User (Prashant Adhikari)
  // Using the specific ID mentioned in the bot logic for hard-coding consistency
  const patientUser = new User({
    _id: new mongoose.Types.ObjectId("664f1234567890abcdef1234"),
    name: "Prashant Adhikari",
    email: "prashant@careplus.com",
    passwordHash: "patient1234",
    role: "patient",
  });
  await patientUser.save();

  // 4. Create Patient Record linked to Doctor and Guardian
  const patientRecord = new Patient({
    _id: patientUser._id, // Share the same ID as the User record
    name: "Prashant Adhikari",
    botId: "bot_1", // The bot uses this to identify itself
    age: 24,
    gender: "male",
    bloodGroup: "A+",
    conditions: ["General Wellness", "Stress Management"],
    allergies: ["None"],
    medicines: [
      { 
        name: "Vitamin D", 
        dosage: "1000 IU", 
        frequency: "daily", 
        times: ["08:00"],
        notes: "Take after breakfast" 
      },
      { 
        name: "Magnesium", 
        dosage: "200mg", 
        frequency: "daily", 
        times: ["21:00"],
        notes: "Helps with sleep" 
      },
    ],
    assignedDoctorId: doctor._id,
    guardianId: guardian._id,
    notes: "Patient is focused on improving sleep and managing workplace stress.",
  });
  await patientRecord.save();

  // 5. Create Mock Chat Sessions & Mood Summaries
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  await new Session({
    botId: "bot_1",
    sessionId: uuidv4(),
    patientId: patientRecord._id,
    startedAt: new Date(yesterday.getTime() - 1000 * 60 * 15), // 15 mins ago
    endedAt: yesterday,
    durationSeconds: 900,
    turns: [
      { role: "user", content: "I'm feeling a bit tired today." },
      { role: "assistant", content: "I'm sorry to hear that, Prashant. Have you been sleeping well lately?" },
      { role: "user", content: "Not really, work has been stressful." },
      { role: "assistant", content: "I understand. Stress can definitely impact your sleep quality. Make sure to take your Magnesium at 9 PM; it might help you relax." },
    ],
    analyses: [{
      mood: "Anxious",
      mood_intensity: 7,
      medicine_log: [{ name: "Vitamin D", status: "taken" }],
      forgotten_items: []
    }],
    report: "Prashant reported feeling tired due to work stress. His morning Vitamin D was taken, but he is struggling with sleep consistency.",
    reportStatus: "pending",
  }).save();

  // Create an approved session from 2 days ago
  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

  await new Session({
    botId: "bot_1",
    sessionId: uuidv4(),
    patientId: patientRecord._id,
    startedAt: new Date(twoDaysAgo.getTime() - 1000 * 60 * 10),
    endedAt: twoDaysAgo,
    durationSeconds: 600,
    turns: [
      { role: "user", content: "Good morning!" },
      { role: "assistant", content: "Good morning, Prashant! You look well today. How was your night?" },
      { role: "user", content: "Great! I slept 8 hours." },
    ],
    analyses: [{
      mood: "Happy",
      mood_intensity: 9,
      medicine_log: [{ name: "Magnesium", status: "taken" }],
      forgotten_items: []
    }],
    report: "Patient had a restful night and expressed positive mood. Adherence to evening medication is yielding good results.",
    reportStatus: "approved",
    reviewedBy: doctor._id,
    reviewedAt: new Date(),
    doctorNotes: "Great progress. Keep monitoring the sleep patterns.",
  }).save();

  console.log("\n✅ Comprehensive Seed complete!\n");
  console.log("  Doctor:   doctor@jarvis.dev   / doctor1234");
  console.log("  Guardian: guardian@jarvis.dev / guardian1234");
  console.log("  Patient:  prashant@careplus.com / patient1234");
  console.log("\n  Hardware Bot 'bot_1' is now linked to Prashant Adhikari.");
  console.log("  Records for Vitamin D and Magnesium are synced.\n");

  await mongoose.disconnect();
}

seed().catch((e) => { console.error(e); process.exit(1); });
