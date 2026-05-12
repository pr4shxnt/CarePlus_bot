"use client";

import React from "react";
import { motion } from "framer-motion";
import { AlertCircle, Globe, Clock, UserX } from "lucide-react";

const Problem = () => {
  const problems = [
    {
      icon: <UserX className="w-6 h-6 text-[#1e293b]" />,
      title: "Care Challenges",
      desc: "Shortages of home-care professionals leave many elderly individuals without daily support.",
    },
    {
      icon: <Globe className="w-6 h-6 text-[#1e293b]" />,
      title: "Language Gaps",
      desc: "Most tech is in English, creating barriers for elderly Nepalis who only speak their native language.",
    },
    {
      icon: <Clock className="w-6 h-6 text-[#1e293b]" />,
      title: "Adherence",
      desc: "Forgetfulness leads to missed doses, critical for chronic health conditions.",
    },
    {
      icon: <AlertCircle className="w-6 h-6 text-[#1e293b]" />,
      title: "Distance",
      desc: "Families abroad are unable to monitor or support their parents effectively.",
    },
  ];

  return (
    <section className="py-24 bg-white/20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-[#A0CBCA] font-bold uppercase tracking-widest text-sm mb-4">The Challenge</h2>
          <p className="text-4xl font-black text-[#1e293b] mb-6 tracking-tight">Why We Built Care+</p>
          <div className="w-20 h-1.5 bg-[#A0CBCA] mx-auto rounded-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {problems.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="p-8 rounded-[2rem] glass border border-white/60 hover:bg-white/40 transition-all group shadow-sm"
            >
              <div className="mb-6 bg-white/40 w-12 h-12 flex items-center justify-center rounded-2xl group-hover:scale-110 transition-transform shadow-sm">
                {item.icon}
              </div>
              <h3 className="text-xl font-bold text-[#1e293b] mb-4">{item.title}</h3>
              <p className="text-[#1e293b]/60 font-medium leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Problem;
