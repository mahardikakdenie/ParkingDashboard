"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { format } from "date-fns";
import { Video, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface CameraStreamProps {
  id: string;
  name: string;
  location: string;
  status: "online" | "offline" | "recording";
  imageUrl: string;
}

export function CameraStream({ id, name, location, status, imageUrl }: CameraStreamProps) {
  const [time, setTime] = useState(new Date());
  
  // Simulate frame updates every second by updating the timestamp overlay
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="group relative bg-[#1E293B] rounded-lg overflow-hidden border border-slate-700 shadow-sm aspect-video flex flex-col">
      {/* simulated camera frame */}
      <div className="relative flex-1 bg-slate-900 w-full overflow-hidden">
        {status !== "offline" ? (
          <>
            <Image 
              src={imageUrl} 
              alt={name}
              fill
              className="object-cover opacity-80 mix-blend-luminosity hover:mix-blend-normal transition-all duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none" />
            
            {/* OSD (On-Screen Display) overlays */}
            <div className="absolute top-2 left-2 text-white font-mono text-[9px] sm:text-[10px]">
              <div className="flex items-center gap-1.5 drop-shadow-md">
                <Video className="w-3 h-3 text-blue-400" />
                <span>{name} / {id}</span>
              </div>
            </div>
            
            <div className="absolute top-2 right-2 flex items-center space-x-1.5">
              <span className={cn(
                "flex h-1.5 w-1.5 rounded-full",
                status === "recording" ? "bg-red-500 animate-pulse" : "bg-emerald-500"
              )} />
              <span className="text-[9px] font-mono text-white drop-shadow-md uppercase tracking-wider">
                {status === "recording" ? "REC" : "LIVE"}
              </span>
            </div>

            <div className="absolute bottom-2 right-2 text-white font-mono text-[9px] drop-shadow-md">
               {format(time, "yyyy-MM-dd HH:mm:ss")}
            </div>
            
            <div className="absolute bottom-2 left-2 text-white font-mono text-[9px] drop-shadow-md">
              ZOOM: 1.0x / IR: ON
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-600">
            <AlertCircle className="w-6 h-6 mb-1 opacity-50" />
            <span className="text-[10px] font-mono tracking-widest uppercase font-bold">SIGNAL LOST</span>
          </div>
        )}
      </div>

      <div className="p-2 bg-slate-900 flex justify-between items-center border-t border-slate-800">
         <div>
            <h4 className="text-[10px] text-slate-300 font-bold uppercase">{name}</h4>
            <p className="text-[9px] text-slate-500 italic mt-0.5">{location}</p>
         </div>
         <button className="text-[9px] bg-slate-800 hover:bg-slate-700 text-slate-400 border border-slate-700 px-2 py-1 rounded font-bold uppercase tracking-widest transition-colors">
            Snapshot
         </button>
      </div>
    </div>
  );
}
