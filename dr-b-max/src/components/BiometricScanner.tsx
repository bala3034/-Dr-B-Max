"use client";

import React, { useEffect, useRef, useState } from "react";
import * as tf from "@tensorflow/tfjs";
import * as blazeface from "@tensorflow-models/blazeface";

interface BiometricScannerProps {
  onVerified: () => void;
  onCancel: () => void;
}

export default function BiometricScanner({ onVerified, onCancel }: BiometricScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState("Initializing Core...");
  
  useEffect(() => {
    let stream: MediaStream | null = null;
    let model: blazeface.BlazeFaceModel | null = null;
    let interval: NodeJS.Timeout;
    let isMounted = true;

    const initCam = async () => {
      try {
        await tf.ready();
        if (!isMounted) return;
        setStatus("Loading Bio-Model...");
        model = await blazeface.load();
        
        if (!isMounted) return;
        setStatus("Accessing Camera...");
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        if (!isMounted) return;
        setStatus("Scanning for Biological Presence...");
        
        interval = setInterval(async () => {
          if (videoRef.current && model && isMounted) {
            try {
              const predictions = await model.estimateFaces(videoRef.current, false);
              if (predictions.length > 0) {
                setStatus("Verified. Access Granted.");
                clearInterval(interval);
                setTimeout(() => {
                   if (isMounted) onVerified();
                }, 1000);
              }
            } catch(e) {}
          }
        }, 500);

      } catch (err) {
        if (isMounted) setStatus("Camera Access Denied or Failed.");
      }
    };

    initCam();

    return () => {
      isMounted = false;
      clearInterval(interval);
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
      }
    };
  }, [onVerified]);

  return (
    <div className="absolute inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-4 rounded-[24px] border-[3px] border-[#39ff14] overflow-hidden">
      <h3 className="text-[#39ff14] font-black text-xl mb-4 tracking-tighter">BIOMETRIC SECURITY</h3>
      <div className="relative w-full max-w-[180px] aspect-square rounded-full overflow-hidden border-4 border-dashed border-[#b4cbce] animate-[spin_10s_linear_infinite]">
        <div className="w-full h-full animate-[spin_10s_linear_infinite_reverse]">
           <video 
             ref={videoRef} 
             autoPlay 
             playsInline 
             muted 
             className="w-full h-full object-cover scale-x-[-1]" 
           />
        </div>
        <div className="absolute inset-0 bg-[#39ff14]/20 mix-blend-overlay pointer-events-none" />
      </div>
      <p className="text-white mt-6 font-mono font-bold animate-pulse text-center text-sm">{status}</p>
      
      <button 
        onClick={onCancel}
        className="mt-6 px-6 py-2 border border-[#ff3131] text-[#ff3131] font-bold uppercase tracking-widest text-xs rounded-full hover:bg-[#ff3131] hover:text-white transition"
      >
        Cancel Verification
      </button>
    </div>
  );
}
