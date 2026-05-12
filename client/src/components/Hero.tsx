"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import RobotModel from "./RobotModel";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-24 pb-20 overflow-hidden mesh-gradient">
      {/* Dynamic Wave Shapes (Simplified as layered gradients) */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#B0D8D5]/20 to-[#A0CBCA]/20 pointer-events-none" />

      <div className="max-w-7xl pt-14 mx-auto px-6 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-white/40 text-sm font-bold mb-8 text-[#1e293b]/80">
            <Sparkles className="w-4 h-4 text-[#A0CBCA]" />
            <span>Gentle AI Care for Nepal</span>
          </div>

          <h1 className="text-6xl lg:text-8xl font-black text-[#1e293b] leading-[1.1] mb-8 tracking-tight">
            Healthcare, <br />
            <span className="text-[#A0CBCA]">Softly Delivered.</span>
          </h1>

          <p className="text-xl text-[#1e293b]/70 max-w-2xl mx-auto mb-12 leading-relaxed text-balance font-medium">
            Care+ brings a calm, medical-friendly presence to your home. A gentle companion that understands Nepali and monitors health with precision and warmth.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <button className="bg-[#1e293b] text-white hover:bg-[#A0CBCA] px-10 py-4 rounded-2xl font-bold text-lg transition-all shadow-lg flex items-center gap-2 group active:scale-95">
              Get Early Access
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="glass text-[#1e293b] hover:bg-white/40 px-10 py-4 rounded-2xl font-bold text-lg transition-all flex items-center gap-2 border border-white/40 shadow-sm">
              Watch Demo
            </button>
          </div>
        </motion.div>

        {/* 3D Robot Model Section - CENTERPIECE */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.3 }}
          className="mt-12 flex justify-center relative"
        >
          <RobotModel />

          {/* Spatial Cards around the model (Medical Theme) */}
          <div className="absolute top-0 right-0 md:right-10 p-6 glass-card rounded-3xl animate-float border border-white/50 z-20">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#B0D8D5] rounded-2xl flex items-center justify-center shadow-sm">
                <Sparkles className="w-6 h-6 text-[#1e293b]" />
              </div>
              <div className="text-left">
                <p className="text-xs text-[#1e293b]/50 font-bold uppercase tracking-widest">System</p>
                <p className="text-lg font-bold text-[#1e293b]">Ready to Help</p>
              </div>
            </div>
          </div>

          <div className="absolute bottom-20 left-0 md:left-10 p-6 glass-card rounded-3xl animate-float-delayed border border-white/50 z-20">
            <p className="text-xs text-[#1e293b]/50 font-bold mb-2 uppercase tracking-widest text-left">Morning Check-in</p>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-[#A0CBCA] rounded-full animate-pulse shadow-[0_0_8px_#A0CBCA]" />
              <span className="text-lg font-bold text-[#1e293b]">Healthy & Calm</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
