import mongoose, { Schema, Document } from "mongoose";

export interface IMedicineLog extends Document {
  userId: string;
  medicineName: string;
  dosage: string;
  scheduledTime: string;
  takenAt: Date | null;
  status: "taken" | "missed" | "skipped";
  timestamp: Date;
}

const MedicineLogSchema: Schema = new Schema({
  userId: { type: String, required: true, index: true },
  medicineName: { type: String, required: true },
  dosage: { type: String, default: "" },
  scheduledTime: { type: String, default: "" },
  takenAt: { type: Date, default: null },
  status: {
    type: String,
    enum: ["taken", "missed", "skipped"],
    default: "taken",
  },
  timestamp: { type: Date, default: Date.now, index: true },
});

// Compound index for efficient date-range queries per user
MedicineLogSchema.index({ userId: 1, timestamp: -1 });

export default mongoose.model<IMedicineLog>("MedicineLog", MedicineLogSchema);
