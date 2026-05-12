"use client";
import { useState, useEffect, useCallback } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

type Period = "daily" | "weekly" | "monthly";

interface ReportData {
  userId: string;
  period: string;
  label: string;
  generatedAt: string;
  medicine: {
    total: number; taken: number; missed: number; skipped: number;
    complianceRate: number;
    medicines: { name: string; taken: number; missed: number; skipped: number; dosage: string; total: number }[];
    recentLogs: { medicineName: string; dosage: string; status: string; scheduledTime: string; timestamp: string }[];
  };
  mood: {
    average: number; min: number; max: number; entries: number;
    trend: "improving" | "declining" | "stable";
    data: { score: number; note: string; timestamp: string }[];
  };
  chat: {
    totalMessages: number; userMessages: number; assistantMessages: number;
    totalSessions: number; peakHour: number;
    hourDistribution: number[];
    recentMessages: { role: string; content: string; timestamp: string }[];
  };
  objects: {
    totalTracked: number; uniqueItems: number;
    recentItems: { name: string; location: string; timestamp: string }[];
  };
}

// ── Animated number counter ──────────────────────────────────────
function AnimNum({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (value === 0) { setDisplay(0); return; }
    const dur = 800, steps = 30, inc = value / steps;
    let cur = 0, step = 0;
    const iv = setInterval(() => {
      step++; cur += inc;
      if (step >= steps) { setDisplay(value); clearInterval(iv); }
      else setDisplay(Math.round(cur));
    }, dur / steps);
    return () => clearInterval(iv);
  }, [value]);
  return <>{display}{suffix}</>;
}

// ── Circular progress ring ───────────────────────────────────────
function Ring({ pct, size = 90, stroke = 8, color = "#6366f1" }: { pct: number; size?: number; stroke?: number; color?: string }) {
  const r = (size - stroke) / 2, circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 1s ease" }} />
      <text x={size/2} y={size/2} textAnchor="middle" dominantBaseline="central" fill="white"
        fontSize={size * 0.22} fontWeight="700" style={{ transform: "rotate(90deg)", transformOrigin: "center" }}>
        {pct}%
      </text>
    </svg>
  );
}

// ── Mini bar chart ───────────────────────────────────────────────
function MiniBar({ data, height = 60 }: { data: number[]; height?: number }) {
  const max = Math.max(...data, 1);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height }}>
      {data.map((v, i) => (
        <div key={i} title={`${i}:00 — ${v} msgs`} style={{
          flex: 1, minWidth: 4, borderRadius: 3,
          height: `${Math.max((v / max) * 100, 4)}%`,
          background: v === Math.max(...data) ? "#818cf8" : "rgba(255,255,255,0.15)",
          transition: "height 0.6s ease",
        }} />
      ))}
    </div>
  );
}

// ── Status badge ─────────────────────────────────────────────────
function Badge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    taken: "#22c55e", missed: "#ef4444", skipped: "#f59e0b",
  };
  return (
    <span style={{
      padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, letterSpacing: 0.5,
      background: `${colors[status] || "#6b7280"}22`, color: colors[status] || "#6b7280",
      textTransform: "uppercase",
    }}>{status}</span>
  );
}

// ── Mood emoji ───────────────────────────────────────────────────
function moodEmoji(score: number) {
  if (score >= 8) return "😄";
  if (score >= 6) return "🙂";
  if (score >= 4) return "😐";
  if (score >= 2) return "😟";
  return "😢";
}

function trendIcon(t: string) {
  if (t === "improving") return "📈";
  if (t === "declining") return "📉";
  return "➡️";
}

