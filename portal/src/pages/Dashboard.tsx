import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchApi, removeToken, removeUser, getUser } from "@/lib/api";

import DoctorDashboard from "@/components/DoctorDashboard";
import PatientDetailView from "@/components/PatientDetailView";
import ReportListView from "@/components/ReportListView";
import SessionHistoryView from "@/components/SessionHistoryView";
import ConversationView from "@/components/ConversationView";
import GuardianDashboard from "@/components/GuardianDashboard";
import ConnectDeviceView from "@/components/ConnectDeviceView";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Users,
  UserCheck,
  Stethoscope,
  Heart,
  FileText,
  LogOut,
  Plus,
  Trash2,
  Edit,
  CheckCircle,
  Eye,
  AlertCircle,
  Activity,
  Calendar,
  Pill,
  MessageSquare,
  Zap,
  User,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  LineChart,
  Line,
} from "recharts";

type Tab = 
  | "overview" | "users" | "doctors" | "patients" | "reports"
  | "doctor_dashboard" | "doctor_patients" | "doctor_reports" | "doctor_sessions"
  | "guardian_dashboard" | "guardian_reports" | "guardian_sessions" | "guardian_device";

export default function Dashboard() {
  const navigate = useNavigate();
  const currentUser = getUser();
  const [activeTab, setActiveTab] = useState<Tab>(
    currentUser?.role === "doctor"
      ? "doctor_dashboard"
      : currentUser?.role === "guardian"
      ? "guardian_dashboard"
      : "overview"
  );

  // Data States
  const [users, setUsers] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  
  // Custom Role specific dashboard states
  const [doctorDashboard, setDoctorDashboard] = useState<any>({});
  const [guardianDashboard, setGuardianDashboard] = useState<any>({});
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Loading & Error States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Dialog open controls
  const [doctorDialogOpen, setDoctorDialogOpen] = useState(false);
  const [patientDialogOpen, setPatientDialogOpen] = useState(false);
  const [reportDetailsOpen, setReportDetailsOpen] = useState(false);

  // Form States
  const [selectedDoctor, setSelectedDoctor] = useState<any | null>(null);
  const [doctorForm, setDoctorForm] = useState({
    name: "",
    email: "",
    password: "",
    specialization: "",
    licenseNumber: "",
    is_verified: false,
  });

  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);
  const [patientForm, setPatientForm] = useState({
    name: "",
    email: "",
    password: "",
    age: "",
    gender: "male" as "male" | "female" | "other",
    bloodGroup: "",
    assignedDoctorId: "",
    guardianId: "",
    notes: "",
    conditions: "",
    allergies: "",
    medicines: [] as any[],
  });

  const [newMedicine, setNewMedicine] = useState({
    name: "",
    dosage: "",
    frequency: "daily",
    times: "08:00",
    notes: "",
  });

  const [selectedReport, setSelectedReport] = useState<any | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      if (currentUser?.role === "admin") {
        const [usersRes, doctorsRes, patientsRes, reportsRes] = await Promise.all([
          fetchApi("/api/admin/users"),
          fetchApi("/api/admin/doctors"),
          fetchApi("/api/admin/patients"),
          fetchApi("/api/admin/reports"),
        ]);
        setUsers(usersRes.data || []);
        setDoctors(doctorsRes.data || []);
        setPatients(patientsRes.data || []);
        setReports(reportsRes.data || []);
      } else if (currentUser?.role === "doctor") {
        const [dashRes, patientsRes] = await Promise.all([
          fetchApi("/api/doctor/dashboard"),
          fetchApi("/api/doctor/patients"),
        ]);
        setDoctorDashboard(dashRes.data || {});
        setPatients(patientsRes.data || []);
        
        // Also fetch reports and sessions for pages
        const [reportsRes, sessionsRes] = await Promise.all([
          fetchApi("/api/doctor/reports"),
          fetchApi("/api/doctor/sessions"),
        ]);
        setReports(reportsRes.data?.reports || []);
        setSessions(sessionsRes.data?.sessions || []);
      } else if (currentUser?.role === "guardian") {
        const dashRes = await fetchApi("/api/guardian/dashboard");
        setGuardianDashboard(dashRes.data || {});
        
        // Fetch guardian reports and sessions
        const [reportsRes, sessionsRes] = await Promise.all([
          fetchApi("/api/guardian/reports"),
          fetchApi("/api/guardian/sessions"),
        ]);
        setReports(reportsRes.data?.reports || []);
        setSessions(sessionsRes.data?.sessions || []);
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    removeToken();
    removeUser();
    navigate("/login");
  };

  const handleApproveReport = async (reportId: string, notes: string) => {
    try {
      const res = await fetchApi(`/api/doctor/reports/${reportId}/approve`, {
        method: "POST",
        body: JSON.stringify({ doctorNotes: notes }),
      });
      if (res.success) {
        fetchData();
      }
    } catch (err: any) {
      alert(err.message || "Failed to approve report.");
    }
  };

  const getHeaderTitle = () => {
    switch (activeTab) {
      case "overview": return "Platform Overview";
      case "users": return "User Directory";
      case "doctors": return "Clinician Directory";
      case "patients": return "Patient Directory";
      case "reports": return "All Health Reports";
      case "doctor_dashboard": return "Clinician Overview";
      case "doctor_patients": return "Patient Psych-Profiles";
      case "doctor_reports": return "Release & Review Insights";
      case "doctor_sessions": return "Patient Session Logs";
      case "guardian_dashboard": return "Caregiver Dashboard";
      case "guardian_reports": return "Patient Daily Reports";
      case "guardian_sessions": return "Companion Conversations";
      case "guardian_device": return "Hardware Companion Linkage";
      default: return "Dashboard";
    }
  };

  // --- USER VERIFICATION (KYC & LICENSES) ---
  const handleToggleVerification = async (
    userId: string,
    currentStatus: boolean,
  ) => {
    try {
      const res = await fetchApi(`/api/admin/users/${userId}/verify`, {
        method: "POST",
        body: JSON.stringify({ is_verified: !currentStatus }),
      });
      if (res.success) {
        fetchData();
      }
    } catch (err: any) {
      alert(err.message || "Failed to update verification status.");
    }
  };

  // --- DOCTOR CRUD ACTIONS ---
  const handleOpenDoctorAdd = () => {
    setSelectedDoctor(null);
    setDoctorForm({
      name: "",
      email: "",
      password: "",
      specialization: "",
      licenseNumber: "",
      is_verified: false,
    });
    setDoctorDialogOpen(true);
  };

  const handleOpenDoctorEdit = (doc: any) => {
    setSelectedDoctor(doc);
    setDoctorForm({
      name: doc.name || "",
      email: doc.email || "",
      password: "", // Leave blank if not updating
      specialization: doc.specialization || "",
      licenseNumber: doc.licenseNumber || "",
      is_verified: doc.is_verified || false,
    });
    setDoctorDialogOpen(true);
  };

  const handleSaveDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedDoctor) {
        // Edit doctor
        const body: any = { ...doctorForm };
        if (!body.password) delete body.password; // Do not update password if left blank
        await fetchApi(`/api/admin/doctors/${selectedDoctor._id}`, {
          method: "PATCH",
          body: JSON.stringify(body),
        });
      } else {
        // Create doctor
        await fetchApi("/api/admin/doctors", {
          method: "POST",
          body: JSON.stringify(doctorForm),
        });
      }
      setDoctorDialogOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err.message || "Failed to save doctor.");
    }
  };

  const handleDeleteDoctor = async (id: string) => {
    if (!confirm("Are you sure you want to delete this doctor?")) return;
    try {
      await fetchApi(`/api/admin/doctors/${id}`, { method: "DELETE" });
      fetchData();
    } catch (err: any) {
      alert(err.message || "Failed to delete doctor.");
    }
  };

  // --- PATIENT CRUD ACTIONS ---
  const handleOpenPatientAdd = () => {
    setSelectedPatient(null);
    setPatientForm({
      name: "",
      email: "",
      password: "",
      age: "",
      gender: "male",
      bloodGroup: "",
      assignedDoctorId: "",
      guardianId: "",
      notes: "",
      conditions: "",
      allergies: "",
      medicines: [],
    });
    setPatientDialogOpen(true);
  };

  const handleOpenPatientEdit = (p: any) => {
    setSelectedPatient(p);
    setPatientForm({
      name: p.name || "",
      email: p.email || "",
      password: "",
      age: p.age?.toString() || "",
      gender: p.gender || "male",
      bloodGroup: p.bloodGroup || "",
      assignedDoctorId: p.assignedDoctorId || "",
      guardianId: p.guardianId || "",
      notes: p.notes || "",
      conditions: p.conditions ? p.conditions.join(", ") : "",
      allergies: p.allergies ? p.allergies.join(", ") : "",
      medicines: p.medicines || [],
    });
    setPatientDialogOpen(true);
  };

  const handleAddMedicine = () => {
    if (!newMedicine.name.trim()) return;
    const med = {
      name: newMedicine.name,
      dosage: newMedicine.dosage,
      frequency: newMedicine.frequency,
      times: newMedicine.times.split(",").map((t) => t.trim()),
      notes: newMedicine.notes,
    };
    setPatientForm((prev) => ({
      ...prev,
      medicines: [...prev.medicines, med],
    }));
    setNewMedicine({
      name: "",
      dosage: "",
      frequency: "daily",
      times: "08:00",
      notes: "",
    });
  };

  const handleRemoveMedicine = (index: number) => {
    setPatientForm((prev) => ({
      ...prev,
      medicines: prev.medicines.filter((_, idx) => idx !== index),
    }));
  };

  const handleSavePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...patientForm,
      age: patientForm.age ? parseInt(patientForm.age, 10) : undefined,
      conditions: patientForm.conditions
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean),
      allergies: patientForm.allergies
        .split(",")
        .map((a) => a.trim())
        .filter(Boolean),
    };

    if (!payload.password) delete (payload as any).password;

    try {
      if (selectedPatient) {
        // Edit patient
        await fetchApi(`/api/admin/patients/${selectedPatient._id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      } else {
        // Create patient
        await fetchApi("/api/admin/patients", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }
      setPatientDialogOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err.message || "Failed to save patient.");
    }
  };

  const handleDeletePatient = async (id: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this patient profile and user record?",
      )
    )
      return;
    try {
      await fetchApi(`/api/admin/patients/${id}`, { method: "DELETE" });
      fetchData();
    } catch (err: any) {
      alert(err.message || "Failed to delete patient.");
    }
  };

  // --- REPORT DIALOG VIEW ---
  const handleOpenReportDetails = (rep: any) => {
    // Lookup patient name
    const patientObj = patients.find(
      (p) => p._id === rep.patientId || p.botId === rep.botId,
    );
    setSelectedReport({
      ...rep,
      patientName: patientObj ? patientObj.name : "Unknown Patient",
    });
    setReportDetailsOpen(true);
  };

  // --- CHART METRICS ---
  const getReportChartData = () => {
    const counts = reports.reduce(
      (acc, curr) => {
        acc[curr.reportStatus] = (acc[curr.reportStatus] || 0) + 1;
        return acc;
      },
      { pending: 0, approved: 0, rejected: 0 },
    );
    return [
      { name: "Pending", value: counts.pending, color: "#eab308" },
      { name: "Approved", value: counts.approved, color: "#14b8a6" },
      { name: "Rejected", value: counts.rejected, color: "#ef4444" },
    ];
  };

  const getMoodChartData = () => {
    const moods: Record<string, number> = {};
    reports.forEach((r) => {
      if (r.analyses && r.analyses.length > 0) {
        r.analyses.forEach((a: any) => {
          if (a.mood) {
            moods[a.mood] = (moods[a.mood] || 0) + 1;
          }
        });
      }
    });
    return Object.entries(moods).map(([name, value]) => ({ name, value }));
  };

  const getMoodColor = (mood: string) => {
    const normalized = mood.toLowerCase();
    switch (normalized) {
      case "sad":
        return "#3b82f6"; // Blue
      case "unwell":
        return "#f97316"; // Orange
      case "neutral":
        return "#6b7280"; // Gray
      case "concerned":
        return "#eab308"; // Yellow
      case "painful":
        return "#ef4444"; // Red
      case "happy":
      case "positive":
        return "#10b981"; // Emerald
      default:
        return "var(--primary)"; // Fallback
    }
  };

  const reportChartData = getReportChartData();
  const moodChartData = getMoodChartData();

  const getUserGrowthData = () => {
    const dataMap: Record<string, number> = {};
    const fallbackMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    let hasActualDates = false;
    if (users && users.length > 0) {
      users.forEach((u) => {
        if (u.createdAt) {
          const date = new Date(u.createdAt);
          if (!isNaN(date.getTime())) {
            const month = date.toLocaleString("default", { month: "short" });
            dataMap[month] = (dataMap[month] || 0) + 1;
            hasActualDates = true;
          }
        }
      });
    }

    if (hasActualDates) {
      const monthOrder = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      let cumulative = 0;
      return monthOrder
        .filter((m) => dataMap[m] !== undefined || fallbackMonths.includes(m))
        .map((m) => {
          cumulative += dataMap[m] || 0;
          return {
            name: m,
            users: cumulative + 1,
          };
        });
    }

    const totalUsersCount = users.length || 4;
    return fallbackMonths.map((month, idx) => {
      const ratio = (idx + 1) / fallbackMonths.length;
      const val = Math.max(1, Math.round(ratio * totalUsersCount));
      return {
        name: month,
        users: val,
      };
    });
  };

  const userGrowthData = getUserGrowthData();

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-background text-foreground font-sans overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          collapsible="icon"
          className="border-border bg-card/40 backdrop-blur-md"
        >
          <SidebarHeader className="border-b border-border group-data-[state=expanded]:p-4 group-data-[state=collapsed]:p-2">
            <div className="flex items-center gap-2 group-data-[state=expanded]:px-2 group-data-[state=expanded]:py-1 group-data-[state=collapsed]:px-0 group-data-[state=collapsed]:justify-center">
              <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary flex-shrink-0">
                <Activity className="h-5 w-5 animate-pulse" />
              </div>
              <span className="font-bold text-lg tracking-tight text-foreground group-data-[state=collapsed]:hidden">
                CarePlus Admin
              </span>
            </div>
          </SidebarHeader>

          <SidebarContent className="group-data-[state=expanded]:p-2 group-data-[state=collapsed]:p-0">
            <SidebarGroup className="">
              <SidebarGroupLabel className="text-muted-foreground uppercase text-[10px] tracking-wider px-2 group-data-[state=collapsed]:hidden">
                Management
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="gap-1">
                  {currentUser?.role === "admin" && (
                    <>
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          isActive={activeTab === "overview"}
                          onClick={() => setActiveTab("overview")}
                          tooltip="Overview"
                          className={`flex items-center gap-3 group-data-[state=expanded]:px-3 group-data-[state=expanded]:py-2 rounded-lg text-sm transition-all ${
                            activeTab === "overview"
                              ? "bg-primary/10 text-primary font-medium"
                              : "text-muted-foreground hover:bg-card hover:text-foreground"
                          }`}
                        >
                          <Activity className="h-4 w-4" />
                          <span>Overview</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>

                      <SidebarMenuItem>
                        <SidebarMenuButton
                          isActive={activeTab === "users"}
                          onClick={() => setActiveTab("users")}
                          tooltip="User Directory"
                          className={`flex items-center gap-3 group-data-[state=expanded]:px-3 group-data-[state=expanded]:py-2 rounded-lg text-sm transition-all ${
                            activeTab === "users"
                              ? "bg-primary/10 text-primary font-medium"
                              : "text-muted-foreground hover:bg-card hover:text-foreground"
                          }`}
                        >
                          <Users className="h-4 w-4" />
                          <span>User Directory</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>

                      <SidebarMenuItem>
                        <SidebarMenuButton
                          isActive={activeTab === "doctors"}
                          onClick={() => setActiveTab("doctors")}
                          tooltip="Doctor Profiles"
                          className={`flex items-center gap-3 group-data-[state=expanded]:px-3 group-data-[state=expanded]:py-2 rounded-lg text-sm transition-all ${
                            activeTab === "doctors"
                              ? "bg-primary/10 text-primary font-medium"
                              : "text-muted-foreground hover:bg-card hover:text-foreground"
                          }`}
                        >
                          <Stethoscope className="h-4 w-4" />
                          <span>Doctor Profiles</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>

                      <SidebarMenuItem>
                        <SidebarMenuButton
                          isActive={activeTab === "patients"}
                          onClick={() => setActiveTab("patients")}
                          tooltip="Patient Profiles"
                          className={`flex items-center gap-3 group-data-[state=expanded]:px-3 group-data-[state=expanded]:py-2 rounded-lg text-sm transition-all ${
                            activeTab === "patients"
                              ? "bg-primary/10 text-primary font-medium"
                              : "text-muted-foreground hover:bg-card hover:text-foreground"
                          }`}
                        >
                          <Heart className="h-4 w-4" />
                          <span>Patient Profiles</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>

                      <SidebarMenuItem>
                        <SidebarMenuButton
                          isActive={activeTab === "reports"}
                          onClick={() => setActiveTab("reports")}
                          tooltip="Health Reports"
                          className={`flex items-center gap-3 group-data-[state=expanded]:px-3 group-data-[state=expanded]:py-2 rounded-lg text-sm transition-all ${
                            activeTab === "reports"
                              ? "bg-primary/10 text-primary font-medium"
                              : "text-muted-foreground hover:bg-card hover:text-foreground"
                          }`}
                        >
                          <FileText className="h-4 w-4" />
                          <span>Health Reports</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </>
                  )}

                  {currentUser?.role === "doctor" && (
                    <>
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          isActive={activeTab === "doctor_dashboard"}
                          onClick={() => setActiveTab("doctor_dashboard")}
                          tooltip="Overview"
                          className={`flex items-center gap-3 group-data-[state=expanded]:px-3 group-data-[state=expanded]:py-2 rounded-lg text-sm transition-all ${
                            activeTab === "doctor_dashboard"
                              ? "bg-primary/10 text-primary font-medium"
                              : "text-muted-foreground hover:bg-card hover:text-foreground"
                          }`}
                        >
                          <Activity className="h-4 w-4" />
                          <span>Overview</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>

                      <SidebarMenuItem>
                        <SidebarMenuButton
                          isActive={activeTab === "doctor_patients"}
                          onClick={() => setActiveTab("doctor_patients")}
                          tooltip="Psych-Profiles"
                          className={`flex items-center gap-3 group-data-[state=expanded]:px-3 group-data-[state=expanded]:py-2 rounded-lg text-sm transition-all ${
                            activeTab === "doctor_patients"
                              ? "bg-primary/10 text-primary font-medium"
                              : "text-muted-foreground hover:bg-card hover:text-foreground"
                          }`}
                        >
                          <Heart className="h-4 w-4" />
                          <span>Psych-Profiles</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>

                      <SidebarMenuItem>
                        <SidebarMenuButton
                          isActive={activeTab === "doctor_reports"}
                          onClick={() => setActiveTab("doctor_reports")}
                          tooltip="Review Reports"
                          className={`flex items-center gap-3 group-data-[state=expanded]:px-3 group-data-[state=expanded]:py-2 rounded-lg text-sm transition-all ${
                            activeTab === "doctor_reports"
                              ? "bg-primary/10 text-primary font-medium"
                              : "text-muted-foreground hover:bg-card hover:text-foreground"
                          }`}
                        >
                          <FileText className="h-4 w-4" />
                          <span>Review Reports</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>

                      <SidebarMenuItem>
                        <SidebarMenuButton
                          isActive={activeTab === "doctor_sessions"}
                          onClick={() => setActiveTab("doctor_sessions")}
                          tooltip="Check-in Sessions"
                          className={`flex items-center gap-3 group-data-[state=expanded]:px-3 group-data-[state=expanded]:py-2 rounded-lg text-sm transition-all ${
                            activeTab === "doctor_sessions"
                              ? "bg-primary/10 text-primary font-medium"
                              : "text-muted-foreground hover:bg-card hover:text-foreground"
                          }`}
                        >
                          <MessageSquare className="h-4 w-4" />
                          <span>Check-in Sessions</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </>
                  )}

                  {currentUser?.role === "guardian" && (
                    <>
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          isActive={activeTab === "guardian_dashboard"}
                          onClick={() => setActiveTab("guardian_dashboard")}
                          tooltip="Overview"
                          className={`flex items-center gap-3 group-data-[state=expanded]:px-3 group-data-[state=expanded]:py-2 rounded-lg text-sm transition-all ${
                            activeTab === "guardian_dashboard"
                              ? "bg-primary/10 text-primary font-medium"
                              : "text-muted-foreground hover:bg-card hover:text-foreground"
                          }`}
                        >
                          <Activity className="h-4 w-4" />
                          <span>Overview</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>

                      <SidebarMenuItem>
                        <SidebarMenuButton
                          isActive={activeTab === "guardian_reports"}
                          onClick={() => setActiveTab("guardian_reports")}
                          tooltip="Care Insights"
                          className={`flex items-center gap-3 group-data-[state=expanded]:px-3 group-data-[state=expanded]:py-2 rounded-lg text-sm transition-all ${
                            activeTab === "guardian_reports"
                              ? "bg-primary/10 text-primary font-medium"
                              : "text-muted-foreground hover:bg-card hover:text-foreground"
                          }`}
                        >
                          <FileText className="h-4 w-4" />
                          <span>Care Insights</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>

                      <SidebarMenuItem>
                        <SidebarMenuButton
                          isActive={activeTab === "guardian_sessions"}
                          onClick={() => setActiveTab("guardian_sessions")}
                          tooltip="Session Logs"
                          className={`flex items-center gap-3 group-data-[state=expanded]:px-3 group-data-[state=expanded]:py-2 rounded-lg text-sm transition-all ${
                            activeTab === "guardian_sessions"
                              ? "bg-primary/10 text-primary font-medium"
                              : "text-muted-foreground hover:bg-card hover:text-foreground"
                          }`}
                        >
                          <MessageSquare className="h-4 w-4" />
                          <span>Session Logs</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>

                      <SidebarMenuItem>
                        <SidebarMenuButton
                          isActive={activeTab === "guardian_device"}
                          onClick={() => setActiveTab("guardian_device")}
                          tooltip="Connect Device"
                          className={`flex items-center gap-3 group-data-[state=expanded]:px-3 group-data-[state=expanded]:py-2 rounded-lg text-sm transition-all ${
                            activeTab === "guardian_device"
                              ? "bg-primary/10 text-primary font-medium"
                              : "text-muted-foreground hover:bg-card hover:text-foreground"
                          }`}
                        >
                          <Plus className="h-4 w-4" />
                          <span>Connect Device</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </>
                  )}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-border group-data-[state=expanded]:p-4 group-data-[state=collapsed]:p-2">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 px-2 py-1.5 overflow-hidden group-data-[state=collapsed]:hidden">
                <Avatar className="h-9 w-9 bg-muted border border-primary/20">
                  <AvatarFallback className="text-primary text-xs font-semibold">
                    {currentUser?.name?.slice(0, 2).toUpperCase() || "AD"}
                  </AvatarFallback>
                </Avatar>
                <div className="overflow-hidden">
                  <p className="text-xs font-medium text-foreground truncate">
                    {currentUser?.name || "System Admin"}
                  </p>
                  <p className="text-[10px] text-muted-foreground truncate">
                    {currentUser?.email || "admin@jarvis.dev"}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="w-full justify-start text-red-400 hover:bg-red-950/20 hover:text-red-300 gap-3 group-data-[state=collapsed]:justify-center group-data-[state=collapsed]:p-0"
              >
                <LogOut className="h-4 w-4" />
                <span className="group-data-[state=collapsed]:hidden">
                  Sign Out
                </span>
              </Button>
            </div>
          </SidebarFooter>
          <SidebarRail />
        </Sidebar>

        {/* Main Content Area */}
        <SidebarInset className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-background">
          <header className="h-16 border-b border-border py-2 px-8 flex items-center justify-between bg-background/80 sticky top-0 z-10 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="text-muted-foreground hover:text-foreground mr-2" />
              <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                {getHeaderTitle()}
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={fetchData}
                      className="h-9 w-9 border-border hover:bg-card text-muted-foreground"
                    >
                      <Activity className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Sync DB Data</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </header>

          <div className="flex-1 p-8 space-y-6">
            {error && (
              <div className="flex items-center gap-3 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {loading ? (
              <div className="min-h-[400px] flex flex-col items-center justify-center gap-4 text-muted-foreground">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                <p className="text-sm">
                  Fetching and syncing portal database records...
                </p>
              </div>
            ) : (
              <>
                {/* TAB CONTENT: OVERVIEW */}
                {activeTab === "overview" && (
                  <div className="space-y-8">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                      <Card className="bg-card/40 border-border text-foreground">
                        <CardContent className="p-6 flex items-center justify-between">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                              Total Users
                            </p>
                            <h3 className="text-2xl font-bold mt-1 text-foreground">
                              {users.length}
                            </h3>
                          </div>
                          <Users className="h-8 w-8 text-primary bg-primary/10 p-1.5 rounded-lg border border-primary/20" />
                        </CardContent>
                      </Card>
                      <Card className="bg-card/40 border-border text-foreground">
                        <CardContent className="p-6 flex items-center justify-between">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                              Verified KYC
                            </p>
                            <h3 className="text-2xl font-bold mt-1 text-foreground">
                              {users.filter((u) => u.is_verified).length}
                            </h3>
                          </div>
                          <UserCheck className="h-8 w-8 text-emerald-400 bg-emerald-500/10 p-1.5 rounded-lg border border-emerald-500/20" />
                        </CardContent>
                      </Card>
                      <Card className="bg-card/40 border-border text-foreground">
                        <CardContent className="p-6 flex items-center justify-between">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                              Active Doctors
                            </p>
                            <h3 className="text-2xl font-bold mt-1 text-foreground">
                              {doctors.filter((d) => d.isActive).length}
                            </h3>
                          </div>
                          <Stethoscope className="h-8 w-8 text-indigo-400 bg-indigo-500/10 p-1.5 rounded-lg border border-indigo-500/20" />
                        </CardContent>
                      </Card>
                      <Card className="bg-card/40 border-border text-foreground">
                        <CardContent className="p-6 flex items-center justify-between">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                              Active Patients
                            </p>
                            <h3 className="text-2xl font-bold mt-1 text-foreground">
                              {
                                patients.filter((p) => p.isActive !== false)
                                  .length
                              }
                            </h3>
                          </div>
                          <Heart className="h-8 w-8 text-pink-400 bg-pink-500/10 p-1.5 rounded-lg border border-pink-500/20" />
                        </CardContent>
                      </Card>
                      <Card className="bg-card/40 border-border text-foreground">
                        <CardContent className="p-6 flex items-center justify-between">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                              Total Reports
                            </p>
                            <h3 className="text-2xl font-bold mt-1 text-foreground">
                              {reports.length}
                            </h3>
                          </div>
                          <FileText className="h-8 w-8 text-amber-400 bg-amber-500/10 p-1.5 rounded-lg border border-amber-500/20" />
                        </CardContent>
                      </Card>
                    </div>

                    {/* Charts Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <Card className="lg:col-span-2 bg-card/40 border-border text-foreground">
                        <CardHeader>
                          <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                            Patient Mood Distribution
                          </CardTitle>
                          <CardDescription className="text-muted-foreground">
                            Aggregated patient emotional states parsed from
                            daily AI logs
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="h-80">
                          {moodChartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart
                                data={moodChartData}
                                margin={{
                                  top: 10,
                                  right: 30,
                                  left: 0,
                                  bottom: 0,
                                }}
                              >
                                <CartesianGrid
                                  strokeDasharray="3 3"
                                  stroke="var(--border)"
                                />
                                <XAxis
                                  dataKey="name"
                                  stroke="var(--muted-foreground)"
                                  fontSize={12}
                                />
                                <YAxis
                                  stroke="var(--muted-foreground)"
                                  fontSize={12}
                                />
                                <ChartTooltip
                                  cursor={false}
                                  contentStyle={{
                                    backgroundColor: "var(--popover)",
                                    borderColor: "var(--border)",
                                    color: "var(--popover-foreground)",
                                    borderRadius: "var(--radius)",
                                  }}
                                  itemStyle={{
                                    color: "var(--foreground)",
                                  }}
                                  labelStyle={{
                                    color: "var(--muted-foreground)",
                                  }}
                                />
                                <Bar
                                  dataKey="value"
                                  fill="var(--primary)"
                                  radius={[4, 4, 0, 0]}
                                >
                                  {moodChartData.map((entry, index) => (
                                    <Cell
                                      key={`cell-${index}`}
                                      fill={getMoodColor(entry.name)}
                                    />
                                  ))}
                                </Bar>
                              </BarChart>
                            </ResponsiveContainer>
                          ) : (
                            <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                              No mood logs registered yet.
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      <Card className="bg-card/40 border-border text-foreground">
                        <CardHeader>
                          <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                            Daily Report Status
                          </CardTitle>
                          <CardDescription className="text-muted-foreground">
                            Breakdown of clinician approval processes
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="h-80 flex flex-col justify-between">
                          <div className="flex-1 relative">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={reportChartData}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={60}
                                  outerRadius={80}
                                  paddingAngle={5}
                                  dataKey="value"
                                >
                                  {reportChartData.map((entry, index) => (
                                    <Cell
                                      key={`cell-${index}`}
                                      fill={entry.color}
                                    />
                                  ))}
                                </Pie>
                                <ChartTooltip
                                  contentStyle={{
                                    backgroundColor: "var(--popover)",
                                    borderColor: "var(--border)",
                                    color: "var(--popover-foreground)",
                                  }}
                                />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                          <div className="flex justify-center gap-4 text-xs font-medium text-muted-foreground mt-2">
                            {reportChartData.map((d, i) => (
                              <div
                                key={i}
                                className="flex items-center gap-1.5"
                              >
                                <div
                                  className="h-2.5 w-2.5 rounded-full"
                                  style={{ backgroundColor: d.color }}
                                />
                                <span>
                                  {d.name} ({d.value})
                                </span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* User Growth Row */}
                    <div className="mt-6">
                      <Card className="bg-card/40 border-border text-foreground">
                        <CardHeader>
                          <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                            User Growth Trend
                          </CardTitle>
                          <CardDescription className="text-muted-foreground">
                            Monthly registration and platform adoption rates
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="h-80">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                              data={userGrowthData}
                              margin={{
                                top: 10,
                                right: 30,
                                left: 0,
                                bottom: 0,
                              }}
                            >
                              <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="var(--border)"
                              />
                              <XAxis
                                dataKey="name"
                                stroke="var(--muted-foreground)"
                                fontSize={12}
                              />
                              <YAxis
                                stroke="var(--muted-foreground)"
                                fontSize={12}
                                allowDecimals={false}
                              />
                              <ChartTooltip
                                cursor={false}
                                contentStyle={{
                                  backgroundColor: "var(--popover)",
                                  borderColor: "var(--border)",
                                  color: "var(--popover-foreground)",
                                  borderRadius: "var(--radius)",
                                }}
                                itemStyle={{
                                  color: "var(--foreground)",
                                }}
                                labelStyle={{
                                  color: "var(--muted-foreground)",
                                }}
                              />
                              <Line
                                type="monotone"
                                dataKey="users"
                                stroke="#6366f1"
                                strokeWidth={3}
                                dot={{
                                  stroke: "#6366f1",
                                  strokeWidth: 2,
                                  r: 4,
                                  fill: "var(--popover)",
                                }}
                                activeDot={{
                                  r: 6,
                                  strokeWidth: 0,
                                  fill: "#6366f1",
                                }}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}

                {/* TAB CONTENT: USERS DIRECTORY */}
                {activeTab === "users" && (
                  <Card className="bg-card/40 border-border text-foreground">
                    <CardHeader>
                      <CardTitle className="text-lg">
                        User Directory & Manual KYC Verification
                      </CardTitle>
                      <CardDescription className="text-muted-foreground">
                        View registered platform users, check medical licenses,
                        and approve verification states.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader className="border-border">
                          <TableRow className="hover:bg-transparent border-border">
                            <TableHead className="text-muted-foreground font-semibold">
                              User Details
                            </TableHead>
                            <TableHead className="text-muted-foreground font-semibold">
                              Email
                            </TableHead>
                            <TableHead className="text-muted-foreground font-semibold">
                              System Role
                            </TableHead>
                            <TableHead className="text-muted-foreground font-semibold">
                              Licensing / Connection
                            </TableHead>
                            <TableHead className="text-muted-foreground font-semibold">
                              KYC / Verified
                            </TableHead>
                            <TableHead className="text-muted-foreground font-semibold text-right">
                              Actions
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {users.map((u) => (
                            <TableRow
                              key={u._id}
                              className="border-border hover:bg-card/30"
                            >
                              <TableCell className="font-medium text-foreground">
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-8 w-8 bg-muted border border-border">
                                    <AvatarFallback className="text-[10px] uppercase">
                                      {u.name?.slice(0, 2)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p>{u.name}</p>
                                    <p className="text-[10px] text-muted-foreground">
                                      Joined{" "}
                                      {new Date(
                                        u.createdAt,
                                      ).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="text-foreground">
                                {u.email}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant="outline"
                                  className={`capitalize font-semibold ${
                                    u.role === "admin"
                                      ? "border-red-500/30 bg-red-500/5 text-red-400"
                                      : u.role === "doctor"
                                        ? "border-indigo-500/30 bg-indigo-500/5 text-indigo-400"
                                        : u.role === "guardian"
                                          ? "border-primary/20 bg-primary/5 text-primary"
                                          : "border-muted-foreground/20 bg-muted/5 text-foreground"
                                  }`}
                                >
                                  {u.role}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-xs text-muted-foreground">
                                {u.role === "doctor" ? (
                                  <span>
                                    License:{" "}
                                    <strong className="text-foreground">
                                      {u.licenseNumber || "N/A"}
                                    </strong>
                                  </span>
                                ) : u.role === "guardian" ? (
                                  <span>
                                    Relation:{" "}
                                    <strong className="text-foreground">
                                      {u.relationship || "N/A"}
                                    </strong>{" "}
                                    (Bot: {u.patientBotId || "N/A"})
                                  </span>
                                ) : (
                                  <span className="text-muted-foreground">
                                    —
                                  </span>
                                )}
                              </TableCell>
                              <TableCell>
                                {u.is_verified ? (
                                  <span className="inline-flex items-center gap-1 text-emerald-400 text-xs font-semibold bg-emerald-500/5 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                                    <CheckCircle className="h-3.5 w-3.5" />
                                    <span>Verified</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-amber-500 text-xs font-semibold bg-amber-500/5 border border-amber-500/20 px-2 py-0.5 rounded-full animate-pulse">
                                    <AlertCircle className="h-3.5 w-3.5" />
                                    <span>Unverified</span>
                                  </span>
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                {u.role !== "admin" && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      handleToggleVerification(
                                        u._id,
                                        u.is_verified,
                                      )
                                    }
                                    className={
                                      u.is_verified
                                        ? "text-amber-400 hover:bg-amber-950/20 hover:text-amber-300"
                                        : "text-emerald-400 hover:bg-emerald-950/20 hover:text-emerald-300"
                                    }
                                  >
                                    {u.is_verified
                                      ? "Revoke Verification"
                                      : "Approve License & KYC"}
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                )}

                {/* TAB CONTENT: DOCTOR PROFILES */}
                {activeTab === "doctors" && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h2 className="text-lg font-semibold text-foreground">
                          Medical Clinician Directory
                        </h2>
                        <p className="text-sm text-muted-foreground">
                          Add, edit, or remove Doctor accounts. Manage details
                          like specializations and licenses.
                        </p>
                      </div>
                      <Button
                        onClick={handleOpenDoctorAdd}
                        className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Add Clinician</span>
                      </Button>
                    </div>

                    <Card className="bg-card/40 border-border text-foreground">
                      <CardContent className="pt-6">
                        <Table>
                          <TableHeader className="border-border">
                            <TableRow className="hover:bg-transparent border-border">
                              <TableHead className="text-muted-foreground font-semibold">
                                Doctor Name
                              </TableHead>
                              <TableHead className="text-muted-foreground font-semibold">
                                Email Address
                              </TableHead>
                              <TableHead className="text-muted-foreground font-semibold">
                                Specialization
                              </TableHead>
                              <TableHead className="text-muted-foreground font-semibold">
                                License Number
                              </TableHead>
                              <TableHead className="text-muted-foreground font-semibold">
                                Verification Status
                              </TableHead>
                              <TableHead className="text-muted-foreground font-semibold text-right">
                                Actions
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {doctors.map((d) => (
                              <TableRow
                                key={d._id}
                                className="border-border hover:bg-card/30"
                              >
                                <TableCell className="font-semibold text-foreground">
                                  {d.name}
                                </TableCell>
                                <TableCell className="text-foreground">
                                  {d.email}
                                </TableCell>
                                <TableCell className="text-foreground">
                                  {d.specialization || "General Medicine"}
                                </TableCell>
                                <TableCell className="font-mono text-xs text-foreground">
                                  {d.licenseNumber || "N/A"}
                                </TableCell>
                                <TableCell>
                                  {d.is_verified ? (
                                    <Badge className="bg-emerald-500/10 border-emerald-500/20 text-emerald-400">
                                      Verified
                                    </Badge>
                                  ) : (
                                    <Badge className="bg-amber-500/10 border-amber-500/20 text-amber-400">
                                      Pending Verify
                                    </Badge>
                                  )}
                                </TableCell>
                                <TableCell className="text-right space-x-2">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleOpenDoctorEdit(d)}
                                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDeleteDoctor(d._id)}
                                    className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-950/20"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* TAB CONTENT: PATIENT PROFILES */}
                {activeTab === "patients" && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h2 className="text-lg font-semibold text-foreground">
                          Patient Profiles & Medication Schedules
                        </h2>
                        <p className="text-sm text-muted-foreground">
                          Create and coordinate patient profiles, link bot IDs,
                          assign clinicians, and set custom pill regimens.
                        </p>
                      </div>
                      <Button
                        onClick={handleOpenPatientAdd}
                        className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Add Patient Profile</span>
                      </Button>
                    </div>

                    <Card className="bg-card/40 border-border text-foreground">
                      <CardContent className="pt-6">
                        <Table>
                          <TableHeader className="border-border">
                            <TableRow className="hover:bg-transparent border-border">
                              <TableHead className="text-muted-foreground font-semibold">
                                Patient
                              </TableHead>
                              <TableHead className="text-muted-foreground font-semibold">
                                Hardware Bot ID
                              </TableHead>
                              <TableHead className="text-muted-foreground font-semibold">
                                Age / Gender
                              </TableHead>
                              <TableHead className="text-muted-foreground font-semibold">
                                Medical Conditions
                              </TableHead>
                              <TableHead className="text-muted-foreground font-semibold">
                                Clinician
                              </TableHead>
                              <TableHead className="text-muted-foreground font-semibold">
                                Guardian
                              </TableHead>
                              <TableHead className="text-muted-foreground font-semibold text-right">
                                Actions
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {patients.map((p) => {
                              const docObj = doctors.find(
                                (d) => d._id === p.assignedDoctorId,
                              );
                              const guardianObj = users.find(
                                (u) => u._id === p.guardianId,
                              );
                              return (
                                <TableRow
                                  key={p._id}
                                  className="border-border hover:bg-card/30"
                                >
                                  <TableCell className="font-semibold text-foreground">
                                    <div>
                                      <p>{p.name}</p>
                                      <p className="text-[10px] text-muted-foreground">
                                        {p.email}
                                      </p>
                                    </div>
                                  </TableCell>
                                  <TableCell className="font-mono text-xs text-primary">
                                    {p.botId}
                                  </TableCell>
                                  <TableCell className="text-foreground capitalize">
                                    {p.age || "N/A"} yrs / {p.gender || "N/A"}
                                  </TableCell>
                                  <TableCell className="max-w-[150px] truncate text-foreground">
                                    {p.conditions && p.conditions.length > 0 ? (
                                      <div className="flex flex-wrap gap-1">
                                        {p.conditions
                                          .slice(0, 2)
                                          .map((c: string, idx: number) => (
                                            <Badge
                                              key={idx}
                                              variant="outline"
                                              className="text-[10px] border-border text-muted-foreground"
                                            >
                                              {c}
                                            </Badge>
                                          ))}
                                        {p.conditions.length > 2 && (
                                          <span className="text-[10px] text-muted-foreground">
                                            +{p.conditions.length - 2}
                                          </span>
                                        )}
                                      </div>
                                    ) : (
                                      "None"
                                    )}
                                  </TableCell>
                                  <TableCell className="text-xs text-foreground">
                                    {docObj ? docObj.name : "Unassigned"}
                                  </TableCell>
                                  <TableCell className="text-xs text-foreground">
                                    {guardianObj
                                      ? guardianObj.name
                                      : "Unassigned"}
                                  </TableCell>
                                  <TableCell className="text-right space-x-2">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleOpenPatientEdit(p)}
                                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleDeletePatient(p._id)}
                                      className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-950/20"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* TAB CONTENT: HEALTH REPORTS (READ ONLY) */}
                {activeTab === "reports" && (
                  <Card className="bg-card/40 border-border text-foreground">
                    <CardHeader>
                      <CardTitle className="text-lg">
                        Patient Daily AI Reports (Read-Only)
                      </CardTitle>
                      <CardDescription className="text-muted-foreground">
                        Inspect patient health summaries, emotional mood
                        metrics, and medication schedules logged by the Pi
                        Hardware Bot.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader className="border-border">
                          <TableRow className="hover:bg-transparent border-border">
                            <TableHead className="text-muted-foreground font-semibold">
                              Date
                            </TableHead>
                            <TableHead className="text-muted-foreground font-semibold">
                              Patient Name
                            </TableHead>
                            <TableHead className="text-muted-foreground font-semibold">
                              Bot ID
                            </TableHead>
                            <TableHead className="text-muted-foreground font-semibold">
                              Emotional State
                            </TableHead>
                            <TableHead className="text-muted-foreground font-semibold">
                              Approval Status
                            </TableHead>
                            <TableHead className="text-muted-foreground font-semibold text-right">
                              Action
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {reports.map((rep) => {
                            const patientObj = patients.find(
                              (p) =>
                                p._id === rep.patientId ||
                                p.botId === rep.botId,
                            );
                            const patientName = patientObj
                              ? patientObj.name
                              : "Unknown Patient";
                            const moodObj = rep.analyses?.[0];
                            return (
                              <TableRow
                                key={rep._id}
                                className="border-border hover:bg-card/30"
                              >
                                <TableCell className="font-medium text-foreground">
                                  <div className="flex items-center gap-1 text-foreground">
                                    <Calendar className="h-3.5 w-3.5 text-primary" />
                                    <span>{rep.date}</span>
                                  </div>
                                </TableCell>
                                <TableCell className="font-semibold text-foreground">
                                  {patientName}
                                </TableCell>
                                <TableCell className="font-mono text-xs text-muted-foreground">
                                  {rep.botId}
                                </TableCell>
                                <TableCell>
                                  {moodObj?.mood ? (
                                    <span className="text-foreground text-sm">
                                      {moodObj.mood}{" "}
                                      <span className="text-xs text-muted-foreground">
                                        ({moodObj.mood_intensity}/10)
                                      </span>
                                    </span>
                                  ) : (
                                    "N/A"
                                  )}
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    className={
                                      rep.reportStatus === "approved"
                                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                                        : rep.reportStatus === "rejected"
                                          ? "bg-red-500/10 border-red-500/20 text-red-400"
                                          : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                                    }
                                  >
                                    {rep.reportStatus}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleOpenReportDetails(rep)}
                                    className="border-border hover:bg-accent hover:text-accent-foreground text-foreground hover:text-white"
                                  >
                                    <Eye className="h-3.5 w-3.5 mr-1" />
                                    <span>Details</span>
                                  </Button>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                )}

                {/* --- DOCTOR DASHBOARD TAB --- */}
                {activeTab === "doctor_dashboard" && (
                  <DoctorDashboard
                    dashboard={doctorDashboard}
                    patients={patients}
                    search={searchQuery}
                    onSearchChange={setSearchQuery}
                    onSelectPatient={(pId) => {
                      setSelectedPatientId(pId);
                      setActiveTab("doctor_patients");
                    }}
                    onNavigateToReports={() => setActiveTab("doctor_reports")}
                  />
                )}

                {/* --- DOCTOR PATIENTS / DETAIL VIEW --- */}
                {activeTab === "doctor_patients" && (
                  selectedPatientId ? (
                    <PatientDetailView
                      patient={patients.find((p) => p._id === selectedPatientId)}
                      onBack={() => {
                        setSelectedPatientId(null);
                        setActiveTab("doctor_dashboard");
                      }}
                      onNavigateToReports={(pId) => {
                        setSelectedPatientId(pId);
                        setActiveTab("doctor_reports");
                      }}
                    />
                  ) : (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center px-1 text-left">
                        <h2 className="text-lg font-black text-foreground tracking-tight">Select Patient Profile</h2>
                        <span className="text-xs font-bold text-muted-foreground">{patients.length} patients</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {patients.map((patient) => (
                          <Card
                            key={patient._id}
                            onClick={() => {
                              setSelectedPatientId(patient._id);
                            }}
                            className="bg-card/45 hover:bg-card/85 cursor-pointer border-border hover:border-border/80 rounded-[20px] p-5 shadow-sm hover:shadow transition relative flex items-center gap-4 pl-6 group text-left"
                          >
                            <div className="absolute left-0 top-5 bottom-5 w-1 bg-yellow-500 rounded-r-lg group-hover:h-8 transition-all"></div>
                            <div className="w-11 h-11 rounded-xl bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition shrink-0">
                              <User className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-foreground group-hover:text-primary transition truncate">{patient.name}</h4>
                              <p className="text-xs font-semibold text-muted-foreground mt-0.5">
                                Age: {patient.age} &bull; {patient.conditions?.[0] || "General Dementia"}
                              </p>
                            </div>
                            <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center text-yellow-500 shrink-0">
                              <Zap className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )
                )}

                {/* --- DOCTOR REPORTS VIEW --- */}
                {activeTab === "doctor_reports" && (
                  selectedSessionId ? (
                    <ConversationView
                      session={sessions.find((s) => s._id === selectedSessionId)}
                      onBack={() => {
                        setSelectedSessionId(null);
                      }}
                    />
                  ) : (
                    <ReportListView
                      reports={reports}
                      role="doctor"
                      patientId={selectedPatientId || ""}
                      onBack={() => {
                        if (selectedPatientId) {
                          setActiveTab("doctor_patients");
                        } else {
                          setActiveTab("doctor_dashboard");
                        }
                      }}
                      onNavigateToHistory={() => {
                        setActiveTab("doctor_sessions");
                      }}
                      onNavigateToSession={(sId) => {
                        setSelectedSessionId(sId);
                      }}
                      onApprove={handleApproveReport}
                    />
                  )
                )}

                {/* --- DOCTOR SESSIONS / HISTORY VIEW --- */}
                {activeTab === "doctor_sessions" && (
                  selectedSessionId ? (
                    <ConversationView
                      session={sessions.find((s) => s._id === selectedSessionId)}
                      onBack={() => {
                        setSelectedSessionId(null);
                      }}
                    />
                  ) : (
                    <SessionHistoryView
                      sessions={sessions}
                      role="doctor"
                      patientId={selectedPatientId || ""}
                      onBack={() => {
                        setActiveTab("doctor_reports");
                      }}
                      onSelectSession={(sId) => {
                        setSelectedSessionId(sId);
                      }}
                    />
                  )
                )}
                {/* --- GUARDIAN DASHBOARD TAB --- */}
                {activeTab === "guardian_dashboard" && (
                  <GuardianDashboard
                    dashboard={guardianDashboard}
                    reports={reports}
                    onNavigateToReports={() => setActiveTab("guardian_reports")}
                    onNavigateToSessions={() => setActiveTab("guardian_sessions")}
                    onNavigateToDevice={() => setActiveTab("guardian_device")}
                  />
                )}

                {/* --- GUARDIAN REPORTS TAB --- */}
                {activeTab === "guardian_reports" && (
                  selectedSessionId ? (
                    <ConversationView
                      session={sessions.find((s) => s._id === selectedSessionId)}
                      onBack={() => {
                        setSelectedSessionId(null);
                      }}
                    />
                  ) : (
                    <ReportListView
                      reports={reports}
                      role="guardian"
                      patientId={guardianDashboard?.patient?._id || ""}
                      onBack={() => {
                        setActiveTab("guardian_dashboard");
                      }}
                      onNavigateToHistory={() => {
                        setActiveTab("guardian_sessions");
                      }}
                      onNavigateToSession={(sId) => {
                        setSelectedSessionId(sId);
                      }}
                      onApprove={async () => {}}
                    />
                  )
                )}

                {/* --- GUARDIAN SESSIONS TAB --- */}
                {activeTab === "guardian_sessions" && (
                  selectedSessionId ? (
                    <ConversationView
                      session={sessions.find((s) => s._id === selectedSessionId)}
                      onBack={() => {
                        setSelectedSessionId(null);
                      }}
                    />
                  ) : (
                    <SessionHistoryView
                      sessions={sessions}
                      role="guardian"
                      patientId={guardianDashboard?.patient?._id || ""}
                      onBack={() => {
                        setActiveTab("guardian_reports");
                      }}
                      onSelectSession={(sId) => {
                        setSelectedSessionId(sId);
                      }}
                    />
                  )
                )}

                {/* --- GUARDIAN DEVICE LINK TAB --- */}
                {activeTab === "guardian_device" && (
                  <ConnectDeviceView
                    botId={guardianDashboard?.patient?.botId || ""}
                    onBack={() => {
                      setActiveTab("guardian_dashboard");
                    }}
                    onLinkBot={(newBotId) => {
                      setGuardianDashboard((prev: any) => ({
                        ...prev,
                        patient: prev?.patient ? { ...prev.patient, botId: newBotId } : null
                      }));
                    }}
                  />
                )}
              </>
            )}
          </div>
        </SidebarInset>

        {/* DOCTOR DIALOG */}
        <Dialog open={doctorDialogOpen} onOpenChange={setDoctorDialogOpen}>
          <DialogContent className="bg-card border-border text-foreground max-w-md shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-primary font-bold">
                {selectedDoctor
                  ? "Edit Doctor Profile"
                  : "Register Doctor Account"}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Provide necessary credentials and medical verification
                coordinates.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSaveDoctor} className="space-y-4">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                  Full Name
                </Label>
                <Input
                  value={doctorForm.name}
                  onChange={(e) =>
                    setDoctorForm((p) => ({ ...p, name: e.target.value }))
                  }
                  required
                  className="bg-background/80 border-border text-white placeholder:text-muted-foreground/50 focus:border-primary focus:ring-ring/20"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                  Email Address
                </Label>
                <Input
                  type="email"
                  value={doctorForm.email}
                  onChange={(e) =>
                    setDoctorForm((p) => ({ ...p, email: e.target.value }))
                  }
                  required
                  className="bg-background/80 border-border text-white placeholder:text-muted-foreground/50 focus:border-primary focus:ring-ring/20"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                  Password {selectedDoctor && "(Leave blank to keep current)"}
                </Label>
                <Input
                  type="password"
                  value={doctorForm.password}
                  onChange={(e) =>
                    setDoctorForm((p) => ({ ...p, password: e.target.value }))
                  }
                  required={!selectedDoctor}
                  className="bg-background/80 border-border text-white placeholder:text-muted-foreground/50 focus:border-primary focus:ring-ring/20"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                  Specialization
                </Label>
                <Input
                  value={doctorForm.specialization}
                  onChange={(e) =>
                    setDoctorForm((p) => ({
                      ...p,
                      specialization: e.target.value,
                    }))
                  }
                  placeholder="e.g. Geriatric Medicine"
                  className="bg-background/80 border-border text-white placeholder:text-muted-foreground/50 focus:border-primary focus:ring-ring/20"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                  Medical License Number
                </Label>
                <Input
                  value={doctorForm.licenseNumber}
                  onChange={(e) =>
                    setDoctorForm((p) => ({
                      ...p,
                      licenseNumber: e.target.value,
                    }))
                  }
                  placeholder="e.g. NMC-12345"
                  className="bg-background/80 border-border text-white placeholder:text-muted-foreground/50 focus:border-primary focus:ring-ring/20"
                />
              </div>
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="is_verified"
                  checked={doctorForm.is_verified}
                  onChange={(e) =>
                    setDoctorForm((p) => ({
                      ...p,
                      is_verified: e.target.checked,
                    }))
                  }
                  className="rounded border-border text-primary focus:ring-ring/20 bg-background"
                />
                <Label
                  htmlFor="is_verified"
                  className="text-xs text-foreground select-none"
                >
                  Verify this doctor immediately
                </Label>
              </div>
              <DialogFooter className="pt-4 border-t border-border/80 mt-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setDoctorDialogOpen(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
                >
                  Save Clinician
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* PATIENT DIALOG */}
        <Dialog open={patientDialogOpen} onOpenChange={setPatientDialogOpen}>
          <DialogContent className="bg-card border-border text-foreground max-w-2xl max-h-[90vh] overflow-y-auto overflow-x-hidden shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-primary font-bold">
                {selectedPatient
                  ? "Edit Patient Profile"
                  : "Register Patient Account"}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Configure patient metrics, doctor/guardian linkages, and
                schedules of daily medicines.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSavePatient} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                    Full Name
                  </Label>
                  <Input
                    value={patientForm.name}
                    onChange={(e) =>
                      setPatientForm((p) => ({ ...p, name: e.target.value }))
                    }
                    required
                    className="bg-background/80 border-border text-white placeholder:text-muted-foreground/50 focus:border-primary focus:ring-ring/20"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                    Email Address
                  </Label>
                  <Input
                    type="email"
                    value={patientForm.email}
                    onChange={(e) =>
                      setPatientForm((p) => ({ ...p, email: e.target.value }))
                    }
                    required
                    className="bg-background/80 border-border text-white placeholder:text-muted-foreground/50 focus:border-primary focus:ring-ring/20"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                    Password{" "}
                    {selectedPatient && "(Leave blank to keep current)"}
                  </Label>
                  <Input
                    type="password"
                    value={patientForm.password}
                    onChange={(e) =>
                      setPatientForm((p) => ({
                        ...p,
                        password: e.target.value,
                      }))
                    }
                    required={!selectedPatient}
                    className="bg-background/80 border-border text-white placeholder:text-muted-foreground/50 focus:border-primary focus:ring-ring/20"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                    Age
                  </Label>
                  <Input
                    type="number"
                    value={patientForm.age}
                    onChange={(e) =>
                      setPatientForm((p) => ({ ...p, age: e.target.value }))
                    }
                    className="bg-background/80 border-border text-white placeholder:text-muted-foreground/50 focus:border-primary focus:ring-ring/20"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                    Gender
                  </Label>
                  <select
                    value={patientForm.gender}
                    onChange={(e) =>
                      setPatientForm((p) => ({
                        ...p,
                        gender: e.target.value as any,
                      }))
                    }
                    className="w-full bg-background border border-border text-white rounded-md h-9 px-3 focus:border-primary focus:ring-ring/20"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                    Blood Group
                  </Label>
                  <Input
                    value={patientForm.bloodGroup}
                    onChange={(e) =>
                      setPatientForm((p) => ({
                        ...p,
                        bloodGroup: e.target.value,
                      }))
                    }
                    placeholder="e.g. A+"
                    className="bg-background/80 border-border text-white placeholder:text-muted-foreground/50 focus:border-primary focus:ring-ring/20"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                    Assigned Doctor
                  </Label>
                  <select
                    value={patientForm.assignedDoctorId}
                    onChange={(e) =>
                      setPatientForm((p) => ({
                        ...p,
                        assignedDoctorId: e.target.value,
                      }))
                    }
                    className="w-full bg-background border border-border text-white rounded-md h-9 px-3 focus:border-primary focus:ring-ring/20 text-sm"
                  >
                    <option value="">Unassigned</option>
                    {doctors.map((d) => (
                      <option key={d._id} value={d._id}>
                        {d.name} ({d.specialization})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                    Assigned Guardian
                  </Label>
                  <select
                    value={patientForm.guardianId}
                    onChange={(e) =>
                      setPatientForm((p) => ({
                        ...p,
                        guardianId: e.target.value,
                      }))
                    }
                    className="w-full bg-background border border-border text-white rounded-md h-9 px-3 focus:border-primary focus:ring-ring/20 text-sm"
                  >
                    <option value="">Unassigned</option>
                    {users
                      .filter((u) => u.role === "guardian")
                      .map((g) => (
                        <option key={g._id} value={g._id}>
                          {g.name} ({g.relationship})
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                  Medical Conditions (Comma-separated)
                </Label>
                <Input
                  value={patientForm.conditions}
                  onChange={(e) =>
                    setPatientForm((p) => ({
                      ...p,
                      conditions: e.target.value,
                    }))
                  }
                  placeholder="e.g. Alzheimer's Disease, Hypertension"
                  className="bg-background/80 border-border text-white placeholder:text-muted-foreground/50 focus:border-primary focus:ring-ring/20"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                  Allergies (Comma-separated)
                </Label>
                <Input
                  value={patientForm.allergies}
                  onChange={(e) =>
                    setPatientForm((p) => ({ ...p, allergies: e.target.value }))
                  }
                  placeholder="e.g. Peanuts, Penicillin"
                  className="bg-background/80 border-border text-white placeholder:text-muted-foreground/50 focus:border-primary focus:ring-ring/20"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                  Clinical Notes
                </Label>
                <textarea
                  value={patientForm.notes}
                  onChange={(e) =>
                    setPatientForm((p) => ({ ...p, notes: e.target.value }))
                  }
                  rows={3}
                  placeholder="Diagnostic history, cognitive metrics or care directions..."
                  className="w-full bg-background border border-border text-white rounded-md p-3 focus:border-primary focus:ring-ring/20 text-sm"
                />
              </div>

              {/* MEDICINES BUILDER */}
              <div className="border border-border rounded-lg p-4 bg-background/30 space-y-4">
                <div className="flex items-center gap-2 border-b border-border pb-2">
                  <Pill className="h-4 w-4 text-primary" />
                  <span className="font-semibold text-sm">
                    Medication Regimen Planner
                  </span>
                </div>

                {/* Medicine List */}
                {patientForm.medicines.length > 0 ? (
                  <div className="space-y-2">
                    {patientForm.medicines.map((m, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center bg-background p-2.5 rounded-lg border border-border text-xs"
                      >
                        <div>
                          <p className="font-semibold text-foreground">
                            {m.name}{" "}
                            <span className="text-muted-foreground">
                              ({m.dosage})
                            </span>
                          </p>
                          <p className="text-muted-foreground capitalize">
                            {m.frequency} • times: {m.times?.join(", ")}
                          </p>
                          {m.notes && (
                            <p className="text-[10px] text-primary mt-0.5">
                              Note: {m.notes}
                            </p>
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveMedicine(idx)}
                          className="h-7 w-7 text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-xs italic">
                    No medicines scheduled for this patient.
                  </p>
                )}

                {/* Add New Medicine Form */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-end bg-background/60 p-3 rounded-lg border border-border/60">
                  <div className="space-y-1">
                    <Label className="text-[10px] uppercase text-muted-foreground">
                      Pill Name
                    </Label>
                    <Input
                      value={newMedicine.name}
                      onChange={(e) =>
                        setNewMedicine((p) => ({ ...p, name: e.target.value }))
                      }
                      placeholder="e.g. Magnesium"
                      className="h-8 text-xs bg-background"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] uppercase text-muted-foreground">
                      Dosage
                    </Label>
                    <Input
                      value={newMedicine.dosage}
                      onChange={(e) =>
                        setNewMedicine((p) => ({
                          ...p,
                          dosage: e.target.value,
                        }))
                      }
                      placeholder="e.g. 200mg"
                      className="h-8 text-xs bg-background"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] uppercase text-muted-foreground">
                      Times (Comma-separated)
                    </Label>
                    <Input
                      value={newMedicine.times}
                      onChange={(e) =>
                        setNewMedicine((p) => ({ ...p, times: e.target.value }))
                      }
                      placeholder="08:00, 21:00"
                      className="h-8 text-xs bg-background"
                    />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <Label className="text-[10px] uppercase text-muted-foreground">
                      Intake Notes
                    </Label>
                    <Input
                      value={newMedicine.notes}
                      onChange={(e) =>
                        setNewMedicine((p) => ({ ...p, notes: e.target.value }))
                      }
                      placeholder="Take after food / helps with sleep"
                      className="h-8 text-xs bg-background"
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={handleAddMedicine}
                    className="h-8 bg-muted text-foreground hover:bg-accent font-semibold text-xs gap-1 w-full"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Pill</span>
                  </Button>
                </div>
              </div>

              <DialogFooter className="pt-4 border-t border-border/80 mt-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setPatientDialogOpen(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
                >
                  Save Patient Profile
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* REPORT VIEW DETAILS DIALOG (READ ONLY) */}
        <Dialog open={reportDetailsOpen} onOpenChange={setReportDetailsOpen}>
          <DialogContent className="bg-card border-border text-foreground max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl">
            <DialogHeader className="border-b border-border pb-4">
              <div className="flex items-center justify-between">
                <DialogTitle className="text-primary font-bold flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <span>Daily Health Report Details</span>
                </DialogTitle>
                {selectedReport && (
                  <Badge
                    className={
                      selectedReport.reportStatus === "approved"
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                        : selectedReport.reportStatus === "rejected"
                          ? "bg-red-500/10 border-red-500/20 text-red-400"
                          : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                    }
                  >
                    {selectedReport.reportStatus}
                  </Badge>
                )}
              </div>
              <DialogDescription className="text-muted-foreground mt-1">
                Read-only view of patient logs synced from Raspberry Pi Hardware
                Bot.
              </DialogDescription>
            </DialogHeader>

            {selectedReport && (
              <div className="space-y-6 pt-4 text-sm">
                <div className="grid grid-cols-2 gap-4 bg-background p-4 rounded-lg border border-border">
                  <div>
                    <span className="text-xs text-muted-foreground block">
                      Patient Name
                    </span>
                    <span className="font-semibold text-foreground">
                      {selectedReport.patientName}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">
                      Report Date
                    </span>
                    <span className="font-semibold text-foreground">
                      {selectedReport.date}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">
                      Hardware Bot ID
                    </span>
                    <span className="font-mono text-xs text-primary">
                      {selectedReport.botId}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">
                      Reviewed At
                    </span>
                    <span className="text-foreground">
                      {selectedReport.reviewedAt
                        ? new Date(selectedReport.reviewedAt).toLocaleString()
                        : "Pending Clinician Review"}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    AI Daily Health Summary
                  </span>
                  <div className="bg-background p-4 rounded-lg border border-border leading-relaxed text-foreground whitespace-pre-wrap break-words font-mono text-xs">
                    {selectedReport.summary}
                  </div>
                </div>

                {/* Mood and Analyses */}
                {selectedReport.analyses &&
                  selectedReport.analyses.length > 0 && (
                    <div className="space-y-4">
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block border-b border-border pb-1">
                        Intake & Emotional Analysis
                      </span>
                      {selectedReport.analyses.map(
                        (analysis: any, idx: number) => (
                          <div
                            key={idx}
                            className="space-y-3 bg-background/40 p-4 rounded-lg border border-border"
                          >
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-medium text-muted-foreground">
                                Emotional State:{" "}
                                <strong className="text-foreground">
                                  {analysis.mood || "N/A"}
                                </strong>
                              </span>
                              <div className="flex items-center gap-1">
                                <span className="text-xs text-muted-foreground">
                                  Intensity:
                                </span>
                                <span className="text-xs font-bold text-primary">
                                  {analysis.mood_intensity || 5}/10
                                </span>
                              </div>
                            </div>

                            {/* Pill logs */}
                            {analysis.medicine_log &&
                              analysis.medicine_log.length > 0 && (
                                <div className="space-y-1.5 pt-2">
                                  <span className="text-xs font-semibold text-muted-foreground block">
                                    Pill Intake Logs:
                                  </span>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {analysis.medicine_log.map(
                                      (log: any, logIdx: number) => (
                                        <div
                                          key={logIdx}
                                          className="flex justify-between items-center bg-background px-3 py-2 rounded-lg border border-border text-xs"
                                        >
                                          <span className="font-medium text-foreground">
                                            {log.name}
                                          </span>
                                          <Badge
                                            className={
                                              log.status === "taken"
                                                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                                                : log.status === "missed"
                                                  ? "bg-red-500/10 border-red-500/20 text-red-400"
                                                  : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                                            }
                                          >
                                            {log.status}
                                          </Badge>
                                        </div>
                                      ),
                                    )}
                                  </div>
                                </div>
                              )}

                            {/* Forgotten items */}
                            {analysis.forgotten_items &&
                              analysis.forgotten_items.length > 0 && (
                                <div className="pt-2">
                                  <span className="text-xs font-semibold text-muted-foreground block">
                                    Forgotten items detected by bot:
                                  </span>
                                  <div className="flex flex-wrap gap-1.5 mt-1">
                                    {analysis.forgotten_items.map(
                                      (item: string, itemIdx: number) => (
                                        <Badge
                                          key={itemIdx}
                                          variant="outline"
                                          className="border-red-500/30 bg-red-500/5 text-red-400 text-[10px]"
                                        >
                                          {item}
                                        </Badge>
                                      ),
                                    )}
                                  </div>
                                </div>
                              )}
                          </div>
                        ),
                      )}
                    </div>
                  )}

                {/* Clinician Notes */}
                {selectedReport.doctorNotes && (
                  <div className="space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Clinician Notes
                    </span>
                    <div className="bg-background p-4 rounded-lg border border-border italic text-muted-foreground">
                      "{selectedReport.doctorNotes}"
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="border-t border-border pt-4 flex justify-end">
              <Button
                onClick={() => setReportDetailsOpen(false)}
                className="bg-muted hover:bg-accent hover:text-accent-foreground text-foreground"
              >
                Close View
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </SidebarProvider>
  );
}
