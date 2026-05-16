"use client";

import React, { useEffect, useState } from "react";
import { FaSun, FaMoon } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import "@/lib/i18n";

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const saved = localStorage.getItem("drBMaxTheme");
    if (saved === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
      setDark(true);
    }
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.setAttribute("data-theme", next ? "dark" : "light");
    localStorage.setItem("drBMaxTheme", next ? "dark" : "light");
  };

  return (
    <button
      onClick={toggle}
      title={dark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      className="w-full flex items-center gap-3 p-3 rounded-[16px] text-[#424849] hover:bg-white/50 border border-transparent transition-all font-bold"
    >
      <div className={`w-10 h-6 rounded-full flex items-center transition-all px-1 ${dark ? "bg-[#39ff14]/30 justify-end" : "bg-[#b4cbce]/40 justify-start"}`}>
        <div className="w-4 h-4 rounded-full bg-white shadow-sm flex items-center justify-center text-[8px]">
          {dark ? <FaMoon className="text-[#1a1c1c]" /> : <FaSun className="text-yellow-500" />}
        </div>
      </div>
      <span className="hidden md:block text-sm">{dark ? t("darkMode") : t("lightMode")}</span>
    </button>
  );
}
