import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";
import type { UserRole } from "../types";

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  isActive: boolean;
  // Doctor-specific
  specialization?: string;
  licenseNumber?: string;
  // Guardian-specific
  patientBotId?: string;   // the Pi bot ID this guardian monitors
  relationship?: string;   // e.g. "Son", "Daughter"
  createdAt: Date;
  updatedAt: Date;
  comparePassword(plain: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ["doctor", "guardian", "patient", "admin"], required: true },
    isActive: { type: Boolean, default: true },
    specialization: String,
    licenseNumber: String,
    patientBotId: { type: String, index: true },
    relationship: String,
  },
  { timestamps: true }
);

// Never return password hash in queries by default
UserSchema.set("toJSON", {
  transform: (_doc, ret) => {
    delete ret.passwordHash;
    return ret;
  },
});

UserSchema.methods.comparePassword = async function (plain: string): Promise<boolean> {
  return bcrypt.compare(plain, this.passwordHash);
};

UserSchema.pre("save", async function (this: IUser) {
  if (!this.isModified("passwordHash")) return;
  this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
});

export const User = mongoose.model<IUser>("User", UserSchema);
