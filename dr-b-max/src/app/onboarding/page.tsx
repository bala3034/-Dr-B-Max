"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { FaArrowRight } from "react-icons/fa";

export default function OnboardingPage() {
  return (
    <main className="min-h-screen bg-[var(--color-medical-bg)] flex flex-col md:flex-row relative overflow-hidden font-sans">
      {/* Decorative Orbs */}
      <div className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-white rounded-full blur-[100px] opacity-40 pointer-events-none" />
      
      {/* Anime Graphic Side */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 z-10 glass-panel border-0 border-r border-white/40 shadow-xl">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative"
        >
          {/* Avatar Placeholder / Character Graphic Area */}
          <div className="w-64 h-64 md:w-96 md:h-96 rounded-full overflow-hidden border-[8px] border-white shadow-[0_0_30px_rgba(180,203,206,0.6)] flex items-center justify-center bg-[#b4cbce]">
             {/* You can replace this whole Div with <img src="/your-baymax-avatar.png" ... /> */}
             <span className="text-4xl text-white font-bold opacity-50 text-center">Dr. B-MAX<br/>Graphic</span>
          </div>

          {/* Floating UI Elements */}
          <motion.div 
            animate={{ y: [-10, 10, -10] }} 
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="absolute top-10 right-[-20px] bg-white text-[#39ff14] font-bold px-4 py-2 rounded-full shadow-lg border border-[#39ff14]/30"
          >
            System Active
          </motion.div>
        </motion.div>
      </div>

      {/* Login / Profile Side */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 z-10">
        <motion.div 
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-md w-full flex flex-col gap-8"
        >
          <div>
            <h1 className="text-5xl font-extrabold text-[#1a1c1c] tracking-tight leading-tight mb-4">
              Your Offline<br/>Care Companion.
            </h1>
            <p className="text-xl text-[#424849] font-medium leading-relaxed">
              Dr. B-MAX uses local AI and biometric tracking right from your device. No cloud required.
            </p>
          </div>

          <div className="flex gap-4">
            <Link href="/" className="group flex-1 bg-white text-[#1a1c1c] text-center font-bold text-lg py-4 rounded-[24px] shadow-lg hover:shadow-[0_0_20px_rgba(255,255,255,1)] transition-all flex items-center justify-center gap-2 border border-white">
              Start Profile
              <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
