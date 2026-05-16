"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaLayerGroup, FaChevronLeft, FaChevronRight, FaRedo } from "react-icons/fa";

interface FlashCard {
  id: number;
  front: { title: string; subtitle: string; emoji: string; color: string };
  back: { sections: { label: string; value: string }[]; warning?: string };
}

const CARDS: FlashCard[] = [
  {
    id: 1,
    front: { title: "Paracetamol", subtitle: "Analgesic / Antipyretic", emoji: "💊", color: "#39ff14" },
    back: {
      sections: [
        { label: "Standard Dose", value: "500mg–1g every 4–6 hours" },
        { label: "Max Daily Dose", value: "4g (adults), 2g if liver risk" },
        { label: "Onset", value: "30–60 minutes" },
        { label: "Duration", value: "4–6 hours" },
        { label: "Take With", value: "Water, with or without food" },
      ],
      warning: "⚠️ Overdose causes severe liver damage. Never exceed 4g/day.",
    },
  },
  {
    id: 2,
    front: { title: "Ibuprofen", subtitle: "NSAID / Anti-inflammatory", emoji: "🔴", color: "#e67e22" },
    back: {
      sections: [
        { label: "Standard Dose", value: "200–400mg every 4–6 hours" },
        { label: "Max Daily Dose", value: "1200mg OTC, 3200mg prescription" },
        { label: "Onset", value: "20–30 minutes" },
        { label: "Duration", value: "4–6 hours" },
        { label: "Take With", value: "Food or milk to prevent stomach upset" },
      ],
      warning: "⚠️ Avoid on empty stomach. Not for kidney disease, peptic ulcer.",
    },
  },
  {
    id: 3,
    front: { title: "Metformin", subtitle: "Type 2 Diabetes — Biguanide", emoji: "🩺", color: "#3498db" },
    back: {
      sections: [
        { label: "Standard Dose", value: "500–850mg twice daily with meals" },
        { label: "Max Daily Dose", value: "2550mg/day (3 doses)" },
        { label: "Onset", value: "1–2 weeks for full effect" },
        { label: "Storage", value: "Room temperature, away from moisture" },
        { label: "Take With", value: "Food (reduces GI side effects)" },
      ],
      warning: "⚠️ Stop before contrast dye procedures. Monitor kidney function.",
    },
  },
  {
    id: 4,
    front: { title: "Amlodipine", subtitle: "Calcium Channel Blocker", emoji: "❤️", color: "#ff3131" },
    back: {
      sections: [
        { label: "Standard Dose", value: "5–10mg once daily" },
        { label: "Max Daily Dose", value: "10mg/day" },
        { label: "Onset", value: "6–12 hours (steady state: 7–8 days)" },
        { label: "Duration", value: "24 hours" },
        { label: "Take With", value: "Same time daily, with or without food" },
      ],
      warning: "⚠️ Do not stop suddenly. May cause ankle swelling.",
    },
  },
  {
    id: 5,
    front: { title: "Omeprazole", subtitle: "Proton Pump Inhibitor", emoji: "🫃", color: "#9b59b6" },
    back: {
      sections: [
        { label: "Standard Dose", value: "20mg once daily" },
        { label: "Max Daily Dose", value: "40mg/day (80mg for Zollinger-Ellison)" },
        { label: "Onset", value: "1 hour (best effect after 4 days)" },
        { label: "Duration", value: "Up to 72 hours" },
        { label: "Take With", value: "30–60 min BEFORE meals, with water" },
      ],
      warning: "⚠️ Long-term use may reduce magnesium & B12 absorption.",
    },
  },
  {
    id: 6,
    front: { title: "Atorvastatin", subtitle: "Statin / Cholesterol Lowering", emoji: "🫀", color: "#27ae60" },
    back: {
      sections: [
        { label: "Standard Dose", value: "10–20mg once daily" },
        { label: "Max Daily Dose", value: "80mg/day" },
        { label: "Best Time", value: "Evening (cholesterol synthesis peaks at night)" },
        { label: "Onset", value: "2–4 weeks" },
        { label: "Avoid", value: "Grapefruit juice (increases drug level)" },
      ],
      warning: "⚠️ Report muscle pain/weakness immediately — risk of rhabdomyolysis.",
    },
  },
  {
    id: 7,
    front: { title: "Aspirin (Low Dose)", subtitle: "Antiplatelet / Cardioprotective", emoji: "🫀", color: "#ff6b6b" },
    back: {
      sections: [
        { label: "Cardio Dose", value: "75–100mg once daily" },
        { label: "Pain Dose", value: "300–600mg every 4 hours" },
        { label: "Onset", value: "5–30 minutes (antiplatelet: immediate)" },
        { label: "Take With", value: "Food or antacid to protect stomach" },
        { label: "Avoid", value: "Alcohol (increases bleeding risk)" },
      ],
      warning: "⚠️ Not for children under 16 (Reye's syndrome risk).",
    },
  },
  {
    id: 8,
    front: { title: "Cetirizine", subtitle: "2nd Gen Antihistamine", emoji: "🌸", color: "#b4cbce" },
    back: {
      sections: [
        { label: "Standard Dose", value: "10mg once daily" },
        { label: "Max Daily Dose", value: "10mg/day" },
        { label: "Onset", value: "1 hour, peak at 1–2 hours" },
        { label: "Duration", value: "24 hours" },
        { label: "Take With", value: "Any time, with or without food" },
      ],
      warning: "⚠️ May cause mild drowsiness. Avoid alcohol.",
    },
  },
];

