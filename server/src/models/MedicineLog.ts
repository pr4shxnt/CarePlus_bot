import mongoose, { Schema, Document } from "mongoose";

export interface IMedicineLog extends Document {
  patientId: mongoose.Types.ObjectId;
  medicineName: string;
  dosage: string;
  scheduledTime: string;
  takenAt: Date;
  status: "taken" | "missed" | "skipped";
  createdAt: Date;
  updatedAt: Date;
}

const MedicineLogSchema = new Schema<IMedicineLog>(
  {
    patientId: { type: Schema.Types.ObjectId, ref: "Patient", required: true, index: true },
    medicineName: { type: String, required: true },
    dosage: { type: String, default: "" },
    scheduledTime: { type: String, default: "" },
    takenAt: { type: Date, required: true },
    status: { type: String, enum: ["taken", "missed", "skipped"], required: true },
  },
  { timestamps: true }
);

// Index for reporting
MedicineLogSchema.index({ patientId: 1, takenAt: -1 });

export const MedicineLog = mongoose.model<IMedicineLog>("MedicineLog", MedicineLogSchema);
