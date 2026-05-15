"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  return (
    <nav
      className={cn(
        "fixed top-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 w-[95%] max-w-5xl rounded-2xl px-6 py-4",
        isScrolled ? "bg-white/40 backdrop-blur-xl shadow-lg py-3" : ""
      )}
    >
      <div className="flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-[#A0CBCA] p-1.5 rounded-lg shadow-sm group-hover:scale-110 transition-transform">
            <Plus className="w-5 h-5 text-[#1e293b]" />
          </div>
          <span className="text-xl font-bold text-[#1e293b] tracking-tight">Care+</span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          {["Features", "How It Works", "SDG"].map((item) => (
            <Link
              key={item}
              href={`#${item.toLowerCase().replace(/ /g, "-")}`}
              className="text-sm font-semibold text-[#1e293b]/70 hover:text-[#1e293b] transition-colors"
            >
              {item}
            </Link>
          ))}
          <button className="bg-[#1e293b] text-white px-6 py-2 rounded-full text-sm font-bold hover:bg-[#A0CBCA] transition-all">
            Get Access
          </button>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden p-2 text-[#1e293b]"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full mt-4 left-0 right-0 bg-white/90 backdrop-blur-2xl border border-white/40 rounded-2xl p-6 flex flex-col gap-4 animate-in fade-in zoom-in duration-300">
          {["Features", "How It Works", "SDG"].map((item) => (
            <Link
              key={item}
              href={`#${item.toLowerCase().replace(/ /g, "-")}`}
              className="text-lg font-bold text-[#1e293b]"
              onClick={() => setMobileMenuOpen(false)}
            >
              {item}
            </Link>
          ))}
          <button className="bg-[#1e293b] text-white px-6 py-3 rounded-xl font-semibold mt-2">
            Get Access
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
