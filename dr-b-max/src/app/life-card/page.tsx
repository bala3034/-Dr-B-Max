"use client";
import React, { useEffect, useState } from "react";
import QRCode from "qrcode";
import db from "@/db/indexedDB";
import { motion } from "framer-motion";
import { FaQrcode, FaDownload, FaHeartbeat, FaShare } from "react-icons/fa";
import TextToSpeech from "@/components/TextToSpeech";

export default function LifeCardPage() {
  const [qrUrl, setQrUrl] = useState("");
  const [meds, setMeds] = useState<any[]>([]);
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    setCanShare(typeof navigator !== "undefined" && !!navigator.share);

    const load = async () => {
      const allMeds = await db.medications.toArray();
      setMeds(allMeds);
      const payload = {
        patient: "Bala",
        generatedAt: new Date().toISOString(),
        medications: allMeds.map(m => ({ name: m.name, dosage: m.dosage, time: m.time, instructions: m.instructions })),
        emergency: "Call 108",
        app: "Dr. B-MAX",
      };
      const url = await QRCode.toDataURL(JSON.stringify(payload), {
        width: 300, margin: 2,
        color: { dark: "#1a1c1c", light: "#ffffff" },
      });
      setQrUrl(url);
    };
    load();
  }, []);

  const download = () => {
    const a = document.createElement("a");
    a.href = qrUrl;
    a.download = "DrBMax_LifeCard_QR.png";
    a.click();
  };

  const share = async () => {
    if (!canShare) return;
    try {
      await navigator.share({
        title: "Dr. B-MAX Life Card",
        text: `Emergency Medical ID — ${meds.length} medication(s) on record. Emergency: Call 108.`,
        url: window.location.href,
      });
    } catch (e) {
      // User cancelled or error
    }
  };

  const ttsText = meds.length > 0
    ? `This is the Dr. B-MAX Life Card for Bala. ${meds.length} medication${meds.length > 1 ? "s" : ""} on record: ${meds.map(m => `${m.name}, ${m.dosage}`).join(". ")}. In an emergency, call 108.`
    : "This is the Dr. B-MAX Life Card. No medications currently on record. In an emergency, call 108.";

  return (
    <main className="min-h-screen bg-[var(--color-medical-bg)] flex flex-col items-center justify-center p-6 font-sans">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-lg">
        <div className="glass-panel border border-white/40 shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-[#1a1c1c] p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <FaHeartbeat className="text-[#ff3131] text-3xl animate-pulse" />
              <div>
                <h1 className="text-2xl font-black text-white tracking-tight">LIFE CARD</h1>
                <p className="text-[#39ff14] text-xs font-bold uppercase tracking-widest">Dr. B-MAX Emergency Medical ID</p>
              </div>
            </div>
            {/* TTS Button in Header */}
            <TextToSpeech text={ttsText} label="Read Card" compact />
          </div>

          <div className="p-8 flex flex-col items-center gap-6">
            <p className="text-center text-sm font-bold text-[#424849] uppercase tracking-widest">
              📱 Scan for full medication profile
            </p>

            {qrUrl ? (
              <div className="p-4 bg-white rounded-[24px] shadow-lg border-4 border-[#39ff14]">
                <img src={qrUrl} alt="Medical QR Code" className="w-64 h-64" />
              </div>
            ) : (
              <div className="w-64 h-64 bg-white/50 rounded-[24px] flex items-center justify-center">
                <FaQrcode className="text-6xl text-[#b4cbce] animate-pulse" />
              </div>
            )}

            <div className="w-full grid grid-cols-2 gap-4">
              <div className="bg-white/60 rounded-[16px] p-4 text-center">
                <p className="text-3xl font-black text-[#1a1c1c]">{meds.length}</p>
                <p className="text-xs font-bold text-[#424849] uppercase">Active Meds</p>
              </div>
              <div className="bg-[#ff3131]/10 rounded-[16px] p-4 text-center border border-[#ff3131]/30">
                <p className="text-lg font-black text-[#ff3131]">108</p>
                <p className="text-xs font-bold text-[#424849] uppercase">Emergency</p>
              </div>
            </div>

            {meds.length > 0 && (
              <div className="w-full space-y-2">
                <p className="text-xs font-bold text-[#424849] uppercase tracking-widest">Medications</p>
                {meds.map(m => (
                  <div key={m.id} className="flex justify-between items-center bg-white/50 rounded-[12px] px-4 py-2">
                    <span className="font-bold text-sm text-[#1a1c1c]">{m.name}</span>
                    <span className="text-xs text-[#424849]">{m.dosage} @ {m.time}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Action Buttons */}
            <div className="w-full flex gap-3">
              <button
                onClick={download}
                disabled={!qrUrl}
                className="flex-1 bg-[#1a1c1c] text-white font-bold py-4 rounded-[16px] flex items-center justify-center gap-2 hover:bg-[#39ff14] hover:text-[#1a1c1c] transition-all disabled:opacity-50"
              >
                <FaDownload /> Download QR
              </button>
              {canShare && (
                <button
                  onClick={share}
                  className="flex-1 bg-[#b4cbce]/20 border border-[#b4cbce]/50 text-[#1a1c1c] font-bold py-4 rounded-[16px] flex items-center justify-center gap-2 hover:bg-[#b4cbce]/40 transition-all"
                >
                  <FaShare /> Share Card
                </button>
              )}
            </div>

            {/* Read Aloud Button (full) */}
            <div className="w-full">
              <TextToSpeech text={ttsText} label="Read Life Card Aloud" />
            </div>

            <p className="text-center text-xs text-[#424849]/70 font-medium">
              Show to paramedics or emergency responders. All data stored locally.
            </p>
          </div>
        </div>
      </motion.div>
    </main>
  );
}
