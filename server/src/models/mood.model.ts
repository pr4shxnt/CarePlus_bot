import mongoose, { Schema, Document } from "mongoose";

export interface IMood extends Document {
  userId: string;
  score: number;
  timestamp: Date;
  note?: string;
}

const MoodSchema: Schema = new Schema({
  userId: { type: String, required: true, index: true },
  score: { type: Number, required: true, min: 1, max: 10 },
  timestamp: { type: Date, default: Date.now },
  note: { type: String },
});

export default mongoose.model<IMood>("Mood", MoodSchema);
