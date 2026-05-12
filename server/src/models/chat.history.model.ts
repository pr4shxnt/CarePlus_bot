import mongoose, { Schema, Document } from "mongoose";

export interface IChatHistory extends Document {
  userId: string;
  sessionId: string;
  role: string;
  content: string;
  timestamp: Date;
  botId: string;
}

const ChatHistorySchema: Schema = new Schema({
  userId: { type: String, required: true, index: true },
  sessionId: { type: String, index: true },
  role: { type: String, required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  botId: { type: String, required: true },
});

export default mongoose.model<IChatHistory>("ChatHistory", ChatHistorySchema);
