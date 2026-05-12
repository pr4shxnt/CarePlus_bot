import mongoose, { Schema, Document } from "mongoose";

export interface IReport extends Document {
  userId: string;
  report: string;
  moodScore: number;
  timestamp: Date;
}

const ReportSchema: Schema = new Schema({
  userId: { type: String, required: true, index: true },
  report: { type: String, required: true },
  moodScore: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.model<IReport>("Report", ReportSchema);
