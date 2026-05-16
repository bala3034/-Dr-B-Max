"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaLightbulb, FaHeart, FaAppleAlt, FaBrain, FaRunning, FaMoon, FaTint, FaLeaf } from "react-icons/fa";

interface HealthTip {
  id: number;
  icon: React.ReactNode;
  category: string;
  title: string;
  body: string;
  color: string;
}

const ALL_TIPS: Omit<HealthTip, "id">[] = [
  {
    icon: <FaTint />, category: "Hydration", color: "#3498db",
    title: "Drink 8 Glasses of Water Daily",
    body: "Proper hydration improves kidney function, skin health, and cognitive performance. Start your day with a glass of warm water to kickstart digestion.",
  },
  {
    icon: <FaHeart />, category: "Cardiovascular", color: "#ff3131",
    title: "Monitor Your Resting Heart Rate",
    body: "A healthy resting heart rate is 60–100 BPM. Athletes may have lower rates (40–60 BPM). Check yours each morning before getting out of bed.",
  },
  {
    icon: <FaRunning />, category: "Exercise", color: "#39ff14",
    title: "30 Minutes of Walking = Significant Health Gains",
    body: "Just 30 minutes of brisk walking daily can reduce the risk of heart disease by 35%, type 2 diabetes by 40%, and depression by 30%.",
  },
  {
    icon: <FaMoon />, category: "Sleep", color: "#9b59b6",
    title: "7–9 Hours of Sleep Is Non-Negotiable",
    body: "Chronic sleep deprivation impairs immune function, increases cortisol, and doubles your risk of cardiovascular events. Maintain a consistent sleep schedule.",
  },
  {
    icon: <FaAppleAlt />, category: "Nutrition", color: "#e67e22",
    title: "Eat the Rainbow Every Day",
    body: "Different colored fruits and vegetables provide distinct phytonutrients. Aim for 5+ colors on your plate daily to ensure comprehensive micronutrient coverage.",
  },
  {
    icon: <FaBrain />, category: "Mental Health", color: "#b4cbce",
    title: "Mindfulness Reduces Cortisol by 31%",
    body: "Even 10 minutes of mindfulness meditation daily has been shown in clinical studies to significantly reduce cortisol and anxiety biomarkers.",
  },
  {
    icon: <FaLeaf />, category: "Lifestyle", color: "#27ae60",
    title: "Deep Breathing Activates the Vagus Nerve",
    body: "Slow, deep breathing (4-7-8 pattern) stimulates the vagus nerve, triggering the parasympathetic 'rest and digest' response within seconds.",
  },
  {
    icon: <FaTint />, category: "Kidney Health", color: "#3498db",
    title: "Color of Urine Indicates Hydration",
    body: "Pale yellow = well hydrated. Dark yellow = drink water now. Clear = overhydrated. Aim for a light lemonade color throughout the day.",
  },
  {
    icon: <FaHeart />, category: "Blood Pressure", color: "#ff3131",
    title: "The DASH Diet Lowers BP Naturally",
    body: "Dietary Approaches to Stop Hypertension (DASH) focuses on fruits, vegetables, whole grains, and low sodium. Can lower systolic BP by 8–14 mmHg.",
  },
  {
    icon: <FaRunning />, category: "Posture", color: "#39ff14",
    title: "Poor Posture Causes Chronic Pain",
    body: "Forward head posture adds 10 lbs of pressure on the spine per inch of tilt. Set phone reminders to check your posture every 30 minutes.",
  },
  {
    icon: <FaMoon />, category: "Sleep", color: "#9b59b6",
    title: "Blue Light Blocks Melatonin",
    body: "Exposure to phone/screen blue light for 2 hours before bed can delay melatonin onset by up to 1.5 hours. Use night mode or blue-light glasses.",
  },
  {
    icon: <FaAppleAlt />, category: "Digestion", color: "#e67e22",
    title: "Fiber Feeds Your Gut Microbiome",
    body: "Adults need 25–38g of fiber daily. Most get less than 15g. Fiber feeds beneficial gut bacteria which produce short-chain fatty acids that reduce inflammation.",
  },
  {
    icon: <FaBrain />, category: "Cognitive Health", color: "#b4cbce",
    title: "Exercise Grows Your Hippocampus",
    body: "Aerobic exercise increases BDNF (brain-derived neurotrophic factor) which stimulates growth of new neurons in the hippocampus — the brain's memory center.",
  },
  {
    icon: <FaLeaf />, category: "Stress", color: "#27ae60",
    title: "Cold Showers Reduce Stress Hormones",
    body: "Regular cold exposure (2–3 minutes at 15°C) has been shown to decrease cortisol by 31% and increase norepinephrine by 200–300% according to research.",
  },
  {
    icon: <FaTint />, category: "Oral Health", color: "#3498db",
    title: "Gum Disease Linked to Heart Disease",
    body: "Periodontitis bacteria can enter the bloodstream and trigger arterial inflammation. Floss daily and see a dentist every 6 months to protect your heart.",
  },
  {
    icon: <FaHeart />, category: "Prevention", color: "#ff3131",
    title: "Know Your 5 Vital Numbers",
    body: "Track: Blood Pressure (<120/80), Fasting Glucose (<100 mg/dL), Total Cholesterol (<200), BMI (18.5–24.9), and Waist Circumference (<40 in for men, <35 for women).",
  },
];

