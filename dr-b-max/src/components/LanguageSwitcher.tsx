"use client";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { FaGlobe } from "react-icons/fa";
import "@/lib/i18n";

const LANGUAGES = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "hi", label: "हिंदी", flag: "🇮🇳" },
  { code: "ta", label: "தமிழ்", flag: "🇮🇳" },
  { code: "te", label: "తెలుగు", flag: "🇮🇳" },
  { code: "bn", label: "বাংলা", flag: "🇮🇳" },
  { code: "mr", label: "मराठी", flag: "🇮🇳" },
  { code: "kn", label: "ಕನ್ನಡ", flag: "🇮🇳" },
  { code: "ml", label: "മലയാളം", flag: "🇮🇳" },
  { code: "gu", label: "ગુજરાતી", flag: "🇮🇳" },
  { code: "pa", label: "ਪੰਜਾਬੀ", flag: "🇮🇳" },
  { code: "ur", label: "اردو", flag: "🇵🇰" },
];

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const current = LANGUAGES.find(l => l.code === i18n.language) || LANGUAGES[0];

  const change = (code: string) => {
    i18n.changeLanguage(code);
    localStorage.setItem("drBMaxLang", code);
    setOpen(false);
  };

  return (
    <div className="relative w-full">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 p-3 rounded-[16px] text-[#424849] hover:bg-white/50 border border-transparent transition-all font-bold"
      >
        <FaGlobe className="text-[#39ff14] shrink-0" />
        <span className="hidden md:block text-sm">{current.flag} {current.label}</span>
      </button>
      {open && (
        <div className="absolute bottom-full left-0 mb-2 w-48 bg-white/95 backdrop-blur-xl rounded-[16px] shadow-2xl border border-white/50 overflow-hidden z-50 max-h-64 overflow-y-auto">
          {LANGUAGES.map(lang => (
            <button
              key={lang.code}
              onClick={() => change(lang.code)}
              className={`w-full text-left px-4 py-2.5 text-sm font-bold hover:bg-[#39ff14]/10 transition-colors flex items-center gap-2 ${lang.code === i18n.language ? "text-[#39ff14] bg-[#39ff14]/5" : "text-[#1a1c1c]"}`}
            >
              <span>{lang.flag}</span> {lang.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
