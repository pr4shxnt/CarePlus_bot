import { Request, Response } from "express";
import { User } from "../models/User";
import { Patient } from "../models/Patient";
import { Report } from "../models/Report";
import { ok } from "../types";
import mongoose from "mongoose";

// 1. Shows users
export async function listUsers(req: Request, res: Response): Promise<void> {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(ok(users));
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// 2 & 3. Approves KYC of users / Doctor license verification (manual)
export async function verifyUser(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { is_verified } = req.body;

    const user = await User.findByIdAndUpdate(
      id,
      { is_verified: is_verified !== undefined ? is_verified : true },
      { new: true }
    );

    if (!user) {
      res.status(404).json({ success: false, error: "User not found." });
      return;
    }

    res.json(ok(user, `User verification status updated to ${user.is_verified}.`));
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// 4. CRUD Doctors
export async function listDoctors(req: Request, res: Response): Promise<void> {
  try {
    const doctors = await User.find({ role: "doctor" }).sort({ createdAt: -1 });
    res.json(ok(doctors));
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function createDoctor(req: Request, res: Response): Promise<void> {
  try {
    const { name, email, password, specialization, licenseNumber, is_verified } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      res.status(409).json({ success: false, error: "Email already registered." });
      return;
    }

    const doctor = new User({
      name,
      email,
      passwordHash: password || "doctor123", // default password
      role: "doctor",
      specialization,
      licenseNumber,
      is_verified: is_verified ?? false,
    });

    await doctor.save();
    res.status(201).json(ok(doctor, "Doctor created successfully."));
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function updateDoctor(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { name, email, specialization, licenseNumber, isActive, is_verified } = req.body;

    const updates: any = {};
    if (name !== undefined) updates.name = name;
    if (email !== undefined) updates.email = email;
    if (specialization !== undefined) updates.specialization = specialization;
    if (licenseNumber !== undefined) updates.licenseNumber = licenseNumber;
    if (isActive !== undefined) updates.isActive = isActive;
    if (is_verified !== undefined) updates.is_verified = is_verified;

    const doctor = await User.findOneAndUpdate(
      { _id: id, role: "doctor" },
      updates,
      { new: true }
    );

    if (!doctor) {
      res.status(404).json({ success: false, error: "Doctor not found." });
      return;
    }

    res.json(ok(doctor, "Doctor updated successfully."));
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function deleteDoctor(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const doctor = await User.findOneAndDelete({ _id: id, role: "doctor" });

    if (!doctor) {
      res.status(404).json({ success: false, error: "Doctor not found." });
      return;
    }

    res.json(ok(null, "Doctor deleted successfully."));
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// 5. CRUD Patients
export async function listPatients(req: Request, res: Response): Promise<void> {
  try {
    // We want to fetch all patients and join their user status
    const patients = await Patient.find().sort({ createdAt: -1 });
    const enrichedPatients = await Promise.all(
      patients.map(async (p) => {
        const u = await User.findById(p._id);
        return {
          ...p.toJSON(),
          email: u?.email || "",
          isActive: u?.isActive ?? true,
          is_verified: u?.is_verified ?? false,
        };
      })
    );
    res.json(ok(enrichedPatients));
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function createPatient(req: Request, res: Response): Promise<void> {
  try {
    const { name, email, password, age, gender, bloodGroup, conditions, allergies, medicines, assignedDoctorId, guardianId, notes } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      res.status(409).json({ success: false, error: "Email already registered." });
      return;
    }

    // Create User record
    const patientUser = new User({
      name,
      email,
      passwordHash: password || "patient123",
      role: "patient",
      is_verified: true, // Auto verify patients or set true
    });

    const botId = `bot_${patientUser._id.toString().slice(-6)}`;
    patientUser.patientBotId = botId;
    await patientUser.save();

    let guardianName: string | undefined = undefined;
    if (guardianId) {
      const guardianUser = await User.findById(guardianId);
      if (guardianUser) {
        guardianName = guardianUser.name;
      }
    }

    // Create Patient record
    const patient = new Patient({
      _id: patientUser._id,
      name,
      botId,
      age,
      gender,
      bloodGroup,
      conditions: conditions || [],
      allergies: allergies || [],
      medicines: medicines || [],
      assignedDoctorId: assignedDoctorId ? new mongoose.Types.ObjectId(assignedDoctorId) : undefined,
      guardianId: guardianId ? new mongoose.Types.ObjectId(guardianId) : undefined,
      guardianName,
      notes,
    });

    await patient.save();

    res.status(201).json(ok({
      ...patient.toJSON(),
      email: patientUser.email,
      isActive: patientUser.isActive,
      is_verified: patientUser.is_verified,
    }, "Patient created successfully."));
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function updatePatient(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { name, email, age, gender, bloodGroup, conditions, allergies, medicines, assignedDoctorId, guardianId, notes, isActive } = req.body;

    // Update User details
    const userUpdates: any = {};
    if (name !== undefined) userUpdates.name = name;
    if (email !== undefined) userUpdates.email = email;
    if (isActive !== undefined) userUpdates.isActive = isActive;

    const user = await User.findByIdAndUpdate(id, userUpdates, { new: true });
    if (!user) {
      res.status(404).json({ success: false, error: "Associated patient user not found." });
      return;
    }

    // Update Patient details
    const patientUpdates: any = {};
    if (name !== undefined) patientUpdates.name = name;
    if (age !== undefined) patientUpdates.age = age;
    if (gender !== undefined) patientUpdates.gender = gender;
    if (bloodGroup !== undefined) patientUpdates.bloodGroup = bloodGroup;
    if (conditions !== undefined) patientUpdates.conditions = conditions;
    if (allergies !== undefined) patientUpdates.allergies = allergies;
    if (medicines !== undefined) patientUpdates.medicines = medicines;
    if (notes !== undefined) patientUpdates.notes = notes;
    if (assignedDoctorId !== undefined) {
      patientUpdates.assignedDoctorId = assignedDoctorId ? new mongoose.Types.ObjectId(assignedDoctorId) : undefined;
    }
    if (guardianId !== undefined) {
      patientUpdates.guardianId = guardianId ? new mongoose.Types.ObjectId(guardianId) : undefined;
      if (guardianId) {
        const guardianUser = await User.findById(guardianId);
        patientUpdates.guardianName = guardianUser ? guardianUser.name : undefined;
      } else {
        patientUpdates.guardianName = undefined;
      }
    }

    const patient = await Patient.findByIdAndUpdate(id, patientUpdates, { new: true });
    if (!patient) {
      res.status(404).json({ success: false, error: "Patient record not found." });
      return;
    }

    res.json(ok({
      ...patient.toJSON(),
      email: user.email,
      isActive: user.isActive,
      is_verified: user.is_verified,
    }, "Patient updated successfully."));
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function deletePatient(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    // Delete Patient record
    const patient = await Patient.findByIdAndDelete(id);
    if (!patient) {
      res.status(404).json({ success: false, error: "Patient record not found." });
      return;
    }

    // Delete User record
    await User.findByIdAndDelete(id);

    res.json(ok(null, "Patient deleted successfully."));
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// 6. View reports of patients (only view, no edit or delete or create)
export async function listReports(req: Request, res: Response): Promise<void> {
  try {
    const reports = await Report.find().sort({ date: -1, createdAt: -1 });
    res.json(ok(reports));
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function getReport(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const report = await Report.findById(id);
    if (!report) {
      res.status(404).json({ success: false, error: "Report not found." });
      return;
    }
    res.json(ok(report));
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}
