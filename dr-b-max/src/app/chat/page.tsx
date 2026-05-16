"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { FaArrowLeft, FaPaperPlane } from "react-icons/fa";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hello! I am Dr. B-MAX, your offline inflatable healthcare companion. Are you satisfied with your care today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const newMessages = [...messages, { role: 'user' as const, content: input }];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      // Mock fetch to local Ollama API
      // Since Ollama might not be running on the user's machine during dev,
      // we'll simulate the offline fetch with a timeout for now if fetch fails.
      const res = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama3', // or another local model
          prompt: input,
          stream: false
        })
      });

      if (res.ok) {
        const data = await res.json();
        setMessages([...newMessages, { role: 'assistant', content: data.response }]);
      } else {
        throw new Error("Ollama not reachable");
      }
    } catch (e) {
      // Fallback if local LLM is not running
      setTimeout(() => {
        setMessages([...newMessages, { 
          role: 'assistant', 
          content: 'Local AI engine (Ollama) is currently unreachable. Please ensure it is running locally for full offline intelligence. But remember, I am always here to help!' 
        }]);
        setIsLoading(false);
      }, 1000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[var(--color-medical-bg)] p-4 flex flex-col font-sans relative overflow-hidden">
      {/* Decorative Blur Orbs */}
      <div className="absolute top-0 right-0 w-[50vw] h-[50vw] bg-white rounded-full blur-[100px] opacity-40 pointer-events-none" />
      
      <div className="flex-1 w-full max-w-4xl mx-auto z-10 glass-panel border border-white/40 flex flex-col shadow-2xl relative overflow-hidden md:mt-8 md:mb-8 rounded-[24px]">
        {/* Header */}
        <header className="p-6 border-b border-[#424849]/20 flex items-center bg-white/50 backdrop-blur-md">
          <Link href="/" className="mr-4 text-[#424849] hover:text-[#1a1c1c] transition-colors">
            <FaArrowLeft className="text-xl" />
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full border-2 border-[#39ff14] bg-[#b4cbce] flex items-center justify-center font-bold text-white text-[10px] leading-tight">
              Dr.<br/>B-MAX
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#1a1c1c]">Dr. B-MAX</h1>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#39ff14] shadow-[0_0_8px_rgba(57,255,20,0.8)]" />
                <span className="text-sm text-[#424849] font-medium tracking-wide">100% Offline Core Active</span>
              </div>
            </div>
          </div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-6">
          {messages.map((msg, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={i} 
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`p-4 rounded-[24px] max-w-[80%] ${
                msg.role === 'user' 
                  ? 'bg-[#1a1c1c] text-white shadow-lg' 
                  : 'glass-panel bg-white/80 text-[#1a1c1c]'
              }`}>
                {msg.content}
              </div>
            </motion.div>
          ))}
          {isLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
              <div className="p-4 rounded-[24px] glass-panel bg-white/80 text-[#1a1c1c] flex gap-2 items-center">
                <span className="w-2 h-2 bg-[#b4cbce] rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-[#b4cbce] rounded-full animate-bounce delay-100" />
                <span className="w-2 h-2 bg-[#b4cbce] rounded-full animate-bounce delay-200" />
              </div>
            </motion.div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input Area */}
        <div className="p-6 bg-white/50 backdrop-blur-md border-t border-[#424849]/20">
          <div className="relative flex items-center">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="How are you feeling today?"
              className="w-full pl-6 pr-14 py-4 rounded-[24px] bg-white/80 border border-white focus:outline-none focus:border-[#39ff14] shadow-inner text-[#1a1c1c] placeholder:text-[#b4cbce] focus:shadow-[0_0_15px_rgba(57,255,20,0.2)] transition-all"
            />
            <button 
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="absolute right-2 top-2 bottom-2 aspect-square rounded-full bg-[#1a1c1c] text-white flex items-center justify-center hover:bg-[#424849] transition-colors disabled:opacity-50"
            >
              <FaPaperPlane />
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
