import mongoose, { Schema, Document } from "mongoose";

export interface ITurn {
  role: "user" | "assistant";
  content: string;
}

export interface IAnalysisEvent {
  mood: string;
  mood_intensity: number;
  medicine_log: { name: string; status: "taken" | "missed" | "skipped" }[];
  forgotten_items: string[];
}

export interface ISession extends Document {
  _id: mongoose.Types.ObjectId;
  botId: string;
  sessionId: string;
  patientId?: mongoose.Types.ObjectId;
  startedAt: Date;
  endedAt: Date;
  durationSeconds: number;
  turns: ITurn[];
  analyses: IAnalysisEvent[];
  report?: string;
  reportStatus: "pending" | "approved" | "rejected";
  isDailyReport: boolean;
  reviewedBy?: mongoose.Types.ObjectId;   // Doctor user ID
  reviewedAt?: Date;
  doctorNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TurnSchema = new Schema<ITurn>({
  role: { type: String, enum: ["user", "assistant"], required: true },
  content: { type: String, required: true },
}, { _id: false });

const AnalysisSchema = new Schema<IAnalysisEvent>({
  mood: String,
  mood_intensity: { type: Number, min: 1, max: 10, default: 5 },
  medicine_log: [{ name: String, status: { type: String, enum: ["taken", "missed", "skipped"] } }],
  forgotten_items: [String],
}, { _id: false });

const SessionSchema = new Schema<ISession>(
  {
    botId: { type: String, required: true, index: true },
    sessionId: { type: String, required: true, unique: true, index: true },
    patientId: { type: Schema.Types.ObjectId, ref: "Patient", index: true },
    startedAt: { type: Date, required: true },
    endedAt: { type: Date, required: true },
    durationSeconds: { type: Number, default: 0 },
    turns: { type: [TurnSchema], default: [] },
    analyses: { type: [AnalysisSchema], default: [] },
    report: String,
    reportStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
    isDailyReport: { type: Boolean, default: false, index: true },
    reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
    reviewedAt: Date,
    doctorNotes: String,
  },
  { timestamps: true }
);

// Compound index for guardian queries
SessionSchema.index({ botId: 1, reportStatus: 1 });
// For doctor dashboard — pending first
SessionSchema.index({ reportStatus: 1, createdAt: -1 });

export const Session = mongoose.model<ISession>("Session", SessionSchema);
