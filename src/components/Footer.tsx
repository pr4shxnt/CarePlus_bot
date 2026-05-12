import React from "react";
import { Plus } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-transparent text-[#1e293b]/60 py-24 border-t border-white/40">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <div className="flex flex-col items-center gap-8 mb-16">
          <div className="bg-[#1e293b] p-4 rounded-[2rem] shadow-lg">
            <Plus className="w-12 h-12 text-white" />
          </div>
          <div>
            <h2 className="text-4xl font-black text-[#1e293b] mb-4 tracking-tight">Care+</h2>
            <p className="max-w-md mx-auto text-lg font-medium">Empowering the elderly in Nepal with the next generation of gentle AI.</p>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-12 mb-16 font-bold text-[#1e293b] uppercase tracking-widest text-xs">
          <a href="#" className="hover:text-[#A0CBCA] transition-colors">Privacy</a>
          <a href="#" className="hover:text-[#A0CBCA] transition-colors">Terms</a>
          <a href="#" className="hover:text-[#A0CBCA] transition-colors">Contact</a>
          <a href="#" className="hover:text-[#A0CBCA] transition-colors">Twitter</a>
        </div>

        <div className="pt-12 border-t border-white/40 flex flex-col md:flex-row justify-between items-center gap-6 text-sm font-bold">
          <p>© 2026 Care+ Team Git Force. Innovation Fest 2026.</p>
          <p className="text-[#A0CBCA] tracking-widest uppercase">Built with Care</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
