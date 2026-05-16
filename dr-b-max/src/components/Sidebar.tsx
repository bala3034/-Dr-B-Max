"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaHome, FaCamera, FaMapMarkedAlt, FaPills, FaBrain, FaQrcode, FaSignOutAlt, FaWind, FaLightbulb, FaLayerGroup } from "react-icons/fa";
import ThemeToggle from "./ThemeToggle";
import LanguageSwitcher from "./LanguageSwitcher";
import { useTranslation } from "react-i18next";
import "@/lib/i18n";

export default function Sidebar() {
  const pathname = usePathname();
  const { t } = useTranslation();
  if (pathname === "/") return null;

  const navItems = [
    { name: t("dashboard"), path: "/dashboard", icon: <FaHome /> },
    { name: t("medications"), path: "/medications", icon: <FaPills /> },
    { name: t("symptoms"), path: "/symptoms", icon: <FaBrain /> },
    { name: t("scanner"), path: "/scanner", icon: <FaCamera /> },
    { name: t("map"), path: "/map", icon: <FaMapMarkedAlt /> },
    { name: t("lifeCard"), path: "/life-card", icon: <FaQrcode /> },
    { name: "Breathe", path: "/breathe", icon: <FaWind /> },
    { name: "Health Tips", path: "/tips", icon: <FaLightbulb /> },
    { name: "Med Guide", path: "/memory", icon: <FaLayerGroup /> },
    { name: t("logout"), path: "/", icon: <FaSignOutAlt /> },
  ];

  return (
    <nav className="w-20 md:w-64 h-screen glass-panel fixed left-0 top-0 z-50 flex flex-col items-center md:items-start py-6 border-r border-[#424849]/20 bg-white/60 backdrop-blur-xl">
      {/* Logo */}
      <div className="w-full flex justify-center md:justify-start md:px-6 mb-8">
        <div className="w-12 h-12 rounded-full border-2 border-[#39ff14] bg-[#b4cbce] flex items-center justify-center font-bold text-white shadow-[0_0_15px_rgba(57,255,20,0.5)]">
          <span className="text-[9px] text-center leading-tight">Dr.<br/>B-MAX</span>
        </div>
      </div>

      {/* Nav links */}
      <div className="flex flex-col gap-1 w-full px-3 flex-1">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link key={item.path} href={item.path}
              className={`flex items-center gap-3 p-3 rounded-[16px] font-bold text-sm transition-all ${
                isActive
                  ? "bg-[#39ff14]/10 text-[#1a1c1c] border border-[#39ff14] shadow-[0_0_15px_rgba(57,255,20,0.2)]"
                  : "text-[#424849] border border-transparent hover:bg-white/50"
              }`}>
              <div className={`text-base shrink-0 ${isActive ? "text-[#39ff14]" : ""}`}>{item.icon}</div>
              <span className="hidden md:block">{item.name}</span>
            </Link>
          );
        })}
      </div>

      {/* Bottom: Theme + Language */}
      <div className="w-full px-3 mt-4 flex flex-col gap-1 border-t border-[#424849]/20 pt-4">
        <LanguageSwitcher />
        <ThemeToggle />
        <div className="mt-2 w-full hidden md:block">
          <div className="w-full h-[2px] bg-[#39ff14]/30 rounded-full overflow-hidden relative">
            <div className="absolute top-0 left-0 h-full w-1/4 bg-[#39ff14] animate-[pulse_2s_ease-in-out_infinite]" />
          </div>
          <p className="text-[#424849] text-[10px] font-bold uppercase tracking-widest mt-2 text-center">{t("systemActive")}</p>
        </div>
      </div>
    </nav>
  );
}
