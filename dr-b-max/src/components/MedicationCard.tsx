"use client";

import React, { useState } from "react";
import { motion, useAnimation, PanInfo } from "framer-motion";
import { FaCheck, FaExclamationTriangle } from "react-icons/fa";
import { Medication } from "@/db/indexedDB";
import BiometricScanner from "./BiometricScanner";
import { startOfDay } from "date-fns";

interface MedicationCardProps {
  medication: Medication;
  onTake: (id: number) => void;
  isDueSoon?: boolean;
  isTaken?: boolean;
  isBeforeTime?: boolean;
}

export default function MedicationCard({ medication, onTake, isDueSoon, isTaken, isBeforeTime }: MedicationCardProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const controls = useAnimation();

  const handleDragEnd = async (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setIsDragging(false);
    if (info.offset.x > 100 && !isTaken && !isBeforeTime) {
      // Trigger biometric scanner instead of immediate take
      setIsScanning(true);
      controls.start({ x: 0, transition: { type: "spring", stiffness: 300, damping: 20 } });
    } else {
      controls.start({ x: 0, transition: { type: "spring", stiffness: 300, damping: 20 } });
    }
  };

  const cleanDosage = medication.dosage.replace(/mg|gm|iu|dl/gi, "").trim();

  const [medHour, medMin] = medication.time.split(':').map(Number);
  const pillDate = startOfDay(new Date());
  pillDate.setHours(medHour, medMin, 0, 0);
  const diffMins = (new Date().getTime() - pillDate.getTime()) / 60000;
  
  const isCritical = !isTaken && diffMins > 60;
  const requiresRefill = medication.inventory !== undefined && medication.inventory <= 5 && !isTaken;

  const formattedTime = (() => {
    const ampm = medHour >= 12 ? 'PM' : 'AM';
    const hour12 = medHour % 12 || 12;
    return `${hour12}:${medMin.toString().padStart(2, '0')} ${ampm}`;
  })();

  // If the card is already taken, show the completed Green state
  if (isTaken) {
    return (
      <div className="relative w-full max-w-sm mb-4">
        <div className="p-6 flex items-center justify-between rounded-[24px] bg-[#39ff14]/20 border-2 border-[#39ff14] shadow-[0_0_15px_rgba(57,255,20,0.3)]">
          <div>
            <h3 className="text-lg font-bold text-[#1a1c1c]">{medication.name}</h3>
            <p className="text-sm font-medium text-[#424849] mt-1">
              {cleanDosage} • {formattedTime}
            </p>
          </div>
          <div className="flex flex-col items-center">
            <FaCheck className="text-[#2db510] text-3xl mb-1" />
            <span className="text-xs font-black text-[#2db510] tracking-wider uppercase">Taken</span>
          </div>
        </div>
      </div>
    );
  }

  // Not Taken State (Red Card)
  return (
    <div className="relative w-full max-w-sm mb-4">
      {isScanning && (
        <BiometricScanner 
          onVerified={() => {
            setIsScanning(false);
            onTake(medication.id);
          }}
          onCancel={() => setIsScanning(false)}
        />
      )}
      {/* Background Check State - Hidden until dragged to show what dragging does */}
      <div className={`absolute inset-0 bg-[#39ff14] rounded-[24px] flex items-center px-6 shadow-[0_0_15px_rgba(57,255,20,0.3)] transition-opacity duration-200 ${isDragging && !isBeforeTime ? 'opacity-100' : 'opacity-0'}`}>
        <FaCheck className="text-[#1a1c1c] text-2xl" />
        <span className="ml-4 text-[#1a1c1c] font-black tracking-wider">MARK TAKEN</span>
      </div>

      {/* Draggable Card (Red State) */}
      <motion.div
        drag={isBeforeTime ? false : "x"}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={{ left: 0, right: 0.5 }}
        onDragStart={() => { if (!isBeforeTime) setIsDragging(true); }}
        onDragEnd={handleDragEnd}
        animate={controls}
        className={`relative z-10 p-6 flex items-center justify-between rounded-[24px] bg-[#ff3131]/10 border-2 border-[#ff3131] backdrop-blur-xl ${isBeforeTime ? 'cursor-not-allowed opacity-75' : 'cursor-grab active:cursor-grabbing'}`}
      >
        <div className="flex-1 pr-4">
          <h3 className="text-lg font-bold text-[#1a1c1c]">{medication.name}</h3>
          <div className="flex gap-2 items-center mt-1">
            <span className="text-sm font-bold text-[#ff3131] bg-white/50 px-2 py-0.5 rounded-full w-fit">
              NOT TAKEN
            </span>
            {isBeforeTime && (
              <span className="text-xs font-bold text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">
                LOCKED
              </span>
            )}
          </div>
          <p className="text-sm font-medium text-[#424849] mt-2">
            {cleanDosage} • {formattedTime}
          </p>
          <div className="flex flex-col gap-1 mt-2">
            {requiresRefill && (
              <span className="text-[10px] font-black text-[#ff3131] bg-[#ff3131]/10 px-2 py-1 rounded-md tracking-widest uppercase w-fit">
                ⚠️ URGENT REFILL: {medication.inventory} Left
              </span>
            )}
            {isCritical && (
              <span className="text-[10px] font-black text-white bg-[#ff3131] px-2 py-1 flex items-center justify-center gap-1 rounded-md tracking-widest uppercase w-fit shadow-[0_0_10px_rgba(255,49,49,0.8)]">
                <FaExclamationTriangle /> CRITICAL: OVERDUE
              </span>
            )}
          </div>
          {medication.instructions && (
            <p className="text-xs font-semibold text-[#1a1c1c] mt-2 bg-white/50 p-2 rounded-lg">
              Instruction: {medication.instructions}
            </p>
          )}
        </div>

        {/* Due soon indicator */}
        {isDueSoon && (
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: [1, 1.1, 1], opacity: 1 }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#ff3131] shadow-[0_0_10px_rgba(255,49,49,0.5)]"
          >
            <div className="w-full h-full bg-[#ff3131] flex items-center justify-center text-[10px] font-bold text-white text-center leading-tight">
              DUE<br/>NOW
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
