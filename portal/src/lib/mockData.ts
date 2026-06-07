// TypeScript static mock data repository for portal dashboard evaluation

export const MOCK_PATIENTS = [
  {
    _id: "pat_1",
    name: "Hari Prasad",
    age: 72,
    gender: "male",
    conditions: ["Early-onset Dementia"],
    medicines: [
      { name: "Metformin", dosage: "500mg", frequency: "daily", times: ["08:00 AM"] },
      { name: "Atorvastatin", dosage: "20mg", frequency: "daily", times: ["10:00 PM"] }
    ],
    botId: "bot_1",
    isActive: true
  },
  {
    _id: "pat_2",
    name: "Shyam Thapa",
    age: 65,
    gender: "male",
    conditions: ["Mild Cognitive Impairment"],
    medicines: [
      { name: "Donepezil", dosage: "10mg", frequency: "daily", times: ["09:00 PM"] }
    ],
    botId: "bot_2",
    isActive: true
  },
  {
    _id: "pat_3",
    name: "Gita Devi",
    age: 68,
    gender: "female",
    conditions: ["Vascular Dementia"],
    medicines: [
      { name: "Memantine", dosage: "10mg", frequency: "daily", times: ["09:00 AM"] }
    ],
    botId: "bot_3",
    isActive: true
  }
];

export const MOCK_REPORTS = [
  {
    _id: "rep_1",
    patientId: MOCK_PATIENTS[0],
    createdAt: new Date().toISOString(),
    startedAt: new Date().toISOString(),
    reportStatus: "pending",
    report: "Patient showed moderate memory recall errors during morning check-in. Mood was generally stable but showed slight signs of confusion when asked about medication schedules.",
    doctorNotes: "",
    analyses: [{
      mood: "Anxious",
      mood_intensity: 6,
      medicine_log: [
        { name: "Metformin", status: "taken" },
        { name: "Atorvastatin", status: "taken" }
      ]
    }]
  },
  {
    _id: "rep_2",
    patientId: MOCK_PATIENTS[0],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    startedAt: new Date(Date.now() - 86400000).toISOString(),
    reportStatus: "approved",
    report: "Patient was highly active, conversed smoothly about lunch preferences, and completed memory matching exercises with 80% accuracy.",
    doctorNotes: "Consistent cognitive level. Keep encouraging the matching games.",
    reviewedBy: { name: "Dr. Adit" },
    analyses: [{
      mood: "Calm",
      mood_intensity: 3,
      medicine_log: [
        { name: "Metformin", status: "taken" },
        { name: "Atorvastatin", status: "taken" }
      ]
    }]
  }
];

export const MOCK_SESSIONS = [
  {
    _id: "rep_1",
    patientId: MOCK_PATIENTS[0],
    startedAt: new Date().toISOString(),
    durationSeconds: 320,
    reportStatus: "pending",
    analyses: [{ mood: "Anxious", mood_intensity: 6 }],
    turns: [
      { role: "assistant", content: "Good morning Hari! Did you sleep well last night?" },
      { role: "user", content: "I slept okay, but I can't find my glasses." },
      { role: 'assistant', content: 'No worries, they are usually on your side table. Did you take your Metformin pill with breakfast?' },
      { role: 'user', content: 'Yes, my daughter gave it to me earlier.' }
    ]
  },
  {
    _id: "rep_2",
    patientId: MOCK_PATIENTS[0],
    startedAt: new Date(Date.now() - 86400000).toISOString(),
    durationSeconds: 450,
    reportStatus: "approved",
    analyses: [{ mood: "Calm", mood_intensity: 3 }],
    turns: [
      { role: "assistant", content: "Hello Hari! Let's play a quick word game today." },
      { role: "user", content: "Okay, I like games. Let's do it." },
      { role: "assistant", content: "Great! Can you name three yellow fruits?" },
      { role: "user", content: "Banana... Lemon... and yellow apples!" }
    ]
  }
];

export function getMockDataFallback(endpoint: string, options: RequestInit = {}) {
  // Check auth login endpoint
  if (endpoint.startsWith("/api/auth/login")) {
    const { email, role } = JSON.parse(options.body as string || "{}");
    const dummyUser = {
      _id: "user_dummy",
      name: role === "doctor" ? "Dr. Adit" : "Caregiver Adit",
      email: email || "user@careplus.com",
      role: role || "guardian",
      patientBotId: "bot_1"
    };
    return { success: true, data: { token: "mock_jwt_token", user: dummyUser } };
  }

  // Doctor endpoints
  if (endpoint === "/api/doctor/dashboard") {
    return {
      success: true,
      data: {
        patientsCount: MOCK_PATIENTS.length,
        pendingCount: MOCK_REPORTS.filter(r => r.reportStatus === 'pending').length,
        approvedCount: MOCK_REPORTS.filter(r => r.reportStatus === 'approved').length,
        recentSessions: MOCK_REPORTS
      }
    };
  }

  if (endpoint === "/api/doctor/patients") {
    return { success: true, data: MOCK_PATIENTS };
  }

  if (endpoint.startsWith("/api/doctor/patients/")) {
    const patId = endpoint.split("/").pop();
    const patient = MOCK_PATIENTS.find(p => p._id === patId) || MOCK_PATIENTS[0];
    return { success: true, data: patient };
  }

  if (endpoint.startsWith("/api/doctor/reports") || endpoint.startsWith("/api/guardian/reports")) {
    return { success: true, data: { reports: MOCK_REPORTS, total: MOCK_REPORTS.length } };
  }

  if (endpoint.startsWith("/api/doctor/sessions") || endpoint.startsWith("/api/guardian/sessions")) {
    const match = endpoint.match(/\/sessions\/([a-zA-Z0-9_-]+)$/);
    if (match) {
      const ses = MOCK_SESSIONS.find(s => s._id === match[1]) || MOCK_SESSIONS[0];
      return { success: true, data: ses };
    }
    return { success: true, data: { sessions: MOCK_SESSIONS, total: MOCK_SESSIONS.length } };
  }

  // Guardian endpoints
  if (endpoint === "/api/guardian/dashboard") {
    return {
      success: true,
      data: {
        patient: MOCK_PATIENTS[0],
        reports: MOCK_REPORTS,
        stats: { total: MOCK_REPORTS.length }
      }
    };
  }

  if (endpoint.includes("/approve")) {
    const match = endpoint.match(/\/reports\/([a-zA-Z0-9_-]+)\/approve/);
    const reportId = match ? match[1] : null;
    const body = options.body ? JSON.parse(options.body as string) : {};
    const notes = body.doctorNotes || "";
    
    if (reportId) {
      const rep = MOCK_REPORTS.find(r => r._id === reportId);
      if (rep) {
        rep.reportStatus = "approved";
        rep.doctorNotes = notes;
        rep.reviewedBy = { name: "Dr. Adit" };
      }
      const ses = MOCK_SESSIONS.find(s => s._id === reportId) as any;
      if (ses) {
        ses.reportStatus = "approved";
        ses.doctorNotes = notes;
        ses.reviewedBy = { name: "Dr. Adit" };
      }
    }
    return { success: true, message: "Approved successfully" };
  }

  throw new Error(`Offline and no mock match for: ${endpoint}`);
}
