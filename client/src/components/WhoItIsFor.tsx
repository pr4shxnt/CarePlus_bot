"use client";

import React from "react";
import { motion } from "framer-motion";
import { Users, Heart, Stethoscope, UserCheck } from "lucide-react";

const WhoItIsFor = () => {
  const targets = [
    {
      icon: <Users className="w-6 h-6" />,
      title: "Elderly Patients",
      desc: "Get 24/7 companionship and a helpful assistant that understands your native tongue.",
      color: "bg-white/40 text-[#1e293b]",
    },
    {
      icon: <Heart className="w-6 h-6" />,
      title: "Remote Family",
      desc: "Peace of mind knowing your parents are well-cared for, with real-time health updates.",
      color: "bg-[#B0D8D5]/40 text-[#1e293b]",
    },
    {
      icon: <UserCheck className="w-6 h-6" />,
      title: "Caregivers",
      desc: "A digital assistant that helps track doses and logs daily activities accurately.",
      color: "bg-[#A0CBCA]/40 text-[#1e293b]",
    },
    {
      icon: <Stethoscope className="w-6 h-6" />,
      title: "Doctors",
      desc: "Access data-driven reports and mood trends to provide better clinical care remotely.",
      color: "bg-white/60 text-[#1e293b]",
    },
  ];

  return (
    <section id="who-it-is-for" className="py-24 bg-transparent">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-[#A0CBCA] font-bold uppercase tracking-widest text-sm mb-4">Target Audience</h2>
          <p className="text-4xl font-black text-[#1e293b] mb-6 tracking-tight">Designed for the Ecosystem</p>
          <div className="w-20 h-1.5 bg-[#A0CBCA] mx-auto rounded-full" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {targets.map((target, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white/30 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/50 hover:bg-white/50 transition-all group shadow-sm"
            >
              <div className={`${target.color} w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-sm`}>
                {target.icon}
              </div>
              <h3 className="text-2xl font-bold text-[#1e293b] mb-3">{target.title}</h3>
              <p className="text-[#1e293b]/70 leading-relaxed font-bold">{target.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhoItIsFor;
