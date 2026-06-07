import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User, Smile, MessageSquare, Activity, Pill } from "lucide-react";

interface PatientDetailViewProps {
  patient: any;
  onBack: () => void;
  onNavigateToReports: (patientId: string) => void;
}

export default function PatientDetailView({
  patient,
  onBack,
  onNavigateToReports
}: PatientDetailViewProps) {
  // Mock fallback medicines matching RN schema
  const medicines = patient?.medicines ?? [
    { name: "Metformin", dosage: "500mg", frequency: "daily", times: ["08:00 AM"] },
    { name: "Atorvastatin", dosage: "20mg", frequency: "daily", times: ["10:00 PM"] }
  ];

  return (
    <div className="space-y-6 text-left">
      <!-- Back Header -->
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={onBack}
          className="bg-card border-border hover:bg-muted shrink-0 rounded-xl"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </Button>
        <h1 className="text-xl font-black text-foreground">Patient Profile</h1>
      </div>

      <!-- Detail Layout -->
      <div className="space-y-6">
        <!-- Profile Banner -->
        <Card className="bg-card/45 border-border shadow-sm p-6 md:p-8 flex flex-col md:flex-row items-center gap-6">
          <div className="w-20 h-20 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 shadow-sm">
            <User className="w-10 h-10" />
          </div>
          <div class="flex-1 text-center md:text-left min-w-0">
            <h2 className="text-2xl font-black text-foreground truncate">{patient?.name ?? "Unknown Patient"}</h2>
            <p className="text-xs font-bold text-muted-foreground mt-0.5">Psych-Monitoring &bull; Age: {patient?.age ?? "—"}</p>
            <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 text-xs font-black uppercase px-4 py-1 rounded-xl mt-3 tracking-wider">
              {patient?.mood || "Stable"} Mood
            </Badge>
          </div>
        </Card>

        <!-- Vitals Summary Row -->
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Current Mood Vital Card -->
          <Card className="bg-card/45 border-border shadow-sm p-6 flex flex-col items-center justify-center text-center h-[130px]">
            <Smile className="w-6 h-6 text-primary mb-2" />
            <p className="text-lg font-black text-foreground">{patient?.mood || "Good"}</p>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Current Mood</p>
          </Card>

          <!-- Loneliness Vital Card -->
          <Card className="bg-yellow-500/5 border-yellow-500/15 p-6 flex flex-col items-center justify-center text-center h-[130px]">
            <MessageSquare className="w-6 h-6 text-yellow-500 mb-2" />
            <p className="text-lg font-black text-yellow-500">12%</p>
            <p className="text-[10px] font-bold text-yellow-500/80 uppercase tracking-widest mt-1">% Lonely</p>
          </Card>
        </div>

        <!-- Psych-Sentiment Analysis CTA Block -->
        <Card 
          onClick={() => onNavigateToReports(patient?._id)}
          className="bg-card/45 hover:bg-card/85 border-border shadow-sm p-6 flex items-center justify-between group cursor-pointer transition text-left"
        >
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-12 h-12 rounded-xl bg-muted group-hover:bg-primary/15 group-hover:text-primary flex items-center justify-center text-muted-foreground transition shrink-0">
              <Activity className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-black text-foreground group-hover:text-primary transition truncate">Psych-Sentiment Analysis</h3>
              <p className="text-xs font-semibold text-muted-foreground truncate">View daily AI evaluations and approved reports</p>
            </div>
          </div>
          <span className="text-xs font-black text-primary group-hover:underline shrink-0 pl-2">View</span>
        </Card>

        <!-- Medication Schedule -->
        <Card className="bg-card/45 border-border shadow-sm p-6 md:p-8">
          <div className="flex justify-between items-center border-b border-border pb-4 mb-4">
            <h3 className="font-black text-base text-foreground">Medication Schedule</h3>
            <Pill className="w-5 h-5 text-primary" />
          </div>
          <div className="divide-y divide-border">
            {medicines.length === 0 ? (
              <p className="text-muted-foreground text-sm py-4">No medications assigned.</p>
            ) : (
              medicines.map((med: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-3 text-left">
                    <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse"></div>
                    <span className="font-bold text-sm text-foreground">
                      {med.name} <span className="font-semibold text-muted-foreground text-xs">{med.dosage ?? ""}</span>
                    </span>
                  </div>
                  <span className="text-xs font-bold text-primary uppercase tracking-wider">
                    {med.times ? med.times.join(", ") : med.frequency || "Daily"}
                  </span>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