export default function MemoryPage() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [direction, setDirection] = useState<1 | -1>(1);

  const card = CARDS[currentIdx];

  const goNext = () => {
    if (currentIdx < CARDS.length - 1) {
      setDirection(1);
      setFlipped(false);
      setTimeout(() => setCurrentIdx((i) => i + 1), 150);
    }
  };

  const goPrev = () => {
    if (currentIdx > 0) {
      setDirection(-1);
      setFlipped(false);
      setTimeout(() => setCurrentIdx((i) => i - 1), 150);
    }
  };

  const shuffle = () => {
    setFlipped(false);
    setCurrentIdx(Math.floor(Math.random() * CARDS.length));
  };

  return (
    <main className="min-h-screen bg-[var(--color-medical-bg)] p-4 md:p-8 font-sans">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-full bg-[#1a1c1c] flex items-center justify-center shadow-[0_0_20px_rgba(57,255,20,0.3)]">
            <FaLayerGroup className="text-[#39ff14] text-2xl" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-[#1a1c1c] tracking-tight">Medication Guide</h1>
            <p className="text-[#424849] font-medium">Tap card to flip · {CARDS.length} medications · Offline</p>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-xs font-bold text-[#424849] mb-2">
            <span>Card {currentIdx + 1} of {CARDS.length}</span>
            <span>{Math.round(((currentIdx + 1) / CARDS.length) * 100)}% complete</span>
          </div>
          <div className="w-full h-2 bg-white/60 rounded-full overflow-hidden">
            <motion.div
              animate={{ width: `${((currentIdx + 1) / CARDS.length) * 100}%` }}
              transition={{ type: "spring", stiffness: 200 }}
              className="h-full rounded-full bg-[#39ff14]"
            />
          </div>
          <div className="flex gap-1 mt-2">
            {CARDS.map((_, i) => (
              <button
                key={i}
                onClick={() => { setFlipped(false); setCurrentIdx(i); }}
                className={`h-1.5 flex-1 rounded-full transition-all ${i === currentIdx ? "bg-[#39ff14]" : "bg-white/60"}`}
              />
            ))}
          </div>
        </div>

        {/* Flashcard */}
        <div
          className="relative cursor-pointer mb-6"
          style={{ perspective: "1200px", minHeight: "340px" }}
          onClick={() => setFlipped((f) => !f)}
        >
          <motion.div
            animate={{ rotateY: flipped ? 180 : 0 }}
            transition={{ duration: 0.5, type: "spring", stiffness: 150, damping: 20 }}
            style={{ transformStyle: "preserve-3d", position: "relative", width: "100%", height: "340px" }}
          >
            {/* Front */}
            <div
              className="absolute inset-0 rounded-[24px] flex flex-col items-center justify-center p-8 shadow-2xl"
              style={{ backfaceVisibility: "hidden", background: `linear-gradient(135deg, #1a1c1c, #2c2e2e)`, border: `3px solid ${card.front.color}` }}
            >
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                className="text-7xl mb-6"
              >
                {card.front.emoji}
              </motion.div>
              <h2 className="text-3xl font-black text-white text-center mb-2" style={{ textShadow: `0 0 20px ${card.front.color}` }}>
                {card.front.title}
              </h2>
              <p className="text-sm font-bold uppercase tracking-widest" style={{ color: card.front.color }}>
                {card.front.subtitle}
              </p>
              <div className="mt-8 flex items-center gap-2 opacity-50">
                <div className="w-2 h-2 rounded-full bg-white animate-ping" />
                <p className="text-white text-xs font-bold">Tap to see dosage info</p>
              </div>
            </div>

            {/* Back */}
            <div
              className="absolute inset-0 rounded-[24px] p-6 shadow-2xl overflow-y-auto"
              style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)", background: "rgba(255,255,255,0.95)" }}
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">{card.front.emoji}</span>
                <div>
                  <h3 className="font-black text-[#1a1c1c] text-lg">{card.front.title}</h3>
                  <p className="text-xs text-[#424849] font-medium">{card.front.subtitle}</p>
                </div>
              </div>
              <div className="space-y-2 mb-4">
                {card.back.sections.map((s) => (
                  <div key={s.label} className="flex gap-3 items-start">
                    <span className="text-xs font-black text-[#424849] uppercase tracking-wide w-28 flex-shrink-0 pt-0.5">{s.label}</span>
                    <span className="text-sm font-bold text-[#1a1c1c]">{s.value}</span>
                  </div>
                ))}
              </div>
              {card.back.warning && (
                <div className="bg-[#ff3131]/10 border border-[#ff3131]/30 rounded-[12px] p-3">
                  <p className="text-xs font-bold text-[#ff3131]">{card.back.warning}</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <button
            onClick={goPrev}
            disabled={currentIdx === 0}
            className="flex items-center gap-2 px-6 py-3 bg-white/60 text-[#424849] font-bold rounded-full hover:bg-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <FaChevronLeft /> Prev
          </button>
          <button
            onClick={shuffle}
            className="flex items-center gap-2 px-5 py-3 bg-[#1a1c1c] text-white font-bold rounded-full hover:bg-[#39ff14] hover:text-[#1a1c1c] transition-all"
          >
            <FaRedo /> Random
          </button>
          <button
            onClick={goNext}
            disabled={currentIdx === CARDS.length - 1}
            className="flex items-center gap-2 px-6 py-3 bg-white/60 text-[#424849] font-bold rounded-full hover:bg-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Next <FaChevronRight />
          </button>
        </div>

        <p className="text-center text-xs text-[#424849]/60 font-medium mt-6">
          📚 For educational reference only. Always follow your doctor's prescription.
        </p>
      </div>
    </main>
  );
}
