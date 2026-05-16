"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaVolumeUp, FaVolumeMute, FaPlay, FaStop } from "react-icons/fa";

interface TextToSpeechProps {
  text: string;
  label?: string;
  compact?: boolean;
}

export default function TextToSpeech({ text, label = "Read Aloud", compact = false }: TextToSpeechProps) {
  const [speaking, setSpeaking] = useState(false);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    setSupported(typeof window !== "undefined" && "speechSynthesis" in window);
  }, []);

  useEffect(() => {
    const handleEnd = () => setSpeaking(false);
    window.speechSynthesis?.addEventListener?.("end", handleEnd);
    return () => {
      window.speechSynthesis?.removeEventListener?.("end", handleEnd);
      window.speechSynthesis?.cancel?.();
    };
  }, []);

  const speak = () => {
    if (!supported) return;
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;
    // Prefer a calm, clear voice
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v => v.lang === "en-US" && v.name.toLowerCase().includes("female"))
      || voices.find(v => v.lang === "en-US")
      || voices[0];
    if (preferred) utterance.voice = preferred;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  if (!supported) return null;

  if (compact) {
    return (
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={speak}
        title={speaking ? "Stop reading" : label}
        className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
          speaking
            ? "bg-[#ff3131] text-white shadow-[0_0_10px_rgba(255,49,49,0.4)]"
            : "bg-[#39ff14]/10 text-[#39ff14] hover:bg-[#39ff14]/20"
        }`}
      >
        {speaking ? <FaStop size={12} /> : <FaVolumeUp size={12} />}
      </motion.button>
    );
  }

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={speak}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-[12px] font-bold text-sm transition-all ${
        speaking
          ? "bg-[#ff3131] text-white shadow-[0_0_15px_rgba(255,49,49,0.3)]"
          : "bg-[#39ff14]/10 text-[#1a1c1c] border border-[#39ff14]/30 hover:bg-[#39ff14]/20"
      }`}
    >
      {speaking ? (
        <>
          <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 0.7 }}>
            <FaVolumeMute size={14} />
          </motion.div>
          Stop Reading
        </>
      ) : (
        <>
          <FaVolumeUp size={14} />
          {label}
        </>
      )}
    </motion.button>
  );
}
