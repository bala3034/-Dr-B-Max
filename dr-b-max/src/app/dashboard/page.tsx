"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { FaPills, FaCamera, FaMapMarkedAlt, FaExclamationTriangle, FaWind, FaLightbulb, FaLayerGroup } from "react-icons/fa";
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
    { name: t("medications"), path: "/medications", icon: <FaPills size={40} />, color: "border-[#39ff14]", bg: "bg-[#39ff14]/10", hover: "hover:bg-[#39ff14]/30", delay: 0.1 },
    { name: t("scanner"), path: "/scanner", icon: <FaCamera size={40} />, color: "border-[#b4cbce]", bg: "bg-[#b4cbce]/10", hover: "hover:bg-[#b4cbce]/30", delay: 0.2 },
    { name: t("map"), path: "/map", icon: <FaMapMarkedAlt size={40} />, color: "border-white", bg: "bg-white/10", hover: "hover:bg-white/30", delay: 0.3 },
    { name: t("emergency"), path: "/sos", icon: <FaExclamationTriangle size={40} />, color: "border-[#ff3131]", bg: "bg-[#ff3131]/10", hover: "hover:bg-[#ff3131]/30", delay: 0.4 },
    { name: "Breathe", path: "/breathe", icon: <FaWind size={40} />, color: "border-[#27ae60]", bg: "bg-[#27ae60]/10", hover: "hover:bg-[#27ae60]/30", delay: 0.5 },
    { name: "Health Tips", path: "/tips", icon: <FaLightbulb size={40} />, color: "border-[#f39c12]", bg: "bg-[#f39c12]/10", hover: "hover:bg-[#f39c12]/30", delay: 0.6 },
    { name: "Med Guide", path: "/memory", icon: <FaLayerGroup size={40} />, color: "border-[#9b59b6]", bg: "bg-[#9b59b6]/10", hover: "hover:bg-[#9b59b6]/30", delay: 0.7 },
  ];

  return (
    <div className="flex w-full min-h-screen bg-[var(--color-medical-bg)] overflow-hidden">
      <main className="flex-1 relative flex flex-col items-center justify-center bg-[#1a1c1c]">
        
        {/* Anime Dashboard Background Elements */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 120, ease: "linear" }}
            className="absolute top-[-30%] right-[-10%] w-[80vw] h-[80vw] border-[1px] border-[rgba(57,255,20,0.1)] rounded-full border-dashed"
          />
          <div className="absolute top-0 right-0 w-full h-[30vh] bg-gradient-to-b from-[#39ff14]/10 to-transparent pointer-events-none" />
        </div>

        {/* Inner container to hold original padding */}
        <div className="relative z-10 w-full h-full p-4 md:p-12 flex flex-col items-center justify-center">
          <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center h-full">
            
            {/* Left: Mascot & Welcome */}
            <div className="lg:col-span-5 flex flex-col items-center lg:items-start text-center lg:text-left z-20 relative">
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="w-64 h-64 md:w-96 md:h-96 rounded-full border-4 border-[#39ff14] overflow-hidden shadow-[0_0_50px_rgba(57,255,20,0.5)] mb-8 relative"
              >
                <img src="/anime_mascot.png" alt="Anime Mascot" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-[#39ff14]/10 mix-blend-overlay" />
              </motion.div>
              
              <motion.h1 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-5xl md:text-7xl font-black text-white tracking-tighter mix-blend-difference"
              >
                DR. B-MAX <br/> ONLINE
              </motion.h1>
              
              <motion.p 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-xl text-[#39ff14] font-bold mt-4 tracking-widest uppercase"
              >
                {t("liveTime")}: {time || "SYNCING..."}
              </motion.p>

              {/* Medication Countdown Widget */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="w-full mt-6"
              >
                <MedicationCountdown />
              </motion.div>
            </div>

            {/* Right: The Grid */}
            <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-6 z-20">
              {systemModules.map((mod) => (
                <Link href={mod.path} key={mod.path}>
                  <motion.div 
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: mod.delay, type: "spring" }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`h-48 rounded-[32px] border-2 ${mod.color} ${mod.bg} backdrop-blur-md flex flex-col items-center justify-center p-6 cursor-pointer ${mod.hover} transition-all shadow-xl group overflow-hidden relative`}
                  >
                    <div className="absolute top-0 left-0 w-full h-1 bg-white/20 group-hover:bg-white/50 transition-colors" />
                    <div className={`mb-4 drop-shadow-[0_0_10px_rgba(255,255,255,0.8)] ${mod.color === 'border-white' ? 'text-white' : ''}`}>
                      {mod.icon}
                    </div>
                    <h3 className="text-xl font-bold text-white tracking-wide text-center">{mod.name}</h3>
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
