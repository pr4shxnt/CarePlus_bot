import mongoose, { Schema } from "mongoose";

export type CreateUserInput = {
  name: string;
  email: string;
  role?: 'doctor' | 'guardian' | 'patient';
  status?: 'normal' | 'critical';
  guardianId?: string;
};

export type ApiUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  guardianId?: string;
  createdAt: string;
  updatedAt: string;
};

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },
    role: { type: String, enum: ['doctor', 'guardian', 'patient'], default: 'patient' },
    status: { type: String, enum: ['normal', 'critical'], default: 'normal' },
    guardianId: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const UserModel =
  (mongoose.models.User as mongoose.Model<any>) ??
  mongoose.model("User", userSchema);

export function mapUserDocument(userDocument: any): ApiUser {
  return {
    id: userDocument._id.toString(),
    name: userDocument.name,
    email: userDocument.email,
    role: userDocument.role || 'patient',
    status: userDocument.status || 'normal',
    guardianId: userDocument.guardianId?.toString(),
    createdAt: userDocument.createdAt.toISOString(),
    updatedAt: userDocument.updatedAt.toISOString(),
  };
}
