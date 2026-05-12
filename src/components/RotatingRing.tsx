"use client";

import { motion } from "framer-motion";

const RotatingRing = () => {
  return (
    <div className="relative w-72 h-72 md:w-[500px] md:h-[500px] flex items-center justify-center">
      {/* Outer Glow */}
      <div className="absolute inset-0 bg-[#B0D8D5]/30 blur-[100px] rounded-full animate-pulse" />
      
      {/* 3D Ring System */}
      <div className="relative w-full h-full flex items-center justify-center perspective-[1000px] [transform-style:preserve-3d]">
        
        {/* Ring 1 - Outer Aqua */}
        <motion.div 
          animate={{ rotateZ: 360, rotateX: 60, rotateY: 30 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute w-[90%] h-[90%] border-[10px] border-[#A0CBCA]/40 rounded-full [transform-style:preserve-3d]"
          style={{ borderStyle: 'double' }}
        >
           <div className="absolute inset-0 border-t-4 border-[#B0D8D5] rounded-full blur-[1px]" />
        </motion.div>

        {/* Ring 2 - Inner Mint */}
        <motion.div 
          animate={{ rotateZ: -360, rotateX: -45, rotateY: 20 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute w-[70%] h-[70%] border-[4px] border-[#C8E8E5]/60 rounded-full [transform-style:preserve-3d]"
        >
          <div className="absolute inset-0 border-b-2 border-white/50 rounded-full shadow-[0_0_15px_rgba(255,255,255,0.3)]" />
        </motion.div>

        {/* Ring 3 - Dashed Circle */}
        <motion.div 
          animate={{ rotateZ: 360, rotateX: 30 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute w-[100%] h-[100%] border-2 border-dashed border-[#1e293b]/5 rounded-full"
        />

        {/* Central Core (The "AI Heart") */}
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute w-24 h-24 md:w-40 md:h-40 glass rounded-full flex items-center justify-center overflow-hidden border border-white/40 shadow-xl shadow-[#A0CBCA]/20"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#B0D8D5]/50 to-[#E8F4F3]/50" />
          <div className="relative z-10 w-full h-full flex items-center justify-center">
             <div className="w-1/2 h-1/2 bg-white/40 backdrop-blur-3xl rounded-full border border-white/30 animate-pulse" />
          </div>
        </motion.div>

        {/* Floating Particles/Dots */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            animate={{ 
              rotateZ: 360,
              y: [0, -15, 0] 
            }}
            transition={{ 
              rotateZ: { duration: 10 + i * 2, repeat: Infinity, ease: "linear" },
              y: { duration: 3, repeat: Infinity, ease: "easeInOut", delay: i * 0.5 }
            }}
            className="absolute w-2 h-2 bg-[#A0CBCA] rounded-full shadow-sm"
            style={{
              left: `${50 + 45 * Math.cos((i * 60 * Math.PI) / 180)}%`,
              top: `${50 + 45 * Math.sin((i * 60 * Math.PI) / 180)}%`,
            }}
          />
        ))}

      </div>
    </div>
  );
};

export default RotatingRing;
