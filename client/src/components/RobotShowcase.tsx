"use client";

import React, { useEffect, useRef, useState } from "react";
import RobotModel from "./RobotModel";
import { cn } from "@/lib/utils";

const RobotShowcase = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold: 0.2, // Trigger when 20% of the section is visible
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.disconnect();
      }
    };
  }, []);

  return (
    <div ref={sectionRef} className="w-full mt-12 relative">
      <div className="relative flex justify-center items-center min-h-[500px] md:min-h-[750px]">
        {/* The Model - centerpiece, size remains unchanged */}
        <div className="w-full">
          <RobotModel />
        </div>

        {/* Right Description - Side of Head (Top) */}
        <div
          className={cn(
            "hidden md:block absolute top-10 md:-right-12 lg:-right-36 w-72 transition-all duration-700 ease-in-out delay-200",
            isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"
          )}
        >
          <div className="glass-card p-7 rounded-[2.5rem] border border-white/50 text-left">
            <h3 className="text-xl font-black text-[#1e293b] mb-3">Nepali Intelligence</h3>
            <p className="text-sm text-[#1e293b]/70 font-medium leading-relaxed">
              Tailored specifically for the Nepali context, our AI speaks and understands the local language fluently, ensuring natural communication.
            </p>
          </div>
        </div>

        {/* Left Description - Side of Leg (Bottom) */}
        <div
          className={cn(
            "hidden md:block absolute bottom-20 md:-left-12 lg:-left-36 w-72 transition-all duration-700 ease-in-out",
            isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"
          )}
        >
          <div className="glass-card p-7 rounded-[2.5rem] border border-white/50 text-left">
            <h3 className="text-xl font-black text-[#1e293b] mb-3">Empathetic Care</h3>
            <p className="text-sm text-[#1e293b]/70 font-medium leading-relaxed">
              Care+ provides a gentle, medical-friendly presence that understands the unique needs of your home and provides physical monitoring.
            </p>
          </div>
        </div>
      </div>

      {/* Mobile Layout - Stacks vertically below the model */}
      <div className="md:hidden flex flex-col gap-6 mt-8">
        <div
          className={cn(
            "transition-all duration-700 ease-in-out",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          )}
        >
          <div className="glass-card p-8 rounded-[2.5rem] border border-white/50 text-left">
            <h3 className="text-2xl font-black text-[#1e293b] mb-4">Empathetic Care</h3>
            <p className="text-[#1e293b]/70 font-medium leading-relaxed">
              Care+ provides a gentle, medical-friendly presence that understands the unique needs of your home.
            </p>
          </div>
        </div>
        
        <div
          className={cn(
            "transition-all duration-700 ease-in-out delay-200",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          )}
        >
          <div className="glass-card p-8 rounded-[2.5rem] border border-white/50 text-left">
            <h3 className="text-2xl font-black text-[#1e293b] mb-4">Nepali Intelligence</h3>
            <p className="text-[#1e293b]/70 font-medium leading-relaxed">
              Tailored specifically for the Nepali context, our AI speaks and understands the local language fluently.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RobotShowcase;
