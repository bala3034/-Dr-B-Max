"use client";

import React, { useRef, useState, useEffect } from "react";
import { FaAppleAlt, FaCamera, FaUpload, FaSpinner, FaExclamationTriangle } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

export default function FoodScannerPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "success">("idle");
  const [resultText, setResultText] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setIsCameraActive(true);
      setCapturedImage(null);
      setResultText("");
      setStatus("idle");
    } catch (err) {
      console.error("Camera error:", err);
      setErrorMessage("Could not access camera. Please allow permissions.");
      setStatus("error");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const base64Image = canvas.toDataURL("image/jpeg", 0.8);
        setCapturedImage(base64Image);
        stopCamera();
        analyzeImage(base64Image);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setCapturedImage(base64);
        analyzeImage(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async (base64Image: string) => {
    setStatus("loading");
    setErrorMessage("");
    setResultText("");

    try {
      // Remove the data:image/jpeg;base64, prefix for the API
      const base64Data = base64Image.split(",")[1];
      const mimeType = base64Image.split(";")[0].split(":")[1];

      const res = await fetch("/api/vision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64Data, mimeType }),
      });

      const data = await res.json();

      if (data.error) {
        throw new Error(data.error);
      }

      if (data.result.includes("ERROR:")) {
        setStatus("error");
        setErrorMessage("Please upload a proper picture of food.");
      } else {
        setStatus("success");
        setResultText(data.result);
      }
    } catch (err: any) {
      console.error(err);
      setStatus("error");
      setErrorMessage("Failed to analyze image. Please try again.");
    }
  };

  return (
    <main className="min-h-screen bg-[var(--color-medical-bg)] flex flex-col items-center pt-8 pb-16 px-4 font-sans">
      <header className="w-full max-w-4xl flex items-center gap-4 mb-8">
        <div className="w-16 h-16 rounded-2xl bg-orange-100 flex items-center justify-center border-2 border-orange-200 shadow-sm shrink-0">
          <FaAppleAlt className="text-3xl text-orange-500" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">AI Food Scanner</h1>
          <p className="text-slate-500 font-medium">Instantly analyze calories and macros.</p>
        </div>
      </header>

      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-8">
        {/* Left Col: Camera / Upload */}
        <div className="flex flex-col gap-4">
          <div className="glass-panel p-6 w-full rounded-3xl flex flex-col items-center">
            
            <div className="w-full aspect-[4/3] bg-slate-100 rounded-2xl overflow-hidden border-2 border-dashed border-slate-300 relative flex items-center justify-center mb-6">
              {capturedImage ? (
                <img src={capturedImage} alt="Captured food" className="w-full h-full object-cover" />
              ) : isCameraActive ? (
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
              ) : (
                <div className="text-slate-400 flex flex-col items-center gap-2">
                  <FaCamera className="text-4xl" />
                  <span className="font-medium">Camera off</span>
                </div>
              )}
              <canvas ref={canvasRef} className="hidden" />
            </div>

            <div className="flex gap-4 w-full">
              {isCameraActive ? (
                <button
                  onClick={capturePhoto}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
                >
                  <FaCamera /> Capture
                </button>
              ) : (
                <button
                  onClick={startCamera}
                  className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-700 py-3 rounded-xl font-bold transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2"
                >
                  <FaCamera /> Open Camera
                </button>
              )}
              
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-bold transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2 border border-slate-200"
              >
                <FaUpload /> Upload Photo
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                accept="image/*" 
                className="hidden" 
                onChange={handleFileUpload} 
              />
            </div>
          </div>
        </div>

        {/* Right Col: Results */}
        <div className="flex flex-col gap-4">
          <AnimatePresence mode="wait">
            {status === "idle" && (
              <motion.div 
                key="idle"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="glass-panel p-8 w-full rounded-3xl h-full flex flex-col items-center justify-center text-center text-slate-400"
              >
                <FaAppleAlt className="text-6xl mb-4 opacity-30" />
                <p className="text-lg font-medium">Take a photo or upload an image of your meal to get a nutritional breakdown.</p>
              </motion.div>
            )}

            {status === "loading" && (
              <motion.div 
                key="loading"
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                className="glass-panel p-8 w-full rounded-3xl h-full flex flex-col items-center justify-center text-center text-blue-500"
              >
                <FaSpinner className="text-5xl mb-4 animate-spin" />
                <h3 className="text-xl font-bold text-slate-800">Gemini Vision is analyzing...</h3>
                <p className="text-slate-500 font-medium mt-2">Identifying food items and calculating macros.</p>
              </motion.div>
            )}

            {status === "error" && (
              <motion.div 
                key="error"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                className="glass-panel p-8 w-full rounded-3xl h-full flex flex-col items-center justify-center text-center border-red-200 bg-red-50"
              >
                <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mb-6">
                  <FaExclamationTriangle className="text-4xl text-red-500" />
                </div>
                <h3 className="text-2xl font-bold text-red-600 mb-2">Analysis Failed</h3>
                <p className="text-red-500 font-semibold">{errorMessage}</p>
                <button 
                  onClick={() => { setStatus("idle"); setCapturedImage(null); }}
                  className="mt-6 px-6 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors"
                >
                  Try Again
                </button>
              </motion.div>
            )}

            {status === "success" && (
              <motion.div 
                key="success"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="glass-panel p-8 w-full rounded-3xl h-full flex flex-col border-emerald-200 bg-emerald-50/30"
              >
                <h3 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-500">auto_awesome</span> 
                  Nutritional Breakdown
                </h3>
                <div className="prose prose-slate max-w-none text-slate-700 whitespace-pre-wrap font-medium leading-relaxed bg-white/60 p-6 rounded-2xl border border-emerald-100 shadow-inner">
                  {resultText}
                </div>
                <button 
                  onClick={() => { setStatus("idle"); setCapturedImage(null); }}
                  className="mt-6 w-full py-3 bg-white border-2 border-emerald-500 text-emerald-600 rounded-xl font-bold hover:bg-emerald-50 transition-colors"
                >
                  Scan Another Meal
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}
