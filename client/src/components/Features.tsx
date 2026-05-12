"use client";

import React from "react";
import { motion } from "framer-motion";
import { Mic, Calendar, Activity, Layout, FileText, Globe, ArrowRight } from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: <Mic className="w-8 h-8 text-[#1e293b]" />,
      title: "Nepali Voice AI",
      desc: "Speak naturally in Nepali. Our AI understands local dialects and provides empathetic companionship.",
      gridSpan: "col-span-1 md:col-span-2",
      bg: "bg-white/30",
    },
    {
      icon: <Calendar className="w-8 h-8 text-[#1e293b]" />,
      title: "Smart Reminders",
      desc: "Medicine tracking that actually works, with intelligent logs.",
      gridSpan: "col-span-1",
      bg: "bg-[#B0D8D5]/20",
    },
    {
      icon: <Activity className="w-8 h-8 text-[#1e293b]" />,
      title: "Mood Analysis",
      desc: "Detecting changes in emotional health through voice analysis.",
      gridSpan: "col-span-1",
      bg: "bg-[#A0CBCA]/20",
    },
    {
      icon: <Layout className="w-8 h-8 text-[#1e293b]" />,
      title: "Spatial Dashboards",
      desc: "Beautiful 3D views for doctors, caregivers, and families to stay updated in real-time.",
      gridSpan: "col-span-1 md:col-span-2",
      bg: "bg-white/40",
    },
  ];

  return (
    <section id="features" className="py-32 bg-[#C8E8E5]/50 relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-24">
          <motion.h2 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-[#1e293b]/50 font-bold uppercase tracking-[0.3em] text-sm mb-4"
          >
            Capabilities
          </motion.h2>
          <p className="text-5xl font-black text-[#1e293b]">Care that Breathes.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
              className={`${feature.gridSpan} ${feature.bg} glass border border-white/50 rounded-[2.5rem] p-10 flex flex-col justify-between group cursor-default overflow-hidden relative shadow-sm`}
            >
              {/* Subtle Medical Glow */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-white/40 blur-3xl rounded-full" />

              <div>
                <div className="mb-8 p-4 w-fit rounded-2xl bg-white/40 border border-white/60 shadow-sm group-hover:bg-white transition-all">
                  {feature.icon}
                </div>
                <h3 className="text-3xl font-bold text-[#1e293b] mb-4 tracking-tight">{feature.title}</h3>
                <p className="text-[#1e293b]/70 font-medium leading-relaxed text-lg max-w-sm">{feature.desc}</p>
              </div>

              <div className="mt-12 flex items-center gap-2 text-[#1e293b] font-bold text-sm uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                Explore Feature <ArrowRight className="w-4 h-4" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
