import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MessageSquare, Clock, Smile, CheckCircle, FileText } from "lucide-react";

interface SessionHistoryViewProps {
  sessions: any[];
  role: string;
  patientId: string;
  onBack: () => void;
  onSelectSession: (sessionId: string) => void;
}

export default function SessionHistoryView({
  sessions,
  role,
  patientId,
  onBack,
  onSelectSession
}: SessionHistoryViewProps) {
  return (
    <div className="space-y-6 text-left">
      <!-- Header -->
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
          <h1 className="text-xl font-black text-foreground">All Sessions</h1>
          <p className="text-xs font-bold text-muted-foreground mt-0.5">{sessions.length} sessions &bull; most recent first</p>
        </div>
      </div>

      <!-- List -->
      <div className="space-y-4">
        {sessions.length === 0 ? (
          <Card className="bg-card/45 border-border rounded-3xl p-16 text-center shadow-sm flex flex-col items-center justify-center">
            <FileText className="w-10 h-10 text-muted-foreground/30 mb-3" />
            <p className="font-bold text-foreground">No sessions recorded yet</p>
            <p class="text-muted-foreground text-xs mt-0.5">Check back later for logs from the robot companion</p>
          </Card>
        ) : (
          sessions.map((session, idx) => {
            const date = new Date(session.startedAt || session.createdAt);
            const isToday = new Date().toDateString() === date.toDateString();
            const dateLabel = isToday
              ? "Today"
              : date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
            const timeLabel = date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
            const durationMins = Math.round((session.durationSeconds || 0) / 60);
            const turnCount = session.turns?.length ?? 0;
            const mood = session.analyses?.[0]?.mood;
            const approved = session.reportStatus === "approved";

            return (
              <Card
                key={session._id || idx}
                onClick={() => onSelectSession(session._id)}
                className="flex bg-card/45 hover:bg-card/85 cursor-pointer border-border rounded-2xl shadow-sm overflow-hidden transition relative group text-left"
              >
                <!-- Status accent line -->
                <div className={`w-1.5 shrink-0 ${approved ? "bg-emerald-500" : "bg-yellow-500"} self-stretch`}></div>

                <div className="flex-1 p-5 md:p-6 space-y-4 min-w-0">
                  <!-- Top Row -->
                  <div className="flex justify-between items-center gap-2">
                    <span className="font-black text-base text-foreground group-hover:text-primary transition truncate">{dateLabel}</span>
                    <span className="text-xs font-semibold text-muted-foreground shrink-0">{timeLabel}</span>
                  </div>

                  <!-- Chips Row -->
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="flex items-center gap-1 bg-background border-border text-muted-foreground text-[10px] font-bold uppercase px-2 py-1">
                      <MessageSquare className="w-3.5 h-3.5" />
                      {turnCount} msg{turnCount !== 1 ? "s" : ""}
                    </Badge>
                    {durationMins > 0 && (
                      <Badge variant="outline" className="flex items-center gap-1 bg-background border-border text-muted-foreground text-[10px] font-bold uppercase px-2 py-1">
                        <Clock className="w-3.5 h-3.5" />
                        {durationMins} min
                      </Badge>
                    )}
                    {mood && (
                      <Badge variant="outline" className="flex items-center gap-1 bg-primary/10 text-primary border-primary/20 text-[10px] font-black uppercase px-2.5 py-1">
                        <Smile className="w-3.5 h-3.5" />
                        {mood}
                      </Badge>
                    )}
                  </div>

                  <!-- Bottom Row -->
                  <div className="flex justify-between items-center pt-2 border-t border-border/50 gap-2">
                    <Badge 
                      variant="outline"
                      className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-wider flex items-center gap-1 ${
                        approved ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                      }`}
                    >
                      {approved ? (
                        <>
                          <CheckCircle className="w-3 h-3" />
                          Approved
                        </>
                      ) : (
                        <>
                          <Clock className="w-3 h-3" />
                          Pending
                        </>
                      )}
                    </Badge>
                    <span className="text-xs font-black text-primary group-hover:translate-x-0.5 transition-transform shrink-0 flex items-center gap-1">
                      View Chat &rarr;
                    </span>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
