"use client";

import React from "react";
import { motion } from "framer-motion";

const SDGAlignment = () => {
  const sdgs = [
    { id: 3, title: "Health", desc: "Ensuring healthy lives for the elderly.", color: "bg-[#B0D8D5]/40", border: "border-[#A0CBCA]/50" },
    { id: 9, title: "Innovation", desc: "Pushing the boundaries of Nepali AI.", color: "bg-white/40", border: "border-white/60" },
    { id: 10, title: "Equality", desc: "Reducing age and tech inequalities.", color: "bg-[#A0CBCA]/30", border: "border-[#B0D8D5]/50" },
  ];

  return (
    <section id="sdg" className="py-32 bg-transparent">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-[#1e293b] font-black text-4xl mb-4">Impact</h2>
          <div className="w-12 h-1 bg-[#A0CBCA] mx-auto rounded-full" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {sdgs.map((sdg, index) => (
            <motion.div
              key={sdg.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className={`p-10 rounded-[2.5rem] glass border ${sdg.border} ${sdg.color} group hover:scale-[1.02] transition-transform shadow-sm`}
            >
              <div className="text-6xl font-black text-[#1e293b]/5 mb-6 group-hover:text-[#1e293b]/10 transition-colors">0{sdg.id}</div>
              <h3 className="text-3xl font-bold text-[#1e293b] mb-4">{sdg.title}</h3>
              <p className="text-[#1e293b]/70 font-bold leading-relaxed">{sdg.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SDGAlignment;
