import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Bluetooth, 
  RefreshCw, 
  Bot, 
  Wifi, 
  Battery, 
  CheckCircle, 
  AlertTriangle,
  Radio
} from "lucide-react";

interface ConnectDeviceViewProps {
  botId: string;
  onBack: () => void;
  onLinkBot?: (botId: string) => void;
}

export default function ConnectDeviceView({
  botId,
  onBack,
  onLinkBot
}: ConnectDeviceViewProps) {
  const [pairingState, setPairingState] = useState<"idle" | "scanning" | "found" | "pairing" | "paired">(
    botId ? "paired" : "idle"
  );
  const [pairingStep, setPairingStep] = useState("");
  const [selectedBotId, setSelectedBotId] = useState("");

  const startScan = () => {
    setPairingState("scanning");
    setPairingStep("Broadcasting BLE scanner packets...");
    setTimeout(() => {
      setPairingState("found");
    }, 2500);
  };

  const startPairing = (targetBotId: string) => {
    setSelectedBotId(targetBotId);
    setPairingState("pairing");
    
    // Simulate pairing workflow steps
    const steps = [
      "Establishing secure BLE channel...",
      "Negotiating cryptographic keys...",
      "Uploading patient medication schedule...",
      "Verifying Raspberry Pi firmware integrity...",
      "Linkage verified!"
    ];

    let currentStep = 0;
    setPairingStep(steps[0]);

    const interval = setInterval(() => {
      currentStep++;
      if (currentStep < steps.length) {
        setPairingStep(steps[currentStep]);
      } else {
        clearInterval(interval);
        setPairingState("paired");
        if (onLinkBot) {
          onLinkBot(targetBotId);
        }
      }
    }, 1200);
  };

  const disconnectBot = () => {
    if (confirm("Are you sure you want to disconnect this companion bot? Patient data will stop syncing.")) {
      setSelectedBotId("");
      setPairingState("idle");
      if (onLinkBot) {
        onLinkBot("");
      }
    }
  };

  return (
    <div className="space-y-6 text-left max-w-xl mx-auto">
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
          <h1 className="text-xl font-black text-foreground">Hardware Bot Linkage</h1>
          <p className="text-xs font-bold text-muted-foreground mt-0.5">Link your Raspberry Pi CarePlus Bot companion</p>
        </div>
      </div>

      {pairingState === "idle" && (
        <Card className="bg-card/45 border-border p-8 text-center flex flex-col items-center justify-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary relative">
            <Bluetooth className="w-10 h-10 animate-pulse" />
            <div className="absolute inset-0 rounded-full border border-primary/20 animate-ping"></div>
          </div>
          <div className="space-y-2 max-w-sm">
            <h3 className="font-black text-lg text-foreground">No Bot Paired</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Pair your patient's Raspberry Pi hardware companion to enable daily mental sentiment summaries, medication logging, and voice analytics sync.
            </p>
          </div>
          <Button 
            onClick={startScan}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/95 font-bold h-12 rounded-xl shadow transition"
          >
            Start Scan for Nearby Bots
          </Button>
        </Card>
      )}

      {pairingState === "scanning" && (
        <Card className="bg-card/45 border-border p-10 text-center flex flex-col items-center justify-center space-y-8 min-h-[300px]">
          {/* Pulsing Radar Effect */}
          <div className="relative w-32 h-32 flex items-center justify-center">
            {/* Pulsing rings */}
            <div className="absolute inset-0 rounded-full bg-primary/5 border border-primary/10 animate-ping-slow"></div>
            <div className="absolute w-24 h-24 rounded-full bg-primary/10 border border-primary/20 animate-ping-medium"></div>
            <div className="absolute w-16 h-16 rounded-full bg-primary/15 border border-primary/35 animate-ping-fast"></div>
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-lg z-10">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="font-black text-base text-foreground animate-pulse">Scanning via Bluetooth LE...</h3>
            <p className="text-xs text-muted-foreground font-semibold italic">{pairingStep}</p>
          </div>
        </Card>
      )}

      {pairingState === "found" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-sm font-black text-foreground uppercase tracking-wider">Nearby Devices Found</h3>
            <Button variant="ghost" size="sm" onClick={startScan} className="text-xs text-primary font-bold gap-1 p-1 hover:bg-transparent">
              <RefreshCw className="w-3.5 h-3.5" /> Re-scan
            </Button>
          </div>
          
          <div className="space-y-3">
            <Card 
              onClick={() => startPairing("bot_1")}
              className="bg-card/45 hover:bg-card/85 cursor-pointer border-border p-5 rounded-2xl flex items-center justify-between group transition"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-foreground group-hover:text-primary transition">CarePlus Pi Companion</h4>
                  <p className="text-[10px] text-muted-foreground font-mono mt-0.5">ID: bot_1 &bull; Signal: -62dBm (Strong)</p>
                </div>
              </div>
              <Badge className="bg-primary text-primary-foreground font-bold text-[10px] px-2 py-0.5 rounded-full">Tap to Pair</Badge>
            </Card>

            <Card className="bg-card/20 border-border/60 p-5 rounded-2xl flex items-center justify-between opacity-60">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-muted text-muted-foreground flex items-center justify-center shrink-0">
                  <Radio className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-muted-foreground">Generic BLE Smart Device</h4>
                  <p className="text-[10px] text-muted-foreground font-mono mt-0.5">MAC: 2C:F4:32:89:12 &bull; Signal: -84dBm (Weak)</p>
                </div>
              </div>
              <Badge variant="outline" className="text-muted-foreground border-border/80 text-[10px] px-2 py-0.5 rounded-full">Unsupported</Badge>
            </Card>
          </div>
        </div>
      )}

      {pairingState === "pairing" && (
        <Card className="bg-card/45 border-border p-8 text-center flex flex-col items-center justify-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 flex items-center justify-center shrink-0">
            <RefreshCw className="w-8 h-8 animate-spin" />
          </div>
          <div className="space-y-2">
            <h3 className="font-black text-base text-foreground">Linking with {selectedBotId}...</h3>
            <p className="text-xs text-primary font-bold animate-pulse">{pairingStep}</p>
          </div>
        </Card>
      )}

      {pairingState === "paired" && (
        <div className="space-y-6">
          {/* Connection Status Card */}
          <Card className="bg-card/45 border-border p-6 md:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-foreground">Device Linked</h3>
                  <p className="text-xs text-muted-foreground font-semibold mt-0.5">Raspberry Pi Smart Companion</p>
                </div>
              </div>
              <Badge className="bg-emerald-500/10 border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-wider py-1 px-3 rounded-full">
                Active
              </Badge>
            </div>

            {/* Vitals Grid */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-background/80 p-4 rounded-xl border border-border flex flex-col items-center justify-center text-center">
                <Wifi className="w-5 h-5 text-primary mb-1.5" />
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Signal</span>
                <span className="text-xs font-bold text-foreground mt-0.5">Excellent</span>
              </div>
              <div className="bg-background/80 p-4 rounded-xl border border-border flex flex-col items-center justify-center text-center">
                <Battery className="w-5 h-5 text-emerald-400 mb-1.5" />
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Battery</span>
                <span className="text-xs font-bold text-foreground mt-0.5">87%</span>
              </div>
              <div className="bg-background/80 p-4 rounded-xl border border-border flex flex-col items-center justify-center text-center">
                <Bluetooth className="w-5 h-5 text-indigo-400 mb-1.5" />
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Firmware</span>
                <span className="text-xs font-bold text-foreground mt-0.5">v2.4.1</span>
              </div>
            </div>

            {/* Sync Indicators */}
            <div className="bg-yellow-500/5 border border-yellow-500/15 p-4 rounded-xl flex gap-3 text-left">
              <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0" />
              <div className="space-y-0.5">
                <h4 className="text-xs font-black text-yellow-500">Continuous Sync Active</h4>
                <p className="text-[10px] text-yellow-500/80 font-bold leading-relaxed">
                  The bot periodically uploads audio transcripts and checks medication compliance. Do not power off the Raspberry Pi.
                </p>
              </div>
            </div>
          </Card>

          {/* Action Row */}
          <Button 
            type="button"
            variant="destructive"
            onClick={disconnectBot}
            className="w-full h-12 hover:bg-red-600 font-bold rounded-xl shadow transition"
          >
            Disconnect Companion Bot
          </Button>
        </div>
      )}
    </div>
  );
}
