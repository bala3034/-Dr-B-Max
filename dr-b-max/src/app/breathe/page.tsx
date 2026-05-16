"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaWind, FaPlay, FaPause, FaRedo } from "react-icons/fa";

type Phase = "inhale" | "hold" | "exhale" | "rest";

interface BreathingPattern {
  name: string;
  description: string;
  phases: { phase: Phase; duration: number; label: string }[];
  color: string;
  benefit: string;
}

const PATTERNS: BreathingPattern[] = [
  {
    name: "4-7-8 Relaxation",
    description: "Best for sleep & anxiety relief",
    benefit: "Activates parasympathetic nervous system",
    color: "#39ff14",
    phases: [
      { phase: "inhale", duration: 4, label: "Breathe In" },
      { phase: "hold", duration: 7, label: "Hold" },
      { phase: "exhale", duration: 8, label: "Breathe Out" },
    ],
  },
  {
    name: "Box Breathing",
    description: "Used by Navy SEALs for stress control",
    benefit: "Improves focus and reduces cortisol",
    color: "#b4cbce",
    phases: [
      { phase: "inhale", duration: 4, label: "Breathe In" },
      { phase: "hold", duration: 4, label: "Hold" },
      { phase: "exhale", duration: 4, label: "Breathe Out" },
      { phase: "rest", duration: 4, label: "Rest" },
    ],
  },
  {
    name: "Deep Calm",
    description: "Simple deep breathing for quick relief",
    benefit: "Lowers heart rate and blood pressure",
    color: "#ff9f43",
    phases: [
      { phase: "inhale", duration: 5, label: "Breathe In" },
      { phase: "exhale", duration: 5, label: "Breathe Out" },
    ],
  },
];

const PHASE_COLORS: Record<Phase, string> = {
  inhale: "#39ff14",
  hold: "#b4cbce",
  exhale: "#ff9f43",
  rest: "#8b949e",
};

