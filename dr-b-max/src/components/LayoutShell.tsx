"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/";

  return (
    <>
      <Sidebar />
      <div className={`flex-1 min-h-screen transition-all ${isLoginPage ? "" : "md:ml-64 ml-20"}`}>
        {children}
      </div>
    </>
  );
}
