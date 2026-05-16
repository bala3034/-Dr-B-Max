"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { FaPhoneAlt, FaBan } from "react-icons/fa";

export default function SOSPage() {
  const [countdown, setCountdown] = useState(10);
  const [isCalling, setIsCalling] = useState(false);

  useEffect(() => {
    // Generate an annoying warning beep dynamically via Web Audio API 
    // to avoid needing a static mp3 asset immediately.
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext || isCalling) return;
    
    let ctx = new AudioContext();
    let interval: NodeJS.Timeout;

    const beep = () => {
      if (ctx.state === 'closed') return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.5);
      
      gain.gain.setValueAtTime(0.5, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    };

    interval = setInterval(() => beep(), 800);
    beep();

    return () => {
      clearInterval(interval);
      if (ctx.state !== 'closed') {
        ctx.close().catch(console.error);
      }
    };
  }, [isCalling]);

  useEffect(() => {
    if (countdown > 0 && !isCalling) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && !isCalling) {
      setIsCalling(true);
    }
  }, [countdown, isCalling]);

  return (
    <main 
      className="w-[100vw] h-[100vh] flex flex-col items-center justify-center relative font-sans overflow-hidden"
      role="alert" 
      aria-live="assertive"
    >
      
      {/* Alert Red Flashing Background Animation */}
      <div className={`absolute inset-0 z-0 ${!isCalling ? 'animate-[pulse_1s_ease-in-out_infinite] bg-[var(--color-alert-red)]' : 'bg-red-900'}`} />
      
      {/* Dark Overlay for contrast */}
      <div className="absolute inset-0 bg-black/40 z-10" />

      <div className="z-20 flex flex-col items-center gap-12 p-6">
        <h1 className="text-6xl md:text-8xl font-black text-white uppercase tracking-tighter text-center" aria-label="Emergency SOS">
          Emergency<br/>SOS
        </h1>
        
        <div className="text-center">
          <p className="text-2xl text-white/90 font-bold mb-4">
            Dr. B-MAX has detected a critical anomaly.
          </p>
          
          {!isCalling ? (
            <p className="text-4xl text-white font-black animate-bounce" aria-live="polite">
              Calling emergency services in {countdown}...
            </p>
          ) : (
            <p className="text-4xl text-[#39ff14] font-black" aria-live="polite">
              Connecting to Emergency Services...
            </p>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-6 w-full max-w-lg mt-8">
          <button 
            onClick={() => setIsCalling(true)}
            disabled={isCalling}
            className={`flex-1 font-black text-2xl py-6 rounded-[24px] shadow-2xl transition-transform flex items-center justify-center gap-4 ${isCalling ? 'bg-gray-500 text-gray-300 cursor-not-allowed' : 'bg-white text-[var(--color-alert-red)] hover:scale-105'}`}
            aria-label="Call 911 immediately"
          >
            <FaPhoneAlt /> Call 911
          </button>
          
          <Link 
            href="/" 
            className="flex-1 bg-black/50 backdrop-blur-md border border-white/20 text-white font-bold text-xl py-6 rounded-[24px] hover:bg-black/80 transition-colors flex items-center justify-center gap-4"
            aria-label="Cancel emergency call and return to home"
          >
            <FaBan /> Cancel
          </Link>
        </div>
      </div>
    </main>
  );
}
