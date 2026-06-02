import mongoose, { Schema, Document } from "mongoose";

export interface IReport extends Document {
  _id: mongoose.Types.ObjectId;
  botId: string;
  patientId: mongoose.Types.ObjectId;
  date: string; // YYYY-MM-DD format
  summary: string; // AI-generated text report
  analyses: any[]; // Aggregated analyses (moods, medicine logs)
  reportStatus: "pending" | "approved" | "rejected";
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  doctorNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AnalysisSchema = new Schema({
  mood: String,
  mood_intensity: { type: Number, min: 1, max: 10, default: 5 },
  medicine_log: [{ name: String, status: { type: String, enum: ["taken", "missed", "skipped"] } }],
  forgotten_items: [String],
}, { _id: false });

const ReportSchema = new Schema<IReport>(
  {
    botId: { type: String, required: true, index: true },
    patientId: { type: Schema.Types.ObjectId, ref: "Patient", required: true, index: true },
    date: { type: String, required: true, index: true }, // Format: YYYY-MM-DD
    summary: { type: String, required: true },
    analyses: { type: [AnalysisSchema], default: [] },
    reportStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
    reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
    reviewedAt: Date,
    doctorNotes: String,
  },
  { timestamps: true }
);

// Ensure one daily report per patient per day
ReportSchema.index({ patientId: 1, date: 1 }, { unique: true });

export const Report = mongoose.model<IReport>("Report", ReportSchema);
