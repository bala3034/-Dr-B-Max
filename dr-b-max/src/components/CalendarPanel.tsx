"use client";

import React from "react";
import { format, addDays, subDays, isSameDay } from "date-fns";

interface CalendarPanelProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

export default function CalendarPanel({ selectedDate, onSelectDate }: CalendarPanelProps) {
  const today = new Date();
  
  // Create an array of 7 days around today
  const days = Array.from({ length: 7 }).map((_, i) => {
    return addDays(subDays(today, 3), i);
  });

  return (
    <div className="w-full glass-panel p-6 flex flex-col justify-center">
      <h2 className="text-2xl font-bold mb-6 text-[#1a1c1c]">Schedule</h2>
      
      <div className="flex w-full overflow-x-auto pb-4 gap-4 md:flex-col md:overflow-visible">
        {days.map((date, idx) => {
          const isSelected = isSameDay(date, selectedDate);
          const isTodayFlag = isSameDay(date, today);

          return (
            <div 
              key={date.toISOString()}
              onClick={() => onSelectDate(date)}
              className={`flex-shrink-0 flex md:flex-row flex-col items-center justify-center p-4 rounded-[24px] cursor-pointer transition-all ${
                isSelected 
                  ? "bg-[#1a1c1c] text-white shadow-lg scale-105 border-2 border-[#39ff14]" 
                  : "bg-white/50 text-[#424849] hover:bg-white/80"
              }`}
            >
              <div className={`text-xs uppercase font-bold tracking-wider md:mr-4 md:w-12 text-center ${isTodayFlag ? 'text-[#39ff14]' : ''}`}>
                {format(date, "EEE")}
              </div>
              <div className={`text-2xl font-bold ${isSelected ? "text-[#39ff14]" : (isTodayFlag ? 'text-[#39ff14]' : '')}`}>
                {format(date, "d")}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
