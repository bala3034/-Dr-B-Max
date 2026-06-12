"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaMicrophone, FaStop, FaLanguage, FaBrain, FaFileMedical, FaArrowLeft } from "react-icons/fa";
import Link from "next/link";
import TextToSpeech from "@/components/TextToSpeech";

export default function TranslatorPage() {
  const [inputText, setInputText] = useState("");
  const [simplifiedText, setSimplifiedText] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        setSpeechSupported(true);
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        
        recognitionRef.current.onresult = (event: any) => {
          let currentTranscript = "";
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              setInputText((prev) => prev + transcript + " ");
            } else {
              currentTranscript += transcript;
            }
          }
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error("Speech recognition error", event.error);
          setIsListening(false);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    }
  }, []);

  const toggleListening = () => {
    if (!speechSupported) return;
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setInputText(""); // Optional: clear before new recording
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const translateMedicalText = async () => {
    if (!inputText.trim()) return;
    setIsTranslating(true);
    setSimplifiedText(null);

    try {
      const prompt = `You are an expert medical translator for laypeople. Translate the following complex medical jargon or clinical note into plain, easy-to-understand English. Break it down into bullet points if necessary. Emphasize any actionable takeaways. Here is the text: \n\n${inputText}`;
      
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });

      if (res.ok) {
        const data = await res.json();
        setSimplifiedText(data.result);
      } else {
        setSimplifiedText("Failed to translate. Please try again.");
      }
    } catch (error) {
      setSimplifiedText("An error occurred while connecting to the AI brain.");
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <main className="min-h-screen bg-[var(--color-medical-bg)] p-4 md:p-8 font-sans">
      <div className="max-w-3xl mx-auto">
        
        {/* Header */}
        <header className="flex items-center gap-4 mb-8">
          <Link href="/" className="w-10 h-10 rounded-full bg-white/50 flex items-center justify-center text-[#1a1c1c] hover:bg-white transition-colors">
            <FaArrowLeft />
          </Link>
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#1a1c1c] to-[#424849] flex items-center justify-center shadow-lg">
            <FaLanguage className="text-[#39ff14] text-2xl" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-[#1a1c1c] tracking-tight">AI Medical Translator</h1>
            <p className="text-[#424849] font-medium">Jargon to plain English instantly</p>
          </div>
        </header>

        {/* Input Section */}
        <div className="glass-panel border border-white/40 p-6 rounded-[24px] shadow-sm mb-6 relative overflow-hidden">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-[#1a1c1c] flex items-center gap-2">
              <FaFileMedical className="text-[#424849]" /> 
              Paste Clinical Notes or Speak
            </h2>
            {speechSupported && (
              <button 
                onClick={toggleListening}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm transition-all ${
                  isListening 
                    ? "bg-[#ff3131] text-white shadow-[0_0_15px_rgba(255,49,49,0.4)] animate-pulse" 
                    : "bg-[#1a1c1c] text-white hover:bg-[#424849]"
                }`}
              >
                {isListening ? <><FaStop /> Listening...</> : <><FaMicrophone /> Voice Input</>}
              </button>
            )}
          </div>

          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="e.g., 'Patient presents with acute idiopathic thrombocytopenic purpura...' or click the microphone to speak."
            className="w-full h-40 p-4 rounded-[16px] bg-white/80 border-2 border-transparent focus:border-[#39ff14] outline-none resize-none font-medium text-[#1a1c1c] shadow-inner"
          />

          <button 
            onClick={translateMedicalText}
            disabled={!inputText.trim() || isTranslating}
            className="w-full mt-4 py-4 bg-[#39ff14] text-[#1a1c1c] font-black text-lg rounded-[16px] flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(57,255,20,0.5)] transition-all disabled:opacity-50"
          >
            {isTranslating ? (
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                <FaBrain />
              </motion.div>
            ) : <FaLanguage />}
            {isTranslating ? "Translating..." : "Translate to Plain English"}
          </button>
        </div>

        {/* Output Section */}
        <AnimatePresence>
          {simplifiedText && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="glass-panel border-2 border-[#39ff14] p-6 rounded-[24px] shadow-lg relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-[#39ff14] rounded-full blur-[100px] opacity-20 pointer-events-none" />
              
              <div className="flex justify-between items-start mb-6">
                <h2 className="font-black text-[#1a1c1c] text-xl flex items-center gap-2">
                  <FaBrain className="text-[#39ff14]" /> 
                  Plain English Summary
                </h2>
                <TextToSpeech text={simplifiedText} label="Read Aloud" />
              </div>

              <div className="prose prose-sm max-w-none text-[#1a1c1c] font-medium leading-relaxed whitespace-pre-wrap">
                {simplifiedText}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </main>
  );
}
