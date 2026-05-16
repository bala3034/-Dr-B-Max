"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { FaBroadcastTower, FaExclamationTriangle, FaTimes } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import "@/lib/i18n";

// Dynamically import Leaflet map component to prevent Next.js SSR window errors
const TacticalMap = dynamic(() => import("@/components/TacticalMap"), { ssr: false });

export default function P2PMapPage() {
  const [sosActive, setSosActive] = useState(false);
  const { t } = useTranslation();

  const mockNodes = [
    { name: 'Node Charlie', status: 'Strong', time: 'Just now' },
    { name: 'Sarah\'s Phone', status: 'Weak', time: '2 mins ago' },
    { name: 'Basecamp', status: 'Dropped', time: '45 mins ago' }
  ];

  const handleSOS = () => {
    setSosActive(true);
    // Play Siren sound
    try {
      const Ctx = window.AudioContext || (window as any).webkitAudioContext;
      if (Ctx) {
        const audioCtx = new Ctx();
        const osc = audioCtx.createOscillator();
        osc.type = 'square';
        osc.frequency.setValueAtTime(400, audioCtx.currentTime);
        osc.frequency.setValueAtTime(600, audioCtx.currentTime + 0.2);
        osc.frequency.setValueAtTime(400, audioCtx.currentTime + 0.4);
        osc.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 2); // Play for 2 seconds initially
      }
    } catch(e) {}
  };

  return (
    <main className="w-full h-screen bg-[#1a1c1c] relative overflow-hidden font-sans">
      
      {/* Real Map Layer */}
      <div className="absolute inset-0 w-full h-full z-0">
        <TacticalMap />
      </div>

      {/* SOS Visual Flood Protocol Overlay */}
      {sosActive && (
        <div className="absolute inset-0 z-40 pointer-events-none border-[12px] border-[#ff3131] animate-[pulse_0.5s_ease-in-out_infinite] bg-[#ff3131]/10 mix-blend-overlay"></div>
      )}

      {/* Top Header HUD */}
      <header className="absolute top-0 w-full p-6 flex justify-between items-start z-10 pointer-events-none">
        
        <div className="pointer-events-auto">
          <h1 className="text-4xl font-extrabold text-white drop-shadow-[0_0_10px_rgba(0,0,0,0.8)]">{t("map")}</h1>
          <div className="glass-panel mt-2 px-4 py-1 text-sm font-bold text-[#1a1c1c] flex items-center gap-2 w-fit">
            <FaBroadcastTower className="text-[#39ff14] animate-pulse" /> {t("systemActive")}
          </div>
        </div>

      </header>

      {/* Right Side: The "Mesh List" Overlay */}
      <div className="absolute right-6 top-24 z-10 w-80 flex flex-col gap-4 pointer-events-auto">
        <div className="glass-panel p-5 bg-white/70 shadow-2xl backdrop-blur-xl border border-white/50">
          <h2 className="text-xl font-bold text-[#1a1c1c] mb-4 border-b border-[#424849]/20 pb-2">Mesh Network Nodes</h2>
          
          <ul className="flex flex-col gap-3">
            {mockNodes.map((node, i) => (
              <li key={i} className="flex flex-col">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-[#424849]">{node.name}</span>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                    node.status === 'Strong' ? 'bg-[#39ff14]/20 text-[#2db510]' : 
                    node.status === 'Weak' ? 'bg-yellow-400/20 text-yellow-700' : 
                    'bg-[#ff3131]/20 text-[#ff3131]'
                  }`}>{node.status}</span>
                </div>
                <span className="text-xs text-[#424849]/60 font-medium">Last seen: {node.time}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom Center: SOS Dashboard Button */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-50 pointer-events-auto">
        <AnimatePresence mode="wait">
          {!sosActive ? (
            <motion.button 
              key="sos-idle"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ scale: 0 }}
              onClick={handleSOS}
              className="w-32 h-32 rounded-full bg-[#ff3131] shadow-[0_0_40px_rgba(255,49,49,0.5)] border-4 border-white flex flex-col items-center justify-center text-white font-black hover:scale-105 transition-transform"
            >
              <FaExclamationTriangle size={32} className="mb-1" />
              S.O.S
            </motion.button>
          ) : (
            <motion.div 
              key="sos-active"
              initial={{ scale: 0 }} animate={{ scale: 1 }}
              className="flex items-center gap-4 bg-white/90 p-4 rounded-full shadow-2xl backdrop-blur-xl border-4 border-[#ff3131]"
            >
              <div className="bg-[#ff3131] text-white px-6 py-3 rounded-full font-bold flex items-center gap-2 animate-pulse">
                <FaExclamationTriangle /> BROADCASTING P2P SOS
              </div>
              <button 
                onClick={() => setSosActive(false)}
                className="w-12 h-12 rounded-full bg-[#424849] text-white flex items-center justify-center hover:bg-[#1a1c1c]"
              >
                <FaTimes />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </main>
  );
}
