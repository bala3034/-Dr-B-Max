"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaHome, FaCamera, FaMapMarkedAlt, FaPills, FaBrain, FaQrcode, FaSignOutAlt, FaWind, FaLightbulb, FaLayerGroup, FaAppleAlt } from "react-icons/fa";
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
    { name: "Vitals", path: "/scanner", icon: <FaCamera /> },
    { name: "Food Scan", path: "/food-scanner", icon: <FaAppleAlt /> },
    { name: t("map"), path: "/map", icon: <FaMapMarkedAlt /> },
    { name: t("lifeCard"), path: "/life-card", icon: <FaQrcode /> },
    { name: "Breathe", path: "/breathe", icon: <FaWind /> },
    { name: "Health Tips", path: "/tips", icon: <FaLightbulb /> },
    { name: t("logout"), path: "/", icon: <FaSignOutAlt /> },
  ];

  return (
    <nav className="w-20 md:w-64 h-screen glass-panel fixed left-0 top-0 z-50 flex flex-col items-center md:items-start py-6 border-r border-slate-200/50 bg-white/80 backdrop-blur-xl shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
      {/* Logo */}
      <div className="w-full flex justify-center md:justify-start md:px-6 mb-8">
        <div className="w-12 h-12 rounded-full border-[3px] border-blue-500 bg-blue-50 flex items-center justify-center font-bold text-blue-600 shadow-sm">
          <span className="text-[9px] text-center leading-tight">Dr.<br/>B-MAX</span>
        </div>
      </div>

      {/* Nav links */}
      <div className="flex flex-col gap-1 w-full px-3 flex-1 overflow-y-auto no-scrollbar">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link key={item.path} href={item.path}
              className={`flex items-center gap-3 p-3 rounded-[12px] font-bold text-sm transition-all ${
                isActive
                  ? "bg-blue-50 text-blue-600 shadow-sm"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              }`}>
              <div className={`text-lg shrink-0 ${isActive ? "text-blue-600" : "text-slate-400"}`}>{item.icon}</div>
              <span className="hidden md:block">{item.name}</span>
            </Link>
          );
        })}
      </div>

      {/* Bottom: Theme + Language */}
      <div className="w-full px-3 mt-4 flex flex-col gap-2 border-t border-slate-200/50 pt-4">
        <LanguageSwitcher />
        <ThemeToggle />
        <div className="mt-2 w-full hidden md:block">
          <div className="w-full h-[3px] bg-slate-100 rounded-full overflow-hidden relative">
            <div className="absolute top-0 left-0 h-full w-1/4 bg-blue-500 animate-[pulse_2s_ease-in-out_infinite]" />
          </div>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-2 text-center">System Active</p>
        </div>
      </div>
    </nav>
  );
}
