"use client";

import React from "react";
import { motion } from "framer-motion";
import { MessageSquare, Cpu, Bell, PenTool } from "lucide-react";

const HowItWorks = () => {
  const steps = [
    { icon: <MessageSquare className="w-8 h-8" />, title: "Speak", desc: "Natural Nepali voice input", bg: "bg-white/40" },
    { icon: <PenTool className="w-8 h-8" />, title: "Transcribe", desc: "Real-time soft transcription", bg: "bg-[#B0D8D5]/30" },
    { icon: <Cpu className="w-8 h-8" />, title: "AI Core", desc: "Warm intent processing", bg: "bg-[#A0CBCA]/30" },
    { icon: <Bell className="w-8 h-8" />, title: "Notify", desc: "Gentle family alerts", bg: "bg-white/60" },
  ];

  return (
    <section id="how-it-works" className="py-32 bg-transparent relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-[#1e293b]/10 to-transparent" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-24">
          <p className="text-[#1e293b]/50 font-bold tracking-widest uppercase text-sm mb-4">The Gentle Logic</p>
          <h2 className="text-5xl font-black text-[#1e293b]">Soft Workflow</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className={`relative p-10 rounded-[2.5rem] glass-card ${step.bg} text-center group border-white/60 shadow-md`}
            >
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-[#1e293b] flex items-center justify-center text-white font-black border-4 border-[#C8E8E5]">
                {index + 1}
              </div>
              <div className="mb-6 mx-auto w-16 h-16 rounded-2xl bg-white/40 flex items-center justify-center text-[#1e293b] group-hover:scale-110 group-hover:bg-[#1e293b] group-hover:text-white transition-all duration-500 shadow-sm">
                {step.icon}
              </div>
              <h3 className="text-2xl font-bold text-[#1e293b] mb-2">{step.title}</h3>
              <p className="text-[#1e293b]/60 font-bold">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
