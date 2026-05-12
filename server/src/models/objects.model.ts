import mongoose, { Schema, Document } from "mongoose";

export interface IObjectRecord extends Document {
  userId: string;
  name: string;
  location: string;
  timestamp: Date;
}

const ObjectRecordSchema: Schema = new Schema({
  userId: { type: String, required: true, index: true },
  name: { type: String, required: true },
  location: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.model<IObjectRecord>("ObjectRecord", ObjectRecordSchema);
