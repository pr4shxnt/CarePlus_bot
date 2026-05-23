import mongoose, { Schema, Document } from "mongoose";

export interface IMedicine {
  name: string;
  dosage: string;
  frequency: string;
  times: string[];
  notes?: string;
}

export interface IPatient extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  botId: string;           // links to Raspberry Pi bot
  age?: number;
  gender?: "male" | "female" | "other";
  bloodGroup?: string;
  conditions: string[];
  allergies: string[];
  medicines: IMedicine[];
  assignedDoctorId?: mongoose.Types.ObjectId;
  guardianId?: mongoose.Types.ObjectId;
  notes?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MedicineSchema = new Schema<IMedicine>({
  name: { type: String, required: true },
  dosage: { type: String, default: "" },
  frequency: { type: String, default: "daily" },
  times: { type: [String], default: [] },
  notes: String,
}, { _id: false });

const PatientSchema = new Schema<IPatient>(
  {
    name: { type: String, required: true, trim: true },
    botId: { type: String, required: true, unique: true, index: true },
    age: Number,
    gender: { type: String, enum: ["male", "female", "other"] },
    bloodGroup: String,
    conditions: { type: [String], default: [] },
    allergies: { type: [String], default: [] },
    medicines: { type: [MedicineSchema], default: [] },
    assignedDoctorId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    guardianId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    notes: String,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Patient = mongoose.model<IPatient>("Patient", PatientSchema);