function fmtTime(ts: string) {
  return new Date(ts).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

function fmtDate(ts: string) {
  return new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

// ═════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═════════════════════════════════════════════════════════════════
export default function ReportsPage() {
  const [period, setPeriod] = useState<Period>("daily");
  const [userId, setUserId] = useState("patient-1");
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchReport = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const res = await fetch(`${API}/api/reports?userId=${userId}&period=${period}`);
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      setReport(await res.json());
    } catch (e: any) {
      setError(e.message || "Failed to load report");
    } finally {
      setLoading(false);
    }
  }, [period, userId]);

  useEffect(() => { fetchReport(); }, [fetchReport]);

  const periods: { key: Period; label: string; icon: string }[] = [
    { key: "daily", label: "Daily", icon: "📅" },
    { key: "weekly", label: "Weekly", icon: "📊" },
    { key: "monthly", label: "Monthly", icon: "🗓️" },
  ];

  return (
    <div style={S.page}>
      {/* Ambient blobs */}
      <div style={S.blob1} /><div style={S.blob2} />

      <div style={S.container}>
        {/* Header */}
        <header style={S.header}>
          <div>
            <h1 style={S.title}>Activity Reports</h1>
            <p style={S.subtitle}>Automated health & activity analytics</p>
          </div>
          <div style={S.userPill}>
            <span style={{ fontSize: 18 }}>👤</span>
            <input style={S.userInput} value={userId} onChange={e => setUserId(e.target.value)}
              placeholder="User ID" onBlur={fetchReport} />
          </div>
        </header>

        {/* Period tabs */}
        <div style={S.tabs}>
          {periods.map(p => (
            <button key={p.key} onClick={() => setPeriod(p.key)}
              style={{ ...S.tab, ...(period === p.key ? S.tabActive : {}) }}>
              <span>{p.icon}</span> {p.label}
            </button>
          ))}
        </div>

        {/* Date range label */}
        {report && <p style={S.dateLabel}>{report.label}</p>}

        {/* Loading / Error */}
        {loading && <div style={S.center}><div style={S.spinner} /></div>}
        {error && <div style={S.errBox}>⚠️ {error}<br /><small>Make sure the Bun server is running on port 3000</small></div>}

        {/* Report cards */}
        {report && !loading && (
          <div style={S.grid}>
            {/* ── Medicine Card ─────────────────────────── */}
            <div style={{ ...S.card, gridColumn: "span 2" }}>
              <div style={S.cardHeader}>
                <div style={S.cardIcon}>💊</div>
                <h2 style={S.cardTitle}>Medicine Compliance</h2>
              </div>
              <div style={{ display: "flex", gap: 32, alignItems: "center", flexWrap: "wrap" }}>
                <Ring pct={report.medicine.complianceRate} color="#6366f1" />
                <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
                  {[
                    { label: "Total Doses", val: report.medicine.total, col: "#a5b4fc" },
                    { label: "Taken", val: report.medicine.taken, col: "#22c55e" },
                    { label: "Missed", val: report.medicine.missed, col: "#ef4444" },
                    { label: "Skipped", val: report.medicine.skipped, col: "#f59e0b" },
                  ].map(s => (
                    <div key={s.label} style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 28, fontWeight: 700, color: s.col }}><AnimNum value={s.val} /></div>
                      <div style={S.statLabel}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
              {report.medicine.recentLogs.length > 0 && (
                <div style={{ marginTop: 20 }}>
                  <h3 style={S.sectionTitle}>Recent Doses</h3>
                  <div style={S.logList}>
                    {report.medicine.recentLogs.map((l, i) => (
                      <div key={i} style={S.logItem}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontWeight: 600, color: "#e2e8f0" }}>{l.medicineName}</span>
                          <Badge status={l.status} />
                        </div>
                        <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>
                          {l.dosage && <span>{l.dosage} · </span>}
                          {fmtDate(l.timestamp)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {report.medicine.total === 0 && <p style={S.empty}>No medicine logs recorded for this period.</p>}
            </div>

            {/* ── Mood Card ────────────────────────────── */}
            <div style={S.card}>
              <div style={S.cardHeader}>
                <div style={S.cardIcon}>😊</div>
                <h2 style={S.cardTitle}>Mood Overview</h2>
              </div>
              {report.mood.entries > 0 ? (
                <>
                  <div style={{ textAlign: "center", margin: "12px 0" }}>
                    <div style={{ fontSize: 48 }}>{moodEmoji(report.mood.average)}</div>
                    <div style={{ fontSize: 36, fontWeight: 700, color: "#e2e8f0" }}>{report.mood.average}<span style={{ fontSize: 16, color: "#94a3b8" }}>/10</span></div>
                    <div style={{ fontSize: 14, color: "#94a3b8", marginTop: 4 }}>{trendIcon(report.mood.trend)} {report.mood.trend}</div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-around", marginTop: 16 }}>
                    {[{ l: "Low", v: report.mood.min, c: "#ef4444" }, { l: "High", v: report.mood.max, c: "#22c55e" }, { l: "Entries", v: report.mood.entries, c: "#818cf8" }].map(s => (
                      <div key={s.l} style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 22, fontWeight: 700, color: s.c }}>{s.v}</div>
                        <div style={S.statLabel}>{s.l}</div>
                      </div>
                    ))}
                  </div>
                </>
              ) : <p style={S.empty}>No mood entries for this period.</p>}
            </div>

            {/* ── Chat Card ────────────────────────────── */}
            <div style={S.card}>
              <div style={S.cardHeader}>
                <div style={S.cardIcon}>💬</div>
                <h2 style={S.cardTitle}>Chat Activity</h2>
              </div>
              <div style={{ display: "flex", justifyContent: "space-around", margin: "16px 0" }}>
                {[
                  { l: "Sessions", v: report.chat.totalSessions, c: "#818cf8" },
                  { l: "Messages", v: report.chat.totalMessages, c: "#a5b4fc" },
                  { l: "Peak Hour", v: report.chat.peakHour, c: "#22d3ee", s: ":00" },
                ].map(s => (
                  <div key={s.l} style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 24, fontWeight: 700, color: s.c }}><AnimNum value={s.v} suffix={s.s || ""} /></div>
                    <div style={S.statLabel}>{s.l}</div>
                  </div>
                ))}
              </div>
              <h3 style={S.sectionTitle}>Hourly Distribution</h3>
              <MiniBar data={report.chat.hourDistribution} />
              {report.chat.recentMessages.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <h3 style={S.sectionTitle}>Recent</h3>
                  {report.chat.recentMessages.map((m, i) => (
                    <div key={i} style={{ ...S.logItem, borderLeft: `3px solid ${m.role === "user" ? "#818cf8" : "#22c55e"}` }}>
                      <div style={{ fontSize: 11, color: "#64748b", marginBottom: 2 }}>{m.role === "user" ? "Patient" : "Assistant"} · {fmtTime(m.timestamp)}</div>
                      <div style={{ fontSize: 13, color: "#cbd5e1" }}>{m.content}</div>
                    </div>
                  ))}
                </div>
              )}
              {report.chat.totalMessages === 0 && <p style={S.empty}>No chat activity for this period.</p>}
            </div>

            {/* ── Objects Card ─────────────────────────── */}
            <div style={S.card}>
              <div style={S.cardHeader}>
                <div style={S.cardIcon}>📦</div>
                <h2 style={S.cardTitle}>Object Tracking</h2>
              </div>
              <div style={{ display: "flex", justifyContent: "space-around", margin: "16px 0" }}>
                {[{ l: "Tracked", v: report.objects.totalTracked, c: "#818cf8" }, { l: "Unique Items", v: report.objects.uniqueItems, c: "#f59e0b" }].map(s => (
                  <div key={s.l} style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 28, fontWeight: 700, color: s.c }}><AnimNum value={s.v} /></div>
                    <div style={S.statLabel}>{s.l}</div>
                  </div>
                ))}
              </div>
              {report.objects.recentItems.length > 0 && (
                <div>
                  <h3 style={S.sectionTitle}>Recent Items</h3>
                  {report.objects.recentItems.map((o, i) => (
                    <div key={i} style={S.logItem}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontWeight: 600, color: "#e2e8f0" }}>{o.name}</span>
                        <span style={{ fontSize: 12, color: "#94a3b8" }}>📍 {o.location}</span>
                      </div>
                      <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{fmtDate(o.timestamp)}</div>
                    </div>
                  ))}
                </div>
              )}
              {report.objects.totalTracked === 0 && <p style={S.empty}>No items tracked for this period.</p>}
            </div>

            {/* ── Medicine Breakdown Card ──────────────── */}
            {report.medicine.medicines.length > 0 && (
              <div style={{ ...S.card, gridColumn: "span 2" }}>
                <div style={S.cardHeader}>
                  <div style={S.cardIcon}>📋</div>
                  <h2 style={S.cardTitle}>Medicine Breakdown</h2>
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table style={S.table}>
                    <thead>
                      <tr>{["Medicine", "Dosage", "Taken", "Missed", "Skipped", "Compliance"].map(h => (
                        <th key={h} style={S.th}>{h}</th>
                      ))}</tr>
                    </thead>
                    <tbody>
                      {report.medicine.medicines.map((m, i) => (
                        <tr key={i} style={S.tr}>
                          <td style={S.td}>{m.name}</td>
                          <td style={{ ...S.td, color: "#94a3b8" }}>{m.dosage || "—"}</td>
                          <td style={{ ...S.td, color: "#22c55e" }}>{m.taken}</td>
                          <td style={{ ...S.td, color: "#ef4444" }}>{m.missed}</td>
                          <td style={{ ...S.td, color: "#f59e0b" }}>{m.skipped}</td>
                          <td style={S.td}>{m.total > 0 ? `${Math.round((m.taken / m.total) * 100)}%` : "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <footer style={S.footer}>
          {report && <span>Generated {new Date(report.generatedAt).toLocaleString()}</span>}
          <span>CarePlus Reports Engine</span>
        </footer>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes float1 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(30px,-20px) scale(1.1); } }
        @keyframes float2 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-20px,30px) scale(1.05); } }
        @keyframes fadeIn { from { opacity:0; transform: translateY(12px); } to { opacity:1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════
// STYLES
// ═════════════════════════════════════════════════════════════════
const S: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", background: "linear-gradient(145deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)", color: "#e2e8f0", fontFamily: "'Inter','Segoe UI',system-ui,sans-serif", position: "relative", overflow: "hidden" },
  blob1: { position: "fixed", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)", top: -100, right: -100, animation: "float1 8s ease-in-out infinite", pointerEvents: "none" },
  blob2: { position: "fixed", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)", bottom: -80, left: -80, animation: "float2 10s ease-in-out infinite", pointerEvents: "none" },
  container: { maxWidth: 1100, margin: "0 auto", padding: "40px 20px", position: "relative", zIndex: 1 },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32, flexWrap: "wrap", gap: 16 },
  title: { fontSize: 32, fontWeight: 800, background: "linear-gradient(135deg, #818cf8, #c084fc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", margin: 0 },
  subtitle: { fontSize: 14, color: "#94a3b8", marginTop: 4 },
  userPill: { display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.06)", borderRadius: 12, padding: "8px 16px", border: "1px solid rgba(255,255,255,0.08)" },
  userInput: { background: "transparent", border: "none", color: "#e2e8f0", fontSize: 14, outline: "none", width: 120 },
  tabs: { display: "flex", gap: 8, marginBottom: 24, background: "rgba(255,255,255,0.04)", borderRadius: 16, padding: 4, width: "fit-content" },
  tab: { padding: "10px 24px", borderRadius: 12, border: "none", cursor: "pointer", fontSize: 14, fontWeight: 600, color: "#94a3b8", background: "transparent", display: "flex", alignItems: "center", gap: 6, transition: "all 0.3s ease" },
  tabActive: { background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "#fff", boxShadow: "0 4px 15px rgba(99,102,241,0.35)" },
  dateLabel: { fontSize: 15, color: "#a5b4fc", marginBottom: 24, fontWeight: 500 },
  center: { display: "flex", justifyContent: "center", padding: 60 },
  spinner: { width: 40, height: 40, border: "3px solid rgba(255,255,255,0.1)", borderTopColor: "#818cf8", borderRadius: "50%", animation: "spin 0.8s linear infinite" },
  errBox: { background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 12, padding: 20, textAlign: "center" as const, color: "#fca5a5" },
  grid: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 20, animation: "fadeIn 0.5s ease" },
  card: { background: "rgba(255,255,255,0.04)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, padding: 28, transition: "transform 0.2s, box-shadow 0.2s" },
  cardHeader: { display: "flex", alignItems: "center", gap: 12, marginBottom: 20 },
  cardIcon: { width: 44, height: 44, borderRadius: 12, background: "rgba(99,102,241,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 },
  cardTitle: { fontSize: 18, fontWeight: 700, color: "#e2e8f0", margin: 0 },
  statLabel: { fontSize: 12, color: "#64748b", marginTop: 4, textTransform: "uppercase" as const, letterSpacing: 0.5 },
  sectionTitle: { fontSize: 13, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase" as const, letterSpacing: 0.8, marginBottom: 10, marginTop: 0 },
  logList: { display: "flex", flexDirection: "column" as const, gap: 8 },
  logItem: { background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: "10px 14px" },
  empty: { color: "#64748b", fontSize: 14, textAlign: "center" as const, padding: 20, margin: 0 },
  table: { width: "100%", borderCollapse: "collapse" as const, fontSize: 14 },
  th: { textAlign: "left" as const, padding: "10px 14px", color: "#94a3b8", fontSize: 12, textTransform: "uppercase" as const, borderBottom: "1px solid rgba(255,255,255,0.08)" },
  tr: { borderBottom: "1px solid rgba(255,255,255,0.04)" },
  td: { padding: "10px 14px", color: "#e2e8f0" },
  footer: { display: "flex", justifyContent: "space-between", marginTop: 40, fontSize: 12, color: "#475569", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 20 },
};
