import { Request, Response } from "express";
import { z } from "zod";
import { User } from "../models/User";
import { signToken } from "../services/token.service";
import { ok } from "../types";

export const RegisterSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["doctor", "guardian", "patient", "admin"]),
  // Doctor fields
  specialization: z.string().optional(),
  licenseNumber: z.string().optional(),
  // Guardian fields
  patientBotId: z.string().optional(),
  relationship: z.string().optional(),
  // Patient fields
  age: z.number().optional(),
  gender: z.enum(["male", "female", "other"]).optional(),
  healthGoal: z.string().optional(),
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function register(req: Request, res: Response): Promise<void> {
  const body = req.body as z.infer<typeof RegisterSchema>;

  const existing = await User.findOne({ email: body.email });
  if (existing) {
    res.status(409).json({ success: false, error: "Email already registered." });
    return;
  }

  const user = new User({
    name: body.name,
    email: body.email,
    passwordHash: body.password,  // pre-save hook will hash it
    role: body.role,
    specialization: body.specialization,
    licenseNumber: body.licenseNumber,
    patientBotId: body.patientBotId,
    relationship: body.relationship,
  });

  await user.save();

  // If role is patient, create Patient document with same _id as User
  if (body.role === "patient") {
    const patient = new Patient({
      _id: user._id, // Match the user _id for consistent identification
      name: body.name,
      age: body.age,
      gender: body.gender,
      notes: body.healthGoal,
      // botId is how the hardware bot identifies itself during 'bot sync'
      // if not provided, we can default to a prefix + the ID
      botId: body.patientBotId || `bot_${user._id.toString().slice(-6)}`,
    });
    await patient.save();
  }

  const token = signToken(user._id.toString(), user.email, user.role);
  res.status(201).json(ok({ token, user }, "Account created successfully."));
}

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body as z.infer<typeof LoginSchema>;

  const user = await User.findOne({ email }).select("+passwordHash");
  if (!user || !user.isActive) {
    res.status(401).json({ success: false, error: "Invalid credentials." });
    return;
  }

  const valid = await user.comparePassword(password);
  if (!valid) {
    res.status(401).json({ success: false, error: "Invalid credentials." });
    return;
  }

  const token = signToken(user._id.toString(), user.email, user.role);

  // Return user without password
  const safeUser = user.toJSON();
  res.json(ok({ token, user: safeUser }, "Login successful."));
}

export async function me(req: Request, res: Response): Promise<void> {
  const user = await User.findById(req.user!.userId);
  if (!user) {
    res.status(404).json({ success: false, error: "User not found." });
    return;
  }
  res.json(ok(user));
}

export async function updateMe(req: Request, res: Response): Promise<void> {
  const allowed = ["name", "specialization", "relationship"];
  const updates: Record<string, unknown> = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  }
  const user = await User.findByIdAndUpdate(req.user!.userId, updates, { new: true });
  res.json(ok(user, "Profile updated."));
}
