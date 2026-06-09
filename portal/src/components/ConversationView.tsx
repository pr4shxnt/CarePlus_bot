
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, Smile, Pill, CheckCircle, Bot, User, FileText } from "lucide-react";

interface SessionTurn {
  role: string;
  content: string;
}

interface CompanionSession {
  _id: string;
  patientId: any;
  startedAt: string;
  createdAt?: string;
  durationSeconds: number;
  reportStatus: string;
  analyses?: { 
    mood: string; 
    mood_intensity: number;
    medicine_log?: { name: string; status: string }[];
  }[];
  turns?: SessionTurn[];
  report?: string;
  summary?: string;
  doctorNotes?: string;
  reviewedBy?: { name: string };
}

interface ConversationViewProps {
  session: CompanionSession | null;
  onBack: () => void;
}

function parseReportSummary(summaryText: string) {
  const result = {
    mood: null as string | null,
    intensity: null as number | null,
    meds: [] as { name: string; status: string }[]
  };
  
  if (!summaryText) return result;

  // Extract Mood and intensity
  const moodRegex = /Observed moods:\s*([A-Za-z]+)(?:\s*\(avg intensity:\s*([\d.]+)\/10\))?/i;
  const moodMatch = summaryText.match(moodRegex);
  if (moodMatch) {
    result.mood = moodMatch[1].trim();
    if (moodMatch[2]) {
      result.intensity = Math.round(parseFloat(moodMatch[2]));
    }
  }

  // Extract Medicines Taken
  const takenRegex = /Taken:\s*([^\n\r]+)/i;
  const takenMatch = summaryText.match(takenRegex);
  if (takenMatch) {
    const medsList = takenMatch[1].split(",").map(m => m.trim()).filter(Boolean);
    medsList.forEach(name => {
      if (name.toLowerCase() !== "none" && !name.includes(":") && name.length < 50) {
        result.meds.push({ name, status: "taken" });
      }
    });
  }

  // Extract Medicines Missed / Pending
  const missedRegex = /Missed:\s*([^\n\r]+)/i;
  const missedMatch = summaryText.match(missedRegex);
  if (missedMatch) {
    const medsList = missedMatch[1].split(",").map(m => m.trim()).filter(Boolean);
    medsList.forEach(name => {
      if (name.toLowerCase() !== "none" && !name.includes(":") && name.length < 50) {
        result.meds.push({ name, status: "missed" });
      }
    });
  }

  return result;
}

export default function ConversationView({
  session,
  onBack
}: ConversationViewProps) {
  if (!session) return null;

  const date = new Date(session.startedAt || session.createdAt || "");
  const dateLabel = date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const timeLabel = date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  const durationMins = Math.round((session.durationSeconds || 0) / 60);
  const turns = session.turns || [];
  
  const reportContent = session.summary || session.report || "";
  const parsed = parseReportSummary(reportContent);

  const analysis = (session.analyses?.[0] ?? {}) as any;
  const mood = analysis.mood || parsed.mood || null;
  const intensity = analysis.mood_intensity ?? parsed.intensity ?? null;
  const meds = (analysis.medicine_log && analysis.medicine_log.length > 0)
    ? analysis.medicine_log
    : parsed.meds;
  const approved = session.reportStatus === "approved";

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-border pb-4">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={onBack}
          className="bg-card border-border hover:bg-muted shrink-0 rounded-xl"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-xl font-black text-foreground">Conversation</h1>
          <p className="text-xs font-bold text-muted-foreground mt-0.5">{dateLabel}</p>
        </div>
      </div>

      {/* Session Meta Cards */}
      <Card className="bg-card/45 border-border p-5 shadow-sm space-y-4">
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="flex items-center gap-1.5 bg-background border-border text-foreground text-xs font-bold px-3 py-1.5 rounded-xl">
            <Clock className="w-3.5 h-3.5" />
            {timeLabel}
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1.5 bg-background border-border text-foreground text-xs font-bold px-3 py-1.5 rounded-xl">
            ⏱ {durationMins} min
          </Badge>
          <Badge 
            variant="outline"
            className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${
              approved ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
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
                Pending
              </>
            )}
          </Badge>
        </div>
      </Card>

      {/* Analysis Banners */}
      {(mood || meds.length > 0) && (
        <div className="flex flex-wrap gap-2">
          {mood && (
            <Badge variant="outline" className="flex items-center gap-1.5 bg-primary/10 text-primary border-primary/20 text-xs font-black px-3.5 py-1.5 rounded-full uppercase">
              <Smile className="w-3.5 h-3.5" />
              {mood} {intensity !== null ? `• ${intensity}/10` : ""}
            </Badge>
          )}
          {meds.map((m: any, i: number) => (
            <Badge 
              key={i}
              variant="outline"
              className={`flex items-center gap-1.5 text-xs font-black px-3.5 py-1.5 rounded-full uppercase border ${
                m.status === "taken" 
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" 
                  : "bg-red-500/10 border-red-500/20 text-red-500"
              }`}
            >
              <Pill className="w-3.5 h-3.5" />
              {m.name} &bull; {m.status}
            </Badge>
          ))}
        </div>
      )}

      {/* Chat Bubble Box */}
      <Card className="bg-card/45 border-border p-6 md:p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-2 border-b border-border pb-3 mb-6">
          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Chat Log</span>
        </div>

        <div className="space-y-6 max-h-[450px] overflow-y-auto pr-2">
          {turns.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-10 font-bold">No conversation records found.</p>
          ) : (
            turns.map((turn: any, idx: number) => {
              const isBot = turn.role === "assistant";
              return (
                <div key={idx} className={`flex items-end gap-3 ${isBot ? "justify-start" : "justify-end"}`}>
                  {isBot && (
                    <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shrink-0 shadow">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}
                  
                  <div className={`max-w-[75%] px-4 py-3 rounded-[20px] text-sm font-semibold leading-relaxed shadow-sm ${
                    isBot 
                      ? "bg-muted text-foreground rounded-bl-sm border border-border/50" 
                      : "bg-foreground text-background rounded-br-sm"
                  }`}>
                    {turn.content}
                  </div>

                  {!isBot && (
                    <div className="w-8 h-8 rounded-xl bg-card border border-border flex items-center justify-center text-foreground shrink-0 shadow">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </Card>
      {/* AI Summary */}
      {(session.summary || session.report) && (
        <Card className="bg-card/45 border-border p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-primary" />
            <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">AI Summary</h4>
          </div>
          <p className="text-foreground/90 text-sm font-semibold leading-relaxed">
            {session.summary || session.report}
          </p>
        </Card>
      )}

      {/* Doctor Notes */}
      {session.doctorNotes && (
        <Card className="bg-yellow-500/5 border-yellow-500/15 p-5">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-yellow-500" />
            <h4 className="text-[10px] font-bold text-yellow-500/80 uppercase tracking-widest">Doctor Notes</h4>
          </div>
          <p className="text-foreground/95 text-sm font-semibold leading-relaxed">{session.doctorNotes}</p>
          {session.reviewedBy?.name && (
            <p className="text-[10px] font-black text-muted-foreground mt-3 text-right italic">&mdash; {session.reviewedBy.name}</p>
          )}
        </Card>
      )}

    </div>
  );
}
