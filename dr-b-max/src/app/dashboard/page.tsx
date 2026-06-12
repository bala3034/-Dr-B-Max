"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { FaPills, FaCamera, FaMapMarkedAlt, FaExclamationTriangle, FaWind, FaLightbulb, FaLanguage, FaRobot, FaAppleAlt } from "react-icons/fa";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import "@/lib/i18n";
import MedicationCountdown from "@/components/MedicationCountdown";

export default function DashboardPage() {
  const [time, setTime] = useState("");
  const { t } = useTranslation();
  
  useEffect(() => {
    const timer = setInterval(() => {
        setTime(format(new Date(), "h:mm:ss a"));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const systemModules = [
    { name: t("medications"), path: "/medications", icon: <FaPills size={36} className="text-blue-500" />, delay: 0.1 },
    { name: "Vitals Scanner", path: "/scanner", icon: <FaCamera size={36} className="text-emerald-500" />, delay: 0.2 },
    { name: "Food Scanner", path: "/food-scanner", icon: <FaAppleAlt size={36} className="text-orange-500" />, delay: 0.3 },
    { name: "AI Chatbot", path: "/chat", icon: <FaRobot size={36} className="text-indigo-500" />, delay: 0.4 },
    { name: "AI Translator", path: "/translator", icon: <FaLanguage size={36} className="text-cyan-500" />, delay: 0.5 },
    { name: "Health Tips", path: "/tips", icon: <FaLightbulb size={36} className="text-yellow-500" />, delay: 0.6 },
    { name: "Breathe", path: "/breathe", icon: <FaWind size={36} className="text-teal-500" />, delay: 0.7 },
    { name: t("emergency"), path: "/sos", icon: <FaExclamationTriangle size={36} className="text-red-500" />, delay: 0.8 },
  ];

  return (
    <div className="flex w-full min-h-screen bg-[var(--color-medical-bg)] overflow-hidden">
      <main className="flex-1 relative flex flex-col items-center justify-center">
        
        {/* Soft Clinical Background Elements */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] right-[-5%] w-[60vw] h-[60vw] bg-blue-100 rounded-full blur-[100px] opacity-60" />
          <div className="absolute bottom-[-10%] left-[-5%] w-[50vw] h-[50vw] bg-emerald-50 rounded-full blur-[100px] opacity-60" />
        </div>

        {/* Inner container to hold original padding */}
        <div className="relative z-10 w-full h-full p-6 md:p-12 flex flex-col items-center justify-center">
          <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-10 items-center h-full">
            
            {/* Left: Mascot & Welcome */}
            <div className="lg:col-span-5 flex flex-col items-center lg:items-start text-center lg:text-left z-20 relative">
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="w-48 h-48 md:w-80 md:h-80 rounded-full border-[6px] border-white overflow-hidden shadow-2xl mb-8 relative bg-white"
              >
                <img src="/anime_mascot.png" alt="Anime Mascot" className="w-full h-full object-cover" />
              </motion.div>
              
              <motion.h1 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-5xl md:text-6xl font-extrabold text-slate-800 tracking-tight"
              >
                Dr. B-MAX
              </motion.h1>
              
              <motion.p 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-lg text-slate-500 font-semibold mt-2 tracking-wide uppercase"
              >
                {time || "SYNCING..."}
              </motion.p>

              {/* Medication Countdown Widget */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="w-full mt-8"
              >
                <MedicationCountdown />
              </motion.div>
            </div>

            {/* Right: The Grid */}
            <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 z-20 w-full">
              {systemModules.map((mod) => (
                <Link href={mod.path} key={mod.path}>
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: mod.delay, type: "spring" }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    className="h-36 rounded-2xl glass-panel bg-white/70 hover:bg-white/95 flex flex-col items-center justify-center p-4 cursor-pointer transition-all shadow-sm hover:shadow-xl group"
                  >
                    <div className="mb-3 p-3 rounded-full bg-slate-50 group-hover:bg-slate-100 transition-colors shadow-inner">
                      {mod.icon}
                    </div>
                    <h3 className="text-sm font-bold text-slate-700 tracking-wide text-center leading-tight">{mod.name}</h3>
                  </motion.div>
                </Link>
              ))}
            </div>
            
          </div>
        </div>
      </main>
    </div>
  );
}