const TIPS_PER_PAGE = 5;

const CATEGORY_COLORS: Record<string, string> = {
  Hydration: "#3498db", Cardiovascular: "#ff3131", Exercise: "#39ff14",
  Sleep: "#9b59b6", Nutrition: "#e67e22", "Mental Health": "#b4cbce",
  Lifestyle: "#27ae60", "Kidney Health": "#3498db", "Blood Pressure": "#ff3131",
  Posture: "#39ff14", Digestion: "#e67e22", "Cognitive Health": "#b4cbce",
  Stress: "#27ae60", "Oral Health": "#3498db", Prevention: "#ff3131",
};

const CATEGORIES = ["All", ...Array.from(new Set(ALL_TIPS.map(t => t.category)))];

export default function TipsPage() {
  const [displayedCount, setDisplayedCount] = useState(TIPS_PER_PAGE);
  const [activeCategory, setActiveCategory] = useState("All");
  const [savedTips, setSavedTips] = useState<Set<number>>(new Set());
  const loaderRef = useRef<HTMLDivElement>(null);

  const tips: HealthTip[] = ALL_TIPS.map((t, i) => ({ ...t, id: i }))
    .filter(t => activeCategory === "All" || t.category === activeCategory);

  const displayed = tips.slice(0, displayedCount);

  useEffect(() => {
    setDisplayedCount(TIPS_PER_PAGE);
  }, [activeCategory]);

  const loadMore = useCallback(() => {
    setDisplayedCount((c) => Math.min(c + TIPS_PER_PAGE, tips.length));
  }, [tips.length]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) loadMore(); },
      { threshold: 0.1 }
    );
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [loadMore]);

  const toggleSave = (id: number) => {
    setSavedTips((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <main className="min-h-screen bg-[var(--color-medical-bg)] p-4 md:p-8 font-sans">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-full bg-[#1a1c1c] flex items-center justify-center shadow-[0_0_20px_rgba(57,255,20,0.3)]">
            <FaLightbulb className="text-[#39ff14] text-2xl" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-[#1a1c1c] tracking-tight">Health Tips</h1>
            <p className="text-[#424849] font-medium">Evidence-based tips · Offline · {ALL_TIPS.length} articles</p>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 flex-wrap mb-6">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                activeCategory === cat
                  ? "bg-[#1a1c1c] text-white"
                  : "bg-white/70 text-[#424849] hover:bg-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="flex gap-4 mb-6">
          <div className="glass-panel border border-white/40 px-4 py-2 text-center flex-1">
            <p className="text-xl font-black text-[#39ff14]">{tips.length}</p>
            <p className="text-xs text-[#424849] font-bold uppercase">Tips</p>
          </div>
          <div className="glass-panel border border-white/40 px-4 py-2 text-center flex-1">
            <p className="text-xl font-black text-[#1a1c1c]">{savedTips.size}</p>
            <p className="text-xs text-[#424849] font-bold uppercase">Saved</p>
          </div>
          <div className="glass-panel border border-white/40 px-4 py-2 text-center flex-1">
            <p className="text-xl font-black text-[#b4cbce]">{displayedCount}</p>
            <p className="text-xs text-[#424849] font-bold uppercase">Loaded</p>
          </div>
        </div>

        {/* Tips Feed */}
        <div className="space-y-4">
          <AnimatePresence>
            {displayed.map((tip, i) => (
              <motion.div
                key={tip.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i < TIPS_PER_PAGE ? i * 0.05 : 0 }}
                className="glass-panel border border-white/40 p-5 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-12 h-12 rounded-[12px] flex items-center justify-center flex-shrink-0 text-white text-xl"
                    style={{ background: tip.color }}
                  >
                    {tip.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span
                        className="text-xs font-black px-2 py-0.5 rounded-full"
                        style={{ background: `${CATEGORY_COLORS[tip.category]}15`, color: CATEGORY_COLORS[tip.category] }}
                      >
                        {tip.category}
                      </span>
                      <button
                        onClick={() => toggleSave(tip.id)}
                        className={`text-lg transition-all ${savedTips.has(tip.id) ? "text-[#ff3131]" : "text-[#424849]/40 hover:text-[#ff3131]"}`}
                      >
                        {savedTips.has(tip.id) ? "❤️" : "🤍"}
                      </button>
                    </div>
                    <h3 className="font-black text-[#1a1c1c] leading-tight mb-2">{tip.title}</h3>
                    <p className="text-sm text-[#424849] font-medium leading-relaxed">{tip.body}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Infinite Scroll Loader */}
        {displayedCount < tips.length && (
          <div ref={loaderRef} className="flex justify-center py-8">
            <div className="flex gap-2">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{ y: [0, -8, 0] }}
                  transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }}
                  className="w-2 h-2 rounded-full bg-[#39ff14]"
                />
              ))}
            </div>
          </div>
        )}

        {displayedCount >= tips.length && tips.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8"
          >
            <p className="text-[#424849] font-bold text-sm">✅ All {tips.length} tips loaded</p>
          </motion.div>
        )}
      </div>
    </main>
  );
}
