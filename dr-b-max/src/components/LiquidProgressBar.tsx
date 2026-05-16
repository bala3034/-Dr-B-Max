"use client";

import React from "react";
import { motion } from "framer-motion";

interface LiquidProgressBarProps {
  progress: number; // 0 to 100
}

export default function LiquidProgressBar({ progress }: LiquidProgressBarProps) {
  const isComplete = progress >= 100;
  
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(progress, 100) / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center justify-center p-4">
      <div className="relative w-40 h-40 flex items-center justify-center">
        
        {/* Outer Tech Ring - Slower rotate */}
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
          className="absolute inset-0 border-[2px] border-dashed rounded-full"
          style={{ 
            borderTopColor: isComplete ? 'rgba(57,255,20,0.3)' : 'rgba(180,203,206,0.2)',
            borderRightColor: isComplete ? 'rgba(57,255,20,0.3)' : 'rgba(180,203,206,0.2)',
            borderBottomColor: isComplete ? 'rgba(57,255,20,0.3)' : 'rgba(180,203,206,0.2)',
            borderLeftColor: isComplete ? 'rgba(57,255,20,0.3)' : 'rgba(180,203,206,0.2)'
          }}
        />
        
        {/* Inner Tech Ring - Faster rotate opposite direction */}
        <motion.div 
          animate={{ rotate: -360 }}
          transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
          className="absolute top-2 left-2 right-2 bottom-2 border-[1px] rounded-full opacity-60"
          style={{ 
            borderTopColor: 'transparent',
            borderRightColor: isComplete ? 'red' : 'rgba(180,203,206,0.3)',
            borderBottomColor: 'transparent',
            borderLeftColor: isComplete ? 'red' : 'rgba(180,203,206,0.3)'
          }}
        />

        {/* Pulse SVG Background Track */}
        <svg className="absolute inset-0 w-full h-full transform -rotate-90">
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke="rgba(0,0,0,0.5)" 
            strokeWidth="8"
            fill="transparent"
          />
          {/* Animated Progress Ring */}
          <motion.circle
            cx="80"
            cy="80"
            r={radius}
            stroke={isComplete ? "#39ff14" : "#ff3131"} 
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            strokeLinecap="square"
            className={isComplete ? "drop-shadow-[0_0_12px_rgba(57,255,20,0.8)]" : "drop-shadow-[0_0_8px_rgba(255,49,49,0.5)]"}
          />
        </svg>

        {/* Inner Digital HUD Content */}
        <div className="absolute flex flex-col items-center justify-center z-10 w-24 h-24 rounded-full bg-black/60 backdrop-blur-md border border-[#39ff14]/20 shadow-inner">
          <motion.span 
            className={`text-3xl font-black font-mono tracking-tighter ${isComplete ? "text-[#39ff14] drop-shadow-[0_0_8px_rgba(57,255,20,1)]" : "text-white"}`}
            animate={{ scale: isComplete ? [1, 1.15, 1] : 1 }}
            transition={{ duration: 0.5 }}
          >
            {Math.round(progress)}%
          </motion.span>
          <span className="text-[10px] text-[#b4cbce] uppercase tracking-widest mt-1 font-bold">STATUS</span>
        </div>
      </div>
      <p className={`mt-6 text-sm font-black tracking-[0.2em] uppercase ${isComplete ? 'text-[#39ff14] drop-shadow-[0_0_5px_rgba(57,255,20,0.5)]' : 'text-[#ff3131] drop-shadow-[0_0_5px_rgba(255,49,49,0.5)]'}`}>
        {isComplete ? "VITAL SIGNS STABLE" : "PRIORITY ALERT"}
      </p>
    </div>
  );
}
