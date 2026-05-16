"use client";

import React, { useRef, useEffect } from "react";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";

export default function RadarPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let angle = 0;

    const render = () => {
      // Responsive sizing
      const size = Math.min(window.innerWidth, window.innerHeight) * 0.8;
      canvas.width = size;
      canvas.height = size;
      const center = size / 2;
      const radius = center - 10;

      // Clear
      ctx.clearRect(0, 0, size, size);

      // Draw Grid Circles
      ctx.strokeStyle = "rgba(180, 203, 206, 0.4)";
      ctx.lineWidth = 2;
      for (let i = 1; i <= 4; i++) {
        ctx.beginPath();
        ctx.arc(center, center, (radius / 4) * i, 0, 2 * Math.PI);
        ctx.stroke();
      }

      // Draw Crosshairs
      ctx.beginPath();
      ctx.moveTo(center, 0);
      ctx.lineTo(center, size);
      ctx.moveTo(0, center);
      ctx.lineTo(size, center);
      ctx.stroke();

      // Draw Sweeping Radar Line
      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(angle);
      
      // Gradient for the sweep
      const gradient = ctx.createLinearGradient(0, 0, 0, -radius);
      gradient.addColorStop(0, "rgba(57, 255, 20, 0.8)");
      gradient.addColorStop(1, "rgba(57, 255, 20, 0)");
      
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(10, -radius);
      ctx.lineTo(-10, -radius);
      ctx.fillStyle = gradient;
      ctx.fill();

      // Sharp leading edge
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -radius);
      ctx.strokeStyle = "#39ff14";
      ctx.lineWidth = 3;
      ctx.stroke();
      
      ctx.restore();

      // Update angle
      angle += 0.03;
      animationFrameId = window.requestAnimationFrame(render);
    };

    render();

    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <main className="min-h-screen bg-[var(--color-medical-bg)] flex flex-col items-center justify-center relative overflow-hidden font-sans">
      {/* HUD Header */}
      <header className="absolute top-0 left-0 w-full p-6 flex items-center justify-between z-20">
        <Link href="/" className="glass-panel px-4 py-2 text-[#1a1c1c] font-bold flex items-center gap-2 hover:bg-white/80 transition-colors">
          <FaArrowLeft /> Dashboard
        </Link>
        <div className="glass-panel px-6 py-2 border-[#39ff14]/50 shadow-[0_0_15px_rgba(57,255,20,0.3)] bg-[#39ff14]/10 text-[#39ff14] font-bold tracking-widest uppercase">
          Scanning Area
        </div>
      </header>

      {/* Canvas Radar centered */}
      <div className="z-10 relative flex items-center justify-center w-full h-full">
        <canvas ref={canvasRef} className="rounded-full shadow-[0_0_50px_rgba(180,203,206,0.3)] bg-white/10 backdrop-blur-sm" />
        
        {/* Blip dot on radar */}
        <div className="absolute w-4 h-4 bg-[#ff3131] rounded-full top-[30%] left-[60%] shadow-[0_0_15px_rgba(255,49,49,0.8)] animate-pulse" />
      </div>

    </main>
  );
}
