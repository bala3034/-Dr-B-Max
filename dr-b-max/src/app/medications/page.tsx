"use client";

import React, { useEffect, useState, useRef } from "react";
import { format, differenceInDays, startOfDay } from "date-fns";
import db, { removeMockData, Medication } from "@/db/indexedDB";
import MedicationCard from "@/components/MedicationCard";
import LiquidProgressBar from "@/components/LiquidProgressBar";
import CalendarPanel from "@/components/CalendarPanel";

import { motion, AnimatePresence } from "framer-motion";
import { FaPlus, FaBell, FaTimes, FaPlusCircle, FaFilePdf } from "react-icons/fa";
import { generateHealthReport } from "@/lib/generateReport";
import VoiceCommands from "@/components/VoiceCommands";
import { registerAlarmWorker, scheduleAlarmsInSW, requestNotificationPermission, listenForSWMessages } from "@/lib/serviceWorker";
import "@/lib/i18n";
import { useTranslation } from "react-i18next";


export default function Dashboard() {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [takenIds, setTakenIds] = useState<Set<number>>(new Set());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDosage, setNewDosage] = useState("");
  const [newInstructions, setNewInstructions] = useState("");
  const [newDuration, setNewDuration] = useState<number>(3);
  const [newTimes, setNewTimes] = useState<string[]>(["08:00"]);
  const [newInventory, setNewInventory] = useState<number>(30);
  const [newContactNumber, setNewContactNumber] = useState("");
  
  const [notifiedSet, setNotifiedSet] = useState<Set<number>>(new Set());
  const [realTime, setRealTime] = useState("");
  const { t } = useTranslation();

  const audioContextRef = useRef<AudioContext | null>(null);

  // Register service worker + notification permission
  useEffect(() => {
    requestNotificationPermission();
    registerAlarmWorker().then(() => {
      listenForSWMessages((data) => {
        if (data.type === "MARK_TAKEN" && data.id) {
          handleTakeMedication(data.id);
        }
      });
    });
  }, []);

  const initDb = async () => {
    await removeMockData();
    const allMeds = await db.medications.toArray();
    
    // Auto-Expire Exceeded Medications relative to actual real-world today
    const realToday = startOfDay(new Date());
    const visualDay = startOfDay(selectedDate);
    const validMeds: Medication[] = [];

    for (const med of allMeds) {
      if (med.startDate && med.durationDays) {
        const medStart = startOfDay(new Date(med.startDate));
        const diffReal = differenceInDays(realToday, medStart);
        // Expiration Logic: if you take it for 3 days starting today (0, 1, 2). diff=3 means day 4.
        if (diffReal >= med.durationDays) {
          await db.medications.delete(med.id);
          continue;
        }

        // Display Logic: Only push if visualDay is within [startDate, startDate + durationDays)
        const diffVisual = differenceInDays(visualDay, medStart);
        if (diffVisual >= 0 && diffVisual < med.durationDays) {
          validMeds.push(med);
        }
      } else {
        // Legacy fallback
        validMeds.push(med);
      }
    }
    
    validMeds.sort((a, b) => a.time.localeCompare(b.time));
    setMedications([...validMeds]);
    // Schedule alarms in service worker
    scheduleAlarmsInSW(validMeds.map(m => ({ id: m.id, name: m.name, dosage: m.dosage, time: m.time })));

    
    const targetStr = format(selectedDate, "yyyy-MM-dd");
    const targetLogs = await db.logs.where("date").equals(targetStr).toArray();
    const taken = new Set(targetLogs.map(l => l.medicationId));
    setTakenIds(taken);
  };

  // Fetch specific date data whenever selectedDate changes
  useEffect(() => {
    initDb();
  }, [selectedDate]); // WARNING: Do NOT add medications here, it will infinite loop in React!

  // Alarm & Real-time interval engine
  useEffect(() => {
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }

    const interval = setInterval(() => {
      const now = new Date();
      const currentHHMM = format(now, "HH:mm");
      setRealTime(format(now, "h:mm:ss a")); 
      
      medications.forEach(med => {
        if (takenIds.has(med.id)) return;

        const [medHour, medMin] = med.time.split(':').map(Number);
        const pillDate = startOfDay(new Date());
        pillDate.setHours(medHour, medMin, 0, 0);
        
        const diffMins = (now.getTime() - pillDate.getTime()) / 60000;

        // Initial 5-min pre-alarm window or exact time
        if (diffMins >= -5 && diffMins <= 5) {
          if (!notifiedSet.has(med.id)) {
            triggerAlarm(med);
            setNotifiedSet(prev => new Set(prev).add(med.id));
          }
        }
        
        // Automated Snooze (Nag every 10 mins up to 60)
        if (diffMins > 5 && diffMins <= 60 && Math.floor(diffMins) % 10 === 0) {
          const snoozeKey = med.id + (Math.floor(diffMins) * 1000);
          if (!notifiedSet.has(snoozeKey)) {
            triggerAlarm(med); 
            setNotifiedSet(prev => new Set(prev).add(snoozeKey));
          }
        }

        // SMS Escalation at 61 mins past
        if (diffMins > 60) {
          const smsKey = med.id + 999999; 
          if (!notifiedSet.has(smsKey)) {
            if (med.contactNumber) {
              const msg = `URGENT: Dr. B-Max Missed Dose Alert! ${med.name} was not taken.`;
              window.open(`sms:${med.contactNumber}?body=${encodeURIComponent(msg)}`, '_blank');
            }
            setNotifiedSet(prev => new Set(prev).add(smsKey));
          }
        }
      });
    }, 1000); 

    return () => clearInterval(interval);
  }, [medications, takenIds, notifiedSet]);

  const triggerAlarm = (med: Medication) => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("Dr. B-MAX Care Alert", {
        body: `Vital Schedule! Time to take ${med.dosage} of ${med.name}!`,
        icon: "/favicon.ico"
      });
    }

    try {
      const Ctx = window.AudioContext || (window as any).webkitAudioContext;
      if (Ctx && !audioContextRef.current) {
        audioContextRef.current = new Ctx();
      }
      if (audioContextRef.current) {
        const osc = audioContextRef.current.createOscillator();
        const gain = audioContextRef.current.createGain();
        osc.frequency.setValueAtTime(800, audioContextRef.current.currentTime);
        osc.frequency.setValueAtTime(1200, audioContextRef.current.currentTime + 0.2); 
        
        gain.gain.setValueAtTime(0.5, audioContextRef.current.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + 0.5);
        
        osc.connect(gain);
        gain.connect(audioContextRef.current.destination);
        osc.start();
        osc.stop(audioContextRef.current.currentTime + 0.5);
      }
    } catch (err) {}
  };

  const handleTakeMedication = async (id: number) => {
    setTakenIds(prev => new Set(prev).add(id));
    try {
      const med = await db.medications.get(id);
      if (med) {
        await db.medications.update(id, { inventory: Math.max(0, med.inventory - 1) });
      }
      await db.logs.add({
        medicationId: id,
        date: format(selectedDate, "yyyy-MM-dd"),
        status: "Taken",
        timestamp: Date.now()
      });
      initDb();
    } catch (e) {}
  };

  const handleAddMedication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || newTimes.length === 0) return;

    try {
      const todayStr = format(new Date(), "yyyy-MM-dd");
      
      // Execute Multi-Alarm Injection
      const additions = newTimes.map(t => ({
        name: newName,
        dosage: newDosage || "As directed",
        time: t,
        instructions: newInstructions,
        startDate: todayStr,
        durationDays: newDuration,
        inventory: newInventory,
        contactNumber: newContactNumber
      }));
      
      await db.medications.bulkAdd(additions);
      
      // Reset Modal
      setNewName("");
      setNewDosage("");
      setNewTimes(["08:00"]);
      setNewInstructions("");
      setNewDuration(3);
      setNewInventory(30);
      setNewContactNumber("");
      setShowAddForm(false);
      initDb();
    } catch(err) {
      console.error("Failed to inject", err);
    }
  };

  const handleTimeChange = (index: number, val: string) => {
    const arr = [...newTimes];
    arr[index] = val;
    setNewTimes(arr);
  };
  const addTimeField = () => setNewTimes([...newTimes, ""]);
  const removeTimeField = (idx: number) => setNewTimes(newTimes.filter((_, i) => i !== idx));

  const calculatedProgress = medications.length > 0 ? (takenIds.size / medications.length) * 100 : 0;
  const progress = Math.min(100, calculatedProgress);
  
  const currentHour = new Date().getHours();
  const currentMinute = new Date().getMinutes();

  return (
    <div className="flex w-full min-h-screen bg-[var(--color-medical-bg)] overflow-hidden">
      <motion.main 
        initial={{ x: "100%", opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: "100%", opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="flex-1 p-4 md:p-8 flex items-center justify-center font-sans relative min-h-screen"
      >
      
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-white rounded-full blur-[100px] opacity-40 pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[40vw] h-[40vw] bg-[#b4cbce] rounded-full blur-[100px] opacity-30 pointer-events-none" />

      <div className="w-full max-w-6xl z-10 glass-panel border border-white/40 p-4 md:p-10 shadow-2xl relative">
        <header className="flex flex-col md:flex-row items-center justify-between mb-12 w-full gap-8">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full border-4 border-[#39ff14] overflow-hidden shadow-[0_0_20px_rgba(57,255,20,0.4)] hidden md:block shrink-0">
               <img src="/anime_mascot.png" alt="Companion" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-[#1a1c1c]">
                Hello, Bala
              </h1>
              <p className="text-xl text-[#424849] mt-2 font-medium">Care Status: <span className={progress >= 100 ? "text-[#39ff14] font-bold" : "text-blue-600 font-bold"}>{progress >= 100 ? "Optimal" : "Pending"}</span></p>
              <p className="text-sm font-bold text-[#424849] mt-2 bg-white/50 px-3 py-1 rounded-full w-fit">
                LIVE SYSTEM TIME: {realTime || "Loading..."}
              </p>
            </div>
          </div>
          <LiquidProgressBar progress={progress} />
        </header>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 relative">
          <div className="md:col-span-3">
            <CalendarPanel selectedDate={selectedDate} onSelectDate={setSelectedDate} />
          </div>

          <div className="md:col-span-9 flex flex-col items-center md:items-start w-full relative">
            <div className="w-full border-b border-[#424849]/20 pb-4 mb-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-[#1a1c1c]">
                {format(selectedDate, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd") ? t("todayPrescriptions") : `${format(selectedDate, "MMMM do")} Prescriptions`}
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => generateHealthReport("Bala")}
                  className="bg-white border border-[#b4cbce] text-[#424849] px-4 py-2 rounded-full font-bold flex items-center gap-2 hover:bg-[#1a1c1c] hover:text-white transition-colors shadow-sm"
                >
                  <FaFilePdf className="text-[#ff3131]" /> {t("exportPdf")}
                </button>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="bg-[#1a1c1c] text-white px-4 py-2 rounded-full font-bold flex items-center gap-2 hover:bg-[#39ff14] hover:text-[#1a1c1c] transition-colors shadow-md"
                >
                  <FaPlus /> {t("addPill")}
                </button>
              </div>
            </div>
            
            <AnimatePresence>
              {showAddForm && (
                <motion.div 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute top-16 left-0 w-full md:w-3/4 bg-white shadow-[0_10px_40px_rgba(0,0,0,0.15)] rounded-[24px] z-50 p-6 border border-[#b4cbce]/40 max-h-[80vh] overflow-y-auto"
                >
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-[#1a1c1c]">New Structural Prescription</h3>
                    <button onClick={() => setShowAddForm(false)} className="text-[#424849] hover:text-[#ff3131] transition-colors">
                      <FaTimes size={24} />
                    </button>
                  </div>
                  
                  <form onSubmit={handleAddMedication} className="flex flex-col gap-6">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="w-full">
                           <label className="block text-xs font-bold text-[#424849] mb-1 uppercase">Pill Name</label>
                           <input 
                             type="text" required placeholder="e.g., Vitamin C"
                             value={newName} onChange={(e) => setNewName(e.target.value)}
                             className="w-full p-4 rounded-[16px] bg-[#f0f4f5] border-2 border-transparent focus:border-[#39ff14] outline-none font-medium"
                           />
                        </div>
                        <div className="w-full">
                           <label className="block text-xs font-bold text-[#424849] mb-1 uppercase">Dosage</label>
                           <input 
                             type="text" placeholder="e.g., 500mg"
                             value={newDosage} onChange={(e) => setNewDosage(e.target.value)}
                             className="w-full p-4 rounded-[16px] bg-[#f0f4f5] border-2 border-transparent focus:border-[#39ff14] outline-none font-medium"
                           />
                        </div>
                     </div>
                     
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#f0f4f5]/50 p-4 rounded-[16px]">
                       <div className="w-full">
                         <label className="block text-sm font-bold text-[#1a1c1c] mb-2 uppercase tracking-wide">Number of Days</label>
                         <input 
                            type="number" required min="1" max="365"
                            value={newDuration} onChange={(e) => setNewDuration(Number(e.target.value))}
                            className="w-full p-4 rounded-[16px] bg-white border-2 border-transparent focus:border-[#39ff14] outline-none font-bold text-xl text-[#39ff14]"
                          />
                          <p className="text-xs text-gray-500 mt-1">App will auto-delete this alarm after {newDuration} days.</p>
                       </div>
                       
                       <div className="w-full">
                         <label className="block text-sm font-bold text-[#1a1c1c] mb-2 uppercase tracking-wide">Extra Instructions</label>
                         <input 
                            type="text" placeholder="e.g., Take after breakfast"
                            value={newInstructions} onChange={(e) => setNewInstructions(e.target.value)}
                            className="w-full p-4 rounded-[16px] bg-white border-2 border-transparent focus:border-[#39ff14] outline-none font-medium text-[#1a1c1c]"
                          />
                       </div>
                     </div>
                     
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#f0f4f5]/50 p-4 rounded-[16px]">
                       <div className="w-full">
                         <label className="block text-sm font-bold text-[#1a1c1c] mb-2 uppercase tracking-wide">Total Pills Inventory</label>
                         <input 
                            type="number" required min="1"
                            value={newInventory} onChange={(e) => setNewInventory(Number(e.target.value))}
                            className="w-full p-4 rounded-[16px] bg-white border-2 border-transparent focus:border-[#39ff14] outline-none font-bold text-xl text-[#39ff14]"
                          />
                       </div>
                       
                       <div className="w-full">
                         <label className="block text-sm font-bold text-[#1a1c1c] mb-2 uppercase tracking-wide">SMS Emergency Contact (optional)</label>
                         <input 
                            type="tel" placeholder="+1234567890"
                            value={newContactNumber} onChange={(e) => setNewContactNumber(e.target.value)}
                            className="w-full p-4 rounded-[16px] bg-white border-2 border-transparent focus:border-[#ff3131] outline-none font-medium text-[#1a1c1c]"
                          />
                       </div>
                     </div>
                     
                     <div className="w-full border-t border-gray-200 pt-4">
                       <label className="block text-sm font-bold text-[#1a1c1c] mb-4 uppercase tracking-wide">Multi-Alarm Timings</label>
                       
                       <div className="flex flex-col gap-3">
                         {newTimes.map((timeVal, idx) => (
                           <div key={idx} className="flex gap-4 items-center">
                             <input 
                                type="time" required
                                value={timeVal} onChange={(e) => handleTimeChange(idx, e.target.value)}
                                className="flex-1 p-4 rounded-[16px] bg-[#f0f4f5] border-2 border-transparent focus:border-[#39ff14] outline-none font-bold justify-center items-center text-xl text-[#1a1c1c]"
                              />
                              {idx > 0 && (
                                <button type="button" onClick={() => removeTimeField(idx)} className="h-14 w-14 flex items-center justify-center bg-[#ff3131]/10 text-[#ff3131] rounded-full border border-[#ff3131] hover:bg-[#ff3131] hover:text-white transition">
                                  <FaTimes />
                                </button>
                              )}
                           </div>
                         ))}
                         
                         <button type="button" onClick={addTimeField} className="flex items-center gap-2 mt-2 text-[#424849] font-bold hover:text-[#39ff14] transition w-fit px-4 py-2 rounded-full border-2 border-[#b4cbce]">
                           <FaPlusCircle /> Add Another Time (e.g. Night)
                         </button>
                       </div>
                     </div>
                     
                     <button type="submit" className="w-full bg-[#39ff14] text-[#1a1c1c] font-black py-4 rounded-[16px] mt-4 shadow-[0_0_15px_rgba(57,255,20,0.4)] flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform">
                       <FaBell size={20} /> SYNCHRONIZE OFFLINE ALARMS
                     </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="w-full flex-1 flex flex-col relative min-h-[400px]">
              <AnimatePresence>
                {medications.map(med => {
                  const isTaken = takenIds.has(med.id);
                  const [medHour, medMin] = med.time.split(':').map(Number);
                  
                  const isToday = format(selectedDate, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
                  const isDueSoon = isToday && medHour <= currentHour + 1;
                  
                  // Card is locked if viewed in the future, past, or if today and current time is before the pill time
                  let isBeforeTime = !isToday;
                  if (isToday) {
                    isBeforeTime = currentHour < medHour || (currentHour === medHour && currentMinute < medMin);
                  }

                  return (
                    <motion.div
                      key={med.id}
                      layout
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    >
                      <MedicationCard
                        medication={med}
                        onTake={handleTakeMedication}
                        isDueSoon={isDueSoon}
                        isTaken={isTaken}
                        isBeforeTime={isBeforeTime}
                      />
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {takenIds.size === medications.length && medications.length > 0 && (
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="w-full mt-6 bg-[#39ff14]/10 p-6 flex flex-col items-center justify-center rounded-[24px] border-2 border-[#39ff14]"
                >
                  <h3 className="text-2xl font-extrabold text-[#1a1c1c] mb-1">👍 All Clear!</h3>
                  <p className="text-md font-bold text-[#424849]">Dr. B-MAX says your vitals are safe.</p>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
      </motion.main>
      <VoiceCommands
        onOpenAddForm={() => setShowAddForm(true)}
        onTakeMedication={(name) => {
          const med = medications.find(m => m.name.toLowerCase().includes(name.toLowerCase()));
          if (med) handleTakeMedication(med.id);
        }}
      />
    </div>
  );
}
