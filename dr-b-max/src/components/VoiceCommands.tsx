"use client";
import React, { useEffect, useRef, useState } from "react";
import { FaMicrophone, FaMicrophoneSlash } from "react-icons/fa";
import { useRouter } from "next/navigation";

interface VoiceCommandsProps {
  onTakeMedication?: (name: string) => void;
  onOpenAddForm?: () => void;
}

export default function VoiceCommands({ onTakeMedication, onOpenAddForm }: VoiceCommandsProps) {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [feedback, setFeedback] = useState("");
  const recognitionRef = useRef<any>(null);
  const router = useRouter();

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-IN";

    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript.toLowerCase();
      setTranscript(text);
      handleCommand(text);
    };

    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognitionRef.current = recognition;
  }, [onTakeMedication, onOpenAddForm]);

  const handleCommand = (text: string) => {
    if (text.includes("dashboard") || text.includes("home")) {
      setFeedback("Navigating to Dashboard...");
      router.push("/dashboard");
    } else if (text.includes("medication") && !text.includes("add") && !text.includes("guide")) {
      setFeedback("Opening Medications...");
      router.push("/medications");
    } else if (text.includes("map") || text.includes("radar") || text.includes("location")) {
      setFeedback("Opening Tactical Map...");
      router.push("/map");
    } else if (text.includes("scanner") || text.includes("scan") || text.includes("heart rate")) {
      setFeedback("Opening Bio-Scanner...");
      router.push("/scanner");
    } else if (text.includes("sos") || text.includes("emergency") || text.includes("help")) {
      setFeedback("🚨 SOS Activated!");
      router.push("/sos");
    } else if (text.includes("symptom") || text.includes("feeling")) {
      setFeedback("Opening Symptom Checker...");
      router.push("/symptoms");
    } else if (text.includes("breathe") || text.includes("breathing") || text.includes("relax") || text.includes("stress")) {
      setFeedback("🫁 Opening Breathing Exercise...");
      router.push("/breathe");
    } else if (text.includes("tip") || text.includes("health tip") || text.includes("advice")) {
      setFeedback("💡 Opening Health Tips...");
      router.push("/tips");
    } else if (text.includes("guide") || text.includes("flashcard") || text.includes("medication guide") || text.includes("drug")) {
      setFeedback("📚 Opening Medication Guide...");
      router.push("/memory");
    } else if (text.includes("life card") || text.includes("qr") || text.includes("medical id")) {
      setFeedback("🪪 Opening Life Card...");
      router.push("/life-card");
    } else if (text.includes("add") && text.includes("medication")) {
      setFeedback("Opening Add Medication form...");
      onOpenAddForm?.();
    } else if (text.includes("take") && onTakeMedication) {
      const words = text.split("take ")[1] || "";
      setFeedback(`Marking ${words} as taken...`);
      onTakeMedication(words);
    } else {
      setFeedback(`❓ Not recognized: "${text}"`);
    }
    setTimeout(() => setFeedback(""), 3000);
  };

  const toggle = () => {
    if (!recognitionRef.current) {
      setFeedback("Voice not supported in this browser");
      return;
    }
    if (listening) {
      recognitionRef.current.stop();
      setListening(false);
    } else {
      recognitionRef.current.start();
      setListening(true);
      setFeedback('🎤 Listening... Try: "Breathe", "Health tips", "Med guide", "Life card", "SOS"...');
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      {feedback && (
        <div className="bg-[#1a1c1c]/90 text-white text-xs font-bold px-4 py-2 rounded-full backdrop-blur-md max-w-[220px] text-center animate-pulse">
          {feedback}
        </div>
      )}
      <button
        onClick={toggle}
        title="Voice Commands"
        className={`w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all ${
          listening
            ? "bg-[#ff3131] shadow-[0_0_20px_rgba(255,49,49,0.5)] animate-pulse"
            : "bg-[#1a1c1c] hover:bg-[#39ff14] hover:shadow-[0_0_20px_rgba(57,255,20,0.4)]"
        }`}
      >
        {listening
          ? <FaMicrophoneSlash className="text-white text-xl" />
          : <FaMicrophone className="text-[#39ff14] text-xl" />
        }
      </button>
    </div>
  );
}
