import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Smile, Pill, Clock, CheckCircle, FileText, TrendingUp } from "lucide-react";

interface ReportListViewProps {
  reports: any[];
  role: string;
  patientId: string;
  onBack: () => void;
  onNavigateToHistory: () => void;
  onNavigateToSession: (sessionId: string) => void;
  onApprove: (reportId: string, notes: string) => Promise<void>;
}

export default function ReportListView({
  reports,
  role,
  patientId,
  onBack,
  onNavigateToHistory,
  onNavigateToSession,
  onApprove
}: ReportListViewProps) {
  const [notesState, setNotesState] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState<Record<string, boolean>>({});

  const handleNotesChange = (reportId: string, text: string) => {
    setNotesState(prev => ({ ...prev, [reportId]: text }));
  };

  const submitApprove = async (reportId: string) => {
    setSubmitting(prev => ({ ...prev, [reportId]: true }));
    try {
      await onApprove(reportId, notesState[reportId] || "");
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(prev => ({ ...prev, [reportId]: false }));
    }
  };

  const titleText = role === "doctor" ? "Reports" : "CarePlus Insights";

  return (
    <div className="space-y-6 text-left">
      <!-- Header -->
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={onBack}
            className="bg-card border-border hover:bg-muted shrink-0 rounded-xl"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-black text-foreground">{titleText}</h1>
        </div>
        <Button 
          variant="secondary" 
          onClick={onNavigateToHistory}
          className="font-bold text-xs rounded-xl"
        >
          History
        </Button>
      </div>

      <!-- Reports List -->
      <div className="space-y-10">
        {reports.length === 0 ? (
          <Card className="bg-card/45 border-border rounded-3xl p-16 text-center shadow-sm flex flex-col items-center justify-center">
            <FileText className="w-10 h-10 text-muted-foreground/30 mb-3" />
            <p className="font-bold text-foreground">No reports recorded yet</p>
            <p className="text-muted-foreground text-xs mt-0.5">Check back later for daily companion summaries</p>
          </Card>
        ) : (
          reports.map((session, idx) => {
            const date = new Date(session.startedAt || session.createdAt);
            const dayName = date.toLocaleDateString("en-US", { weekday: "long" });
            const dateStr = date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
            const analysis = session.analyses?.[0] ?? {};
            const mood = analysis.mood || "Unknown";
            const intensity = analysis.mood_intensity ?? 5;
            const meds = analysis.medicine_log ?? [];
            const takenCount = meds.filter((m: any) => m.status === "taken").length;
            const adherence = meds.length > 0 ? Math.round((takenCount / meds.length) * 100) : null;
            const approved = session.reportStatus === "approved";

            return (
              <div key={session._id || idx} className="space-y-4">
                <!-- Date Headers -->
                <div>
                  <h3 className="text-2xl font-black text-foreground leading-none">{dayName}</h3>
                  <p className="text-xs font-bold text-primary mt-1">{dateStr}</p>
                </div>

                <!-- Bento Metrics Grid -->
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <!-- Mood Card -->
                  <Card className="bg-card/45 border-border shadow-sm p-5 flex flex-col justify-between min-h-[120px]">
                    <Smile className="w-6 h-6 text-primary" />
                    <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Mood Analysis</p>
                      <h4 className="text-lg font-black text-foreground mt-0.5">{mood}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">Intensity: {intensity}/10</p>
                    </div>
                  </Card>

                  <!-- Medication Adherence Card -->
                  <Card className="bg-yellow-500/5 border-yellow-500/15 p-5 flex flex-col justify-between min-h-[120px]">
                    <Pill className="w-6 h-6 text-yellow-500" />
                    <div>
                      <p className="text-[10px] font-bold text-yellow-500/80 uppercase tracking-wider">Meds Adherence</p>
                      <h4 className="text-lg font-black text-yellow-500 mt-0.5">
                        {adherence !== null ? `${adherence}%` : "N/A"}
                      </h4>
                      <p className="text-xs text-yellow-500/80 mt-0.5">{takenCount}/{meds.length} taken</p>
                    </div>
                  </Card>
                </div>

                <!-- AI Summary Block -->
                {session.report && (
                  <Card className="bg-card/45 border-border p-5 shadow-sm">
                    <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">AI Sentiment Summary</h4>
                    <p className="text-foreground/90 text-sm font-semibold leading-relaxed">{session.report}</p>
                  </Card>
                )}

                <!-- Doctor Notes Block -->
                {session.doctorNotes && (
                  <Card className="bg-yellow-500/5 border-yellow-500/15 p-5">
                    <h4 className="text-[10px] font-bold text-yellow-500/80 uppercase tracking-widest mb-2">Clinical Notes</h4>
                    <p className="text-foreground/95 text-sm font-semibold leading-relaxed">{session.doctorNotes}</p>
                  </Card>
                )}

                <!-- Footer Status Row -->
                <Card className="bg-card/45 border-border p-4 shadow-sm flex items-center justify-between">
                  <Badge 
                    variant="secondary" 
                    className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 ${
                      approved ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/10" : "bg-yellow-500/10 text-yellow-500 border-yellow-500/10"
                    }`}
                  >
                    {approved ? (
                      <>
                        <CheckCircle className="w-3.5 h-3.5" />
                        Approved
                      </>
                    ) : (
                      <>
                        <Clock className="w-3.5 h-3.5" />
                        Pending Review
                      </>
                    )}
                  </Badge>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onNavigateToSession(session._id)}
                    className="font-bold text-xs h-9 px-4 rounded-xl hover:bg-muted"
                  >
                    View Chat &rarr;
                  </Button>
                </Card>

                <!-- Doctor Notes Approval Panel -->
                {role === "doctor" && !approved && (
                  <Card className="bg-muted/40 border-border p-5 rounded-[24px] space-y-4">
                    <h4 className="text-xs font-black text-foreground uppercase tracking-wider">Publish Session Insights</h4>
                    <div className="space-y-3">
                      <Textarea 
                        value={notesState[session._id] || ""}
                        onChange={(e) => handleNotesChange(session._id, e.target.value)}
                        placeholder="Add special instructions or clinical warnings here (optional)..."
                        className="bg-background border-border text-foreground font-semibold placeholder:text-muted-foreground/45 rounded-xl min-h-[80px]"
                      />
                      <Button
                        type="button"
                        disabled={submitting[session._id]}
                        onClick={() => submitApprove(session._id)}
                        className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/95 font-bold rounded-xl shadow transition"
                      >
                        {submitting[session._id] ? "Approving..." : "Approve and Release Report"}
                      </Button>
                    </div>
                  </Card>
                )}

                {idx < reports.length - 1 && <div className="h-px bg-border my-8" />}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
