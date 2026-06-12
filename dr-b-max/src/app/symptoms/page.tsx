"use client";
import React, { useState } from "react";
import { ALL_SYMPTOMS, analyzeSymptoms, type SymptomResult, type Severity } from "@/lib/symptomEngine";
import { motion, AnimatePresence } from "framer-motion";
import { FaBrain, FaExclamationTriangle, FaTimes, FaSearch } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import "@/lib/i18n";

const SEVERITY_CONFIG: Record<Severity, { color: string; bg: string; label: string }> = {
  emergency: { color: "text-white", bg: "bg-[#ff3131]", label: "🚨 EMERGENCY" },
  urgent: { color: "text-[#ff6b00]", bg: "bg-[#ff6b00]/10", label: "⚠️ URGENT" },
  moderate: { color: "text-yellow-600", bg: "bg-yellow-100", label: "⚡ MODERATE" },
  mild: { color: "text-[#39ff14]", bg: "bg-[#39ff14]/10", label: "✅ MILD" },
};

const CATEGORIES = ["All", "Heart", "Neuro", "Respiratory", "Digestive", "Body", "General", "Mental"];

export default function SymptomsPage() {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [result, setResult] = useState<SymptomResult | null>(null);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [analyzed, setAnalyzed] = useState(false);
  const [aiOpinion, setAiOpinion] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const { t } = useTranslation();

  const toggle = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
    setAnalyzed(false);
  };

  const analyze = () => {
    const r = analyzeSymptoms(Array.from(selected));
    setResult(r);
    setAnalyzed(true);
  };

  const reset = () => { setSelected(new Set()); setResult(null); setAnalyzed(false); setAiOpinion(null); };

  const getAiOpinion = async () => {
    if (selected.size === 0) return;
    setLoadingAi(true);
    setAiOpinion(null);
    try {
      // Look up symptom labels for the prompt
      const symptomLabels = Array.from(selected).map(id => ALL_SYMPTOMS.find(s => s.id === id)?.label).filter(Boolean);
      const prompt = `I am experiencing the following symptoms: ${symptomLabels.join(', ')}. The local offline engine suggested an overall severity of ${result?.overallSeverity} with conditions like ${result?.conditions.map(c => c.name).join(', ')}. Can you provide a second opinion, explain what might be going on, and give some actionable advice? Keep it concise and formatted clearly. Note: always remind me to see a doctor if it sounds serious.`;
      
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      if (res.ok) {
        const data = await res.json();
        setAiOpinion(data.result);
      } else {
        setAiOpinion("Gemini AI is currently unreachable.");
      }
    } catch (e) {
      setAiOpinion("Failed to connect to AI brain.");
    } finally {
      setLoadingAi(false);
    }
  };

  const filtered = ALL_SYMPTOMS.filter(s =>
    (filter === "All" || s.category === filter) &&
    (search === "" || s.label.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <main className="min-h-screen bg-[var(--color-medical-bg)] p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-full bg-[#1a1c1c] flex items-center justify-center shadow-[0_0_20px_rgba(57,255,20,0.3)]">
            <FaBrain className="text-[#39ff14] text-2xl" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-[#1a1c1c] tracking-tight">{t("symptomAi")}</h1>
            <p className="text-[#424849] font-medium">{t("offlineEngine")} · 40+ symptoms · 100% private</p>
          </div>
        </div>

        {/* Emergency Banner */}
        <div className="mb-6 bg-[#ff3131]/10 border border-[#ff3131]/30 rounded-[16px] p-4 flex items-center gap-3">
          <FaExclamationTriangle className="text-[#ff3131] shrink-0" />
          <p className="text-sm font-bold text-[#424849]">
            This tool is for <strong>informational purposes only</strong> and does NOT replace professional medical advice. In emergencies, call <strong>108</strong>.
          </p>
        </div>

        {/* Search + Filter */}
        <div className="mb-4 flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#b4cbce]" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search symptom..."
              className="w-full pl-10 pr-4 py-3 rounded-[16px] bg-white border-2 border-transparent focus:border-[#39ff14] outline-none font-medium text-[#1a1c1c]" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setFilter(cat)}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${filter === cat ? "bg-[#1a1c1c] text-white" : "bg-white/70 text-[#424849] hover:bg-white"}`}>
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Symptom Grid */}
        <div className="glass-panel border border-white/40 p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-[#1a1c1c]">{t("selectSymptoms")} ({selected.size} selected)</h2>
            {selected.size > 0 && (
              <button onClick={reset} className="text-xs text-[#ff3131] font-bold flex items-center gap-1 hover:underline">
                <FaTimes /> Clear all
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {filtered.map(s => (
              <button key={s.id} onClick={() => toggle(s.id)}
                className={`px-3 py-2.5 rounded-[12px] text-sm font-bold text-left transition-all ${
                  selected.has(s.id)
                    ? "bg-[#1a1c1c] text-[#39ff14] border-2 border-[#39ff14]"
                    : "bg-white/60 text-[#424849] border-2 border-transparent hover:bg-white"
                }`}>
                {s.label}
              </button>
            ))}
            {filtered.length === 0 && <p className="text-[#424849] col-span-3 text-center py-4">No symptoms found</p>}
          </div>
        </div>

        {/* Analyze Button */}
        <button onClick={analyze} disabled={selected.size === 0}
          className="w-full py-4 bg-[#1a1c1c] text-white font-black text-lg rounded-[16px] flex items-center justify-center gap-2 hover:bg-[#39ff14] hover:text-[#1a1c1c] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-xl mb-8">
          <FaBrain /> {t("analyzeSymptoms")} ({selected.size})
        </button>

        {/* Results */}
        <AnimatePresence>
          {analyzed && result && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {/* Summary Banner */}
              <div className={`p-5 rounded-[20px] mb-6 ${SEVERITY_CONFIG[result.overallSeverity].bg} border-2 ${result.overallSeverity === "emergency" ? "border-[#ff3131]" : "border-transparent"}`}>
                <div className="flex items-center gap-3 mb-2">
                  <span className={`text-lg font-black ${SEVERITY_CONFIG[result.overallSeverity].color}`}>
                    {SEVERITY_CONFIG[result.overallSeverity].label}
                  </span>
                </div>
                <p className={`font-bold ${SEVERITY_CONFIG[result.overallSeverity].color}`}>{result.summary}</p>
                {result.emergencyCall && (
                  <a href="tel:108" className="mt-3 inline-flex items-center gap-2 bg-white text-[#ff3131] font-black px-6 py-3 rounded-full text-lg hover:scale-105 transition-transform">
                    📞 Call 108 Now
                  </a>
                )}
              </div>

              {/* Conditions */}
              <h2 className="text-xl font-black text-[#1a1c1c] mb-4">Possible Conditions</h2>
              <div className="space-y-3">
                {result.conditions.map((cond, i) => (
                  <motion.div key={cond.name} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
                    className="glass-panel border border-white/40 p-5">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-black text-[#1a1c1c] text-lg">{cond.name}</h3>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${SEVERITY_CONFIG[cond.severity].bg} ${SEVERITY_CONFIG[cond.severity].color}`}>
                          {SEVERITY_CONFIG[cond.severity].label}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-black text-[#39ff14]">{cond.confidence}%</p>
                        <p className="text-xs text-[#424849]">match</p>
                      </div>
                    </div>
                    {/* Confidence Bar */}
                    <div className="w-full h-2 bg-[#f0f4f5] rounded-full mb-3">
                      <div className="h-2 rounded-full bg-[#39ff14]" style={{ width: `${cond.confidence}%` }} />
                    </div>
                    <p className="text-sm font-medium text-[#424849]">💡 {cond.advice}</p>
                  </motion.div>
                ))}
              </div>

              {/* AI Second Opinion Section */}
              <div className="mt-8">
                <button 
                  onClick={getAiOpinion} 
                  disabled={loadingAi}
                  className="w-full py-4 bg-gradient-to-r from-[#1a1c1c] to-[#424849] text-white font-black text-lg rounded-[16px] flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(57,255,20,0.4)] transition-all disabled:opacity-50"
                >
                  <FaBrain className="text-[#39ff14]" /> 
                  {loadingAi ? "Consulting Gemini AI..." : "Get AI Second Opinion"}
                </button>

                <AnimatePresence>
                  {aiOpinion && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }} 
                      animate={{ opacity: 1, height: "auto" }} 
                      className="mt-4 p-5 rounded-[20px] bg-white border-2 border-[#39ff14] shadow-lg relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-[#39ff14] rounded-full blur-[80px] opacity-20 pointer-events-none" />
                      <h3 className="font-black text-[#1a1c1c] text-lg mb-3 flex items-center gap-2">
                        <FaBrain className="text-[#39ff14]" /> Gemini AI Analysis
                      </h3>
                      <div className="text-[#424849] text-sm leading-relaxed whitespace-pre-wrap font-medium">
                        {aiOpinion}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