export default function BreathePage() {
  const [selectedPattern, setSelectedPattern] = useState(0);
  const [running, setRunning] = useState(false);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [cycles, setCycles] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const pattern = PATTERNS[selectedPattern];
  const currentPhase = pattern.phases[phaseIdx];

  const reset = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setRunning(false);
    setPhaseIdx(0);
    setSecondsLeft(pattern.phases[0].duration);
    setCycles(0);
    setTotalTime(0);
  };

  useEffect(() => {
    setSecondsLeft(pattern.phases[0].duration);
    setPhaseIdx(0);
    setCycles(0);
    setRunning(false);
  }, [selectedPattern]);

  useEffect(() => {
    if (!running) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setPhaseIdx((pi) => {
            const next = (pi + 1) % pattern.phases.length;
            if (next === 0) setCycles((c) => c + 1);
            setSecondsLeft(pattern.phases[next].duration);
            return next;
          });
          setTotalTime((t) => t + 1);
          return pattern.phases[phaseIdx].duration;
        }
        setTotalTime((t) => t + 1);
        return prev - 1;
      });
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, phaseIdx, pattern]);

  const progress = currentPhase ? 1 - secondsLeft / currentPhase.duration : 0;
  const ringScale = currentPhase?.phase === "inhale"
    ? 1 + progress * 0.3
    : currentPhase?.phase === "exhale"
    ? 1.3 - progress * 0.3
    : currentPhase?.phase === "hold" ? 1.3
    : 1;

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  return (
    <main className="min-h-screen bg-[var(--color-medical-bg)] p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-full bg-[#1a1c1c] flex items-center justify-center shadow-[0_0_20px_rgba(57,255,20,0.3)]">
            <FaWind className="text-[#39ff14] text-2xl" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-[#1a1c1c] tracking-tight">Breathing & Stress Relief</h1>
            <p className="text-[#424849] font-medium">Guided breathing exercises · Offline · No data collected</p>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="glass-panel border border-white/40 p-4 text-center">
            <p className="text-2xl font-black text-[#39ff14]">{cycles}</p>
            <p className="text-xs font-bold text-[#424849] uppercase tracking-widest">Cycles</p>
          </div>
          <div className="glass-panel border border-white/40 p-4 text-center">
            <p className="text-2xl font-black text-[#1a1c1c]">{formatTime(totalTime)}</p>
            <p className="text-xs font-bold text-[#424849] uppercase tracking-widest">Session</p>
          </div>
          <div className="glass-panel border border-white/40 p-4 text-center">
            <p className="text-2xl font-black text-[#b4cbce]">{pattern.name.split(" ")[0]}</p>
            <p className="text-xs font-bold text-[#424849] uppercase tracking-widest">Mode</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Breathing Animation */}
          <div className="glass-panel border border-white/40 p-8 flex flex-col items-center justify-center min-h-[400px]">
            <div className="relative flex items-center justify-center w-64 h-64">
              {/* Outer glow ring */}
              <motion.div
                animate={{ scale: ringScale, opacity: running ? 0.15 : 0.05 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="absolute w-64 h-64 rounded-full"
                style={{ background: `radial-gradient(circle, ${currentPhase ? PHASE_COLORS[currentPhase.phase] : "#39ff14"}, transparent 70%)` }}
              />
              {/* Middle ring */}
              <motion.div
                animate={{ scale: ringScale * 0.85, opacity: running ? 0.3 : 0.1 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="absolute w-48 h-48 rounded-full border-4"
                style={{ borderColor: currentPhase ? PHASE_COLORS[currentPhase.phase] : "#39ff14" }}
              />
              {/* Inner circle */}
              <motion.div
                animate={{ scale: ringScale * 0.65 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="absolute w-32 h-32 rounded-full flex items-center justify-center"
                style={{ background: `${currentPhase ? PHASE_COLORS[currentPhase.phase] : "#39ff14"}20`, border: `3px solid ${currentPhase ? PHASE_COLORS[currentPhase.phase] : "#39ff14"}` }}
              >
                <div className="text-center">
                  <p className="text-4xl font-black" style={{ color: currentPhase ? PHASE_COLORS[currentPhase.phase] : "#39ff14" }}>
                    {running ? secondsLeft : "–"}
                  </p>
                  <p className="text-xs font-bold text-[#424849]">sec</p>
                </div>
              </motion.div>
            </div>

            {/* Phase Label */}
            <AnimatePresence mode="wait">
              <motion.div
                key={phaseIdx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-6 text-center"
              >
                <p className="text-2xl font-black" style={{ color: currentPhase ? PHASE_COLORS[currentPhase.phase] : "#39ff14" }}>
                  {running ? currentPhase?.label : "Ready"}
                </p>
                <p className="text-sm text-[#424849] font-medium mt-1">
                  {running ? `Phase ${phaseIdx + 1} of ${pattern.phases.length}` : "Press Start to begin"}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Controls */}
            <div className="flex gap-4 mt-8">
              <button
                onClick={() => setRunning((r) => !r)}
                className="flex items-center gap-2 px-8 py-3 bg-[#1a1c1c] text-white font-black rounded-full hover:bg-[#39ff14] hover:text-[#1a1c1c] transition-all shadow-lg"
              >
                {running ? <FaPause /> : <FaPlay />}
                {running ? "Pause" : "Start"}
              </button>
              <button
                onClick={reset}
                className="flex items-center gap-2 px-6 py-3 bg-white/60 text-[#424849] font-bold rounded-full hover:bg-white transition-all"
              >
                <FaRedo />
                Reset
              </button>
            </div>
          </div>

          {/* Pattern Selector */}
          <div className="space-y-4">
            <h2 className="text-xl font-black text-[#1a1c1c] mb-4">Choose Your Pattern</h2>
            {PATTERNS.map((p, i) => (
              <button
                key={p.name}
                onClick={() => { setSelectedPattern(i); reset(); }}
                className={`w-full text-left p-5 rounded-[20px] border-2 transition-all ${
                  selectedPattern === i
                    ? "bg-[#1a1c1c] border-[#39ff14] shadow-[0_0_20px_rgba(57,255,20,0.2)]"
                    : "bg-white/60 border-transparent hover:bg-white"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className={`font-black text-lg ${selectedPattern === i ? "text-white" : "text-[#1a1c1c]"}`}>{p.name}</h3>
                    <p className={`text-sm font-medium ${selectedPattern === i ? "text-[#b4cbce]" : "text-[#424849]"}`}>{p.description}</p>
                  </div>
                  <div className="flex gap-1">
                    {p.phases.map((ph, pi) => (
                      <div
                        key={pi}
                        className="w-8 text-center text-xs font-black rounded px-1 py-0.5"
                        style={{ background: `${PHASE_COLORS[ph.phase]}20`, color: PHASE_COLORS[ph.phase] }}
                      >
                        {ph.duration}s
                      </div>
                    ))}
                  </div>
                </div>
                <p className={`text-xs mt-2 font-medium ${selectedPattern === i ? "text-[#39ff14]" : "text-[#424849]"}`}>
                  ✓ {p.benefit}
                </p>
              </button>
            ))}

            {/* Phase Guide */}
            <div className="glass-panel border border-white/40 p-5 mt-4">
              <h3 className="font-black text-[#1a1c1c] mb-3">Phase Guide</h3>
              <div className="space-y-2">
                {pattern.phases.map((ph, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ background: PHASE_COLORS[ph.phase] }}
                    />
                    <span className="font-bold text-sm text-[#1a1c1c]">{ph.label}</span>
                    <span className="text-xs text-[#424849]">— {ph.duration} seconds</span>
                    {running && phaseIdx === i && (
                      <span className="text-xs font-black text-[#39ff14] animate-pulse">← NOW</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Health Info */}
            <div className="bg-[#39ff14]/10 border border-[#39ff14]/30 rounded-[16px] p-4">
              <p className="text-xs font-bold text-[#424849]">
                💡 <strong>Clinical Note:</strong> Controlled breathing activates the vagus nerve, lowering heart rate and cortisol levels. Practice 3–5 cycles daily for best results.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
