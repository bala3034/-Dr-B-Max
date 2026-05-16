"use client";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaClock, FaPills, FaBell } from "react-icons/fa";
import db from "@/db/indexedDB";

interface Medication {
  id?: number;
  name: string;
  dosage: string;
  time: string;
}

function parseTimeToday(timeStr: string): Date {
  const [hours, minutes] = timeStr.split(":").map(Number);
  const d = new Date();
  d.setHours(hours, minutes, 0, 0);
  return d;
}

function getNextDose(meds: Medication[]): { med: Medication; msLeft: number } | null {
  const now = new Date();
  const upcoming = meds
    .map((med) => {
      let target = parseTimeToday(med.time);
      if (target <= now) {
        target = new Date(target.getTime() + 24 * 60 * 60 * 1000);
      }
      return { med, msLeft: target.getTime() - now.getTime() };
    })
    .sort((a, b) => a.msLeft - b.msLeft);
  return upcoming[0] ?? null;
}

function formatCountdown(ms: number): { h: string; m: string; s: string } {
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return {
    h: String(h).padStart(2, "0"),
    m: String(m).padStart(2, "0"),
    s: String(s).padStart(2, "0"),
  };
}

export default function MedicationCountdown() {
  const [meds, setMeds] = useState<Medication[]>([]);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    db.medications.toArray().then(setMeds);
    const t = setInterval(() => setTick((x) => x + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const next = getNextDose(meds);

  if (!next) {
    return (
      <div className="glass-panel border border-white/40 p-5 flex items-center gap-3">
        <FaPills className="text-[#b4cbce] text-2xl" />
        <div>
          <p className="font-bold text-[#424849] text-sm">No medications scheduled</p>
          <p className="text-xs text-[#424849]/70">Add medications to see your next dose countdown</p>
        </div>
      </div>
    );
  }

  const { h, m, s } = formatCountdown(next.msLeft);
  const isUrgent = next.msLeft < 30 * 60 * 1000; // < 30 minutes

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`glass-panel border p-5 ${
          isUrgent
            ? "border-[#ff3131]/50 bg-[#ff3131]/5 shadow-[0_0_20px_rgba(255,49,49,0.1)]"
            : "border-[#39ff14]/30 bg-[#39ff14]/5"
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {isUrgent ? (
              <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 0.8 }}>
                <FaBell className="text-[#ff3131] text-lg" />
              </motion.div>
            ) : (
              <FaClock className="text-[#39ff14] text-lg" />
            )}
            <span className={`text-xs font-black uppercase tracking-widest ${isUrgent ? "text-[#ff3131]" : "text-[#39ff14]"}`}>
              {isUrgent ? "⚠️ Due Soon" : "Next Dose"}
            </span>
          </div>
          <span className="text-xs font-bold text-[#424849]">{next.med.time}</span>
        </div>

        <div className="flex items-center gap-3 mb-3">
          <FaPills className={`text-xl ${isUrgent ? "text-[#ff3131]" : "text-[#1a1c1c]"}`} />
          <div>
            <p className="font-black text-[#1a1c1c] text-lg leading-tight">{next.med.name}</p>
            <p className="text-xs font-medium text-[#424849]">{next.med.dosage}</p>
          </div>
        </div>

        {/* Countdown Display */}
        <div className="flex items-center gap-2 justify-center">
          {[{ val: h, label: "HRS" }, { val: m, label: "MIN" }, { val: s, label: "SEC" }].map(({ val, label }, i) => (
            <React.Fragment key={label}>
              {i > 0 && <span className={`text-2xl font-black ${isUrgent ? "text-[#ff3131]" : "text-[#39ff14]"}`}>:</span>}
              <div className="text-center">
                <motion.p
                  key={val}
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`text-3xl font-black tabular-nums ${isUrgent ? "text-[#ff3131]" : "text-[#1a1c1c]"}`}
                >
                  {val}
                </motion.p>
                <p className="text-[9px] font-bold text-[#424849] uppercase tracking-widest">{label}</p>
              </div>
            </React.Fragment>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
