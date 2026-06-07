import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Smile, Zap, MessageSquare, FileText, User } from "lucide-react";

interface DoctorDashboardProps {
  dashboard: any;
  patients: any[];
  search: string;
  onSearchChange: (value: string) => void;
  onSelectPatient: (patientId: string) => void;
  onNavigateToReports: () => void;
}

export default function DoctorDashboard({
  dashboard,
  patients,
  search,
  onSearchChange,
  onSelectPatient,
  onNavigateToReports
}: DoctorDashboardProps) {
  const pendingCount = dashboard?.pendingCount ?? 0;
  const approvedCount = dashboard?.approvedCount ?? 0;

  const filteredPatients = patients.filter((p) =>
    p.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 text-left">
      <!-- Bento Stats Grid -->
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Search Bento Card -->
        <Card className="bg-card/45 border-border backdrop-blur shadow-sm p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-muted/60 flex items-center justify-center text-muted-foreground shrink-0">
            <Search className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Search Profiles</p>
            <Input
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search patient files..."
              className="mt-1 h-7 p-0 bg-transparent border-0 focus-visible:ring-0 text-sm font-bold text-foreground placeholder:text-muted-foreground/50"
            />
          </div>
          <div className="bg-muted p-2 rounded-xl shrink-0">
            <Filter className="w-4 h-4 text-muted-foreground" />
          </div>
        </Card>

        <!-- Pending Reports Stats Card -->
        <Card 
          onClick={onNavigateToReports}
          className="bg-yellow-500/5 hover:bg-yellow-500/10 cursor-pointer border-yellow-500/15 shadow-sm p-6 flex flex-col justify-between h-[130px] transition-all relative group"
        >
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 rounded-xl bg-background flex items-center justify-center text-yellow-500 border border-yellow-500/10">
              <Smile className="w-5 h-5" />
            </div>
            <Badge variant="outline" className="bg-background text-yellow-500 border-yellow-500/20 text-[9px] font-bold uppercase tracking-wider flex items-center gap-1">
              <Zap className="w-3 h-3 fill-yellow-500 text-yellow-500" />
              Review
            </Badge>
          </div>
          <div>
            <p className="text-2xl font-black text-foreground">{String(pendingCount).padStart(2, "0")}</p>
            <p class="text-xs font-bold text-muted-foreground mt-0.5">Pending Reports</p>
          </div>
        </Card>

        <!-- Approved Reports Stats Card -->
        <Card className="bg-card/45 border-border shadow-sm p-6 flex flex-col justify-between h-[130px]">
          <div className="w-11 h-11 rounded-xl bg-muted flex items-center justify-center text-teal-400">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-black text-foreground">{String(approvedCount).padStart(2, "0")}</p>
            <p class="text-xs font-bold text-muted-foreground mt-0.5">Approved Logs</p>
          </div>
        </Card>
      </div>

      <!-- Wide Banner CTA -->
      <Card 
        onClick={onNavigateToReports}
        className="bg-yellow-500 hover:bg-yellow-600 border-0 rounded-[24px] p-6 flex items-center justify-between shadow-md cursor-pointer transition-all group text-yellow-950"
      >
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-widest opacity-85">Mental Health Review</p>
          <h3 className="text-xl font-black leading-tight text-yellow-950">
            {pendingCount > 0 ? `${pendingCount} Reports Awaiting Approval` : "All Reports Reviewed"}
          </h3>
          <p className="text-xs font-bold opacity-75">Tap to review daily companion check-ins</p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-white/25 group-hover:bg-white/40 flex items-center justify-center text-yellow-950 transition-colors shrink-0">
          <FileText className="w-6 h-6" />
        </div>
      </Card>

      <!-- Psych Profiles List -->
      <div className="space-y-4">
        <div class="flex justify-between items-center px-1">
          <h2 className="text-lg font-black text-foreground tracking-tight">Psych-Profiles</h2>
          <span className="text-xs font-bold text-muted-foreground">{patients.length} patients</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPatients.length === 0 ? (
            <div className="col-span-full bg-card/40 border border-border rounded-3xl p-12 text-center flex flex-col items-center justify-center shadow-sm">
              <User className="w-10 h-10 text-muted-foreground/30 mb-3" />
              <p className="font-bold text-foreground">No patients found</p>
              <p className="text-muted-foreground text-xs mt-0.5">Try refining your search</p>
            </div>
          ) : (
            filteredPatients.map((patient) => (
              <Card
                key={patient._id}
                onClick={() => onSelectPatient(patient._id)}
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
            ))
          )}
        </div>
      </div>
    </div>
  );
}
