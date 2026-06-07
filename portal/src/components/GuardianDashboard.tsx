import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Heart, 
  Smile, 
  Pill, 
  Bot, 
  Wifi, 
  Activity, 
  ShieldAlert, 
  Calendar,
  ChevronRight,
  TrendingUp
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as ChartTooltip, 
  ResponsiveContainer 
} from "recharts";

interface GuardianDashboardProps {
  dashboard: any;
  reports: any[];
  onNavigateToReports: () => void;
  onNavigateToSessions: () => void;
  onNavigateToDevice: () => void;
}

export default function GuardianDashboard({
  dashboard,
  reports,
  onNavigateToReports,
  onNavigateToSessions,
  onNavigateToDevice
}: GuardianDashboardProps) {
  const patient = dashboard?.patient;
  const reportsCount = reports?.length ?? 0;
  
  // Calculate Adherence Rate
  const recentReports = reports?.slice(0, 5) ?? [];
  let totalMeds = 0;
  let takenMeds = 0;
  recentReports.forEach(r => {
    const log = r.analyses?.[0]?.medicine_log ?? [];
    log.forEach((m: any) => {
      totalMeds++;
      if (m.status === "taken") {
        takenMeds++;
      }
    });
  });
  const adherenceRate = totalMeds > 0 ? Math.round((takenMeds / totalMeds) * 100) : 100;

  // Next Dosage Reminders
  const medicines = patient?.medicines ?? [
    { name: "Metformin", dosage: "500mg", times: ["08:00 AM"] },
    { name: "Atorvastatin", dosage: "20mg", times: ["10:00 PM"] }
  ];
  const nextPill = medicines[0];

  // Weekly Trend Chart Data
  const trendData = [...reports]
    .reverse()
    .slice(-7)
    .map(r => {
      const date = new Date(r.startedAt || r.createdAt);
      return {
        day: date.toLocaleDateString("en-US", { weekday: "short" }),
        intensity: r.analyses?.[0]?.mood_intensity ?? 5,
        mood: r.analyses?.[0]?.mood ?? "Calm"
      };
    });

  // Latest AI Report summary
  const latestReport = reports?.[0];

  return (
    <div className="space-y-6 text-left">
      {/* Bento Grid: Patient and Vitals Header */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Patient Profile Card */}
        <Card className="lg:col-span-2 bg-card/45 border-border backdrop-blur p-6 flex flex-col md:flex-row items-center gap-6 justify-between">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
              <Heart className="w-8 h-8 fill-indigo-500/10" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Active Ward</p>
              <h2 className="text-xl font-black text-foreground mt-0.5">{patient?.name ?? "Hari Prasad"}</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Age: {patient?.age ?? 72} &bull; {patient?.conditions?.[0] || "Early Dementia"}
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Badge variant="outline" className="bg-indigo-500/5 text-indigo-400 border-indigo-500/10 text-xs font-bold py-1.5 px-3 rounded-xl">
              Mood: {latestReport?.analyses?.[0]?.mood || "Stable"}
            </Badge>
            <Badge variant="outline" className="bg-emerald-500/5 text-emerald-400 border-emerald-500/10 text-xs font-bold py-1.5 px-3 rounded-xl">
              Regimen Configured
            </Badge>
          </div>
        </Card>

        {/* Companion Bot State Card */}
        <Card className="bg-card/45 border-border backdrop-blur p-6 flex items-center gap-4 justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 relative">
              <Bot className="w-6 h-6" />
              <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-card flex items-center justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Companion Device</p>
              <h3 className="text-sm font-black text-foreground mt-0.5">Pi Companion Bot</h3>
              <p className="text-xs text-emerald-400 font-semibold mt-0.5 flex items-center gap-1">
                <Wifi className="w-3.5 h-3.5" /> Connected &bull; bot_1
              </p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onNavigateToDevice}
            className="text-muted-foreground hover:text-foreground shrink-0"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </Card>
      </div>

      {/* Bento Grid: Reminders and Adherence */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Next Med Dosage Reminder */}
        <Card className="bg-card/45 border-border p-6 flex flex-col justify-between h-[150px]">
          <div className="flex justify-between items-center">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Pill className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest bg-indigo-500/5 px-2.5 py-1 rounded-full">Reminder</span>
          </div>
          <div>
            <p className="text-xs font-bold text-muted-foreground">Next Scheduled Dosage</p>
            <h4 className="text-base font-black text-foreground mt-1 truncate">
              {nextPill?.name} <span className="text-xs text-muted-foreground font-semibold">({nextPill?.dosage})</span>
            </h4>
            <p className="text-xs text-primary font-bold mt-0.5">Today at {nextPill?.times?.[0] || "08:00 AM"}</p>
          </div>
        </Card>

        {/* Adherence Rate Tracker */}
        <Card className="bg-card/45 border-border p-6 flex flex-col justify-between h-[150px]">
          <div className="flex justify-between items-center">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/5 px-2.5 py-1 rounded-full">Weekly Tracker</span>
          </div>
          <div>
            <p className="text-xs font-bold text-muted-foreground">Med Adherence Rate</p>
            <h4 className="text-2xl font-black text-foreground mt-1">{adherenceRate}%</h4>
            <p className="text-xs text-muted-foreground mt-0.5">Based on last 5 logs</p>
          </div>
        </Card>

        {/* Sessions Activity Card */}
        <Card 
          onClick={onNavigateToSessions}
          className="bg-yellow-500/5 hover:bg-yellow-500/10 border-yellow-500/15 cursor-pointer p-6 flex flex-col justify-between h-[150px] group transition"
        >
          <div className="flex justify-between items-center">
            <div className="w-10 h-10 rounded-xl bg-yellow-500/10 text-yellow-500 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-yellow-500 uppercase tracking-widest bg-yellow-500/10 px-2.5 py-1 rounded-full group-hover:underline">View Chats</span>
          </div>
          <div>
            <p className="text-xs font-bold text-muted-foreground">Check-in Sessions</p>
            <h4 className="text-2xl font-black text-foreground mt-1">{reportsCount} Logs</h4>
            <p className="text-xs text-yellow-500 font-bold mt-0.5 flex items-center gap-1">
              Interactive chatbot records &rarr;
            </p>
          </div>
        </Card>
      </div>

      {/* Main Charts & Summaries Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Mood intensity chart */}
        <Card className="lg:col-span-2 bg-card/45 border-border p-6 flex flex-col justify-between">
          <div>
            <h3 className="font-black text-base text-foreground">Weekly Emotional Trend</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Companion metrics captured during patient interactions</p>
          </div>
          
          <div className="h-[220px] mt-6">
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={trendData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="gradientMood" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
                  <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={11} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={11} domain={[0, 10]} />
                  <ChartTooltip 
                    contentStyle={{ 
                      backgroundColor: "var(--popover)", 
                      borderColor: "var(--border)",
                      color: "var(--popover-foreground)",
                      borderRadius: "var(--radius)"
                    }}
                    labelStyle={{ color: "var(--muted-foreground)", fontWeight: "bold" }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="intensity" 
                    name="Mood Intensity"
                    stroke="var(--primary)" 
                    strokeWidth={2.5}
                    fillOpacity={1} 
                    fill="url(#gradientMood)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground text-xs italic">
                No logs recorded to trace mood trends.
              </div>
            )}
          </div>
        </Card>

        {/* Latest AI Summary Insight */}
        <Card className="bg-card/45 border-border p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <Smile className="w-5 h-5 text-primary" />
              <h3 className="font-black text-sm text-foreground">AI Daily Insights</h3>
            </div>
            
            {latestReport ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-muted-foreground">Date:</span>
                  <Badge variant="outline" className="text-[10px] font-bold uppercase">{new Date(latestReport.startedAt || latestReport.createdAt).toLocaleDateString()}</Badge>
                </div>
                <p className="text-xs text-foreground/90 font-semibold leading-relaxed line-clamp-6 italic">
                  "{latestReport.report}"
                </p>
                {latestReport.doctorNotes && (
                  <div className="bg-yellow-500/5 border border-yellow-500/10 p-3 rounded-lg mt-2 space-y-1">
                    <p className="text-[10px] font-bold text-yellow-500 uppercase tracking-widest flex items-center gap-1">
                      <ShieldAlert className="w-3 h-3" /> Doctor Note
                    </p>
                    <p className="text-xs text-foreground/90 font-medium italic">"{latestReport.doctorNotes}"</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground text-xs italic py-8 text-center">
                Awaiting daily Pi Bot evaluation...
              </p>
            )}
          </div>
          
          {latestReport && (
            <Button 
              variant="outline" 
              onClick={onNavigateToReports}
              className="w-full mt-4 font-bold text-xs h-9 border-border rounded-xl hover:bg-muted"
            >
              All Daily Insight Reports
            </Button>
          )}
        </Card>
      </div>
    </div>
  );
}
