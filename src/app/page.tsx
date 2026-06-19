import { Sidebar } from "@/components/Sidebar";
import { TopNav } from "@/components/TopNav";
import { MetricCard } from "@/components/MetricCard";
import { RevenueChart } from "@/components/RevenueChart";
import { CameraStream } from "@/components/CameraStream";
import { Car, DollarSign, Clock, AlertTriangle } from "lucide-react";

// Standardizing nice parking-related unsplash images
const cctvCameras = [
  { id: "CAM-01", name: "Main Entrance", location: "Gate A", status: "recording" as const, imageUrl: "https://images.unsplash.com/photo-1590674899484-d5640e854abe?q=80&w=2067&auto=format&fit=crop" },
  { id: "CAM-02", name: "Exit Ramp", location: "Gate B", status: "online" as const, imageUrl: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=1974&auto=format&fit=crop" },
  { id: "CAM-03", name: "Zone C Basement", location: "Level B1", status: "recording" as const, imageUrl: "https://images.unsplash.com/photo-1621503437508-3ab9eb329aee?q=80&w=2070&auto=format&fit=crop" },
  { id: "CAM-04", name: "VIP Parking", location: "Zone A", status: "offline" as const, imageUrl: "" },
];

export default function Dashboard() {
  return (
    <div className="flex h-screen bg-[#0F172A] text-slate-200 font-sans overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        <TopNav />
        
        <main className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-sm font-bold text-white tracking-tight uppercase">Real-Time Operations</h1>
              <p className="text-[10px] text-slate-500 mt-0.5">Live overview of parking slots, revenue, and security feeds.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard 
              title="Available Slots" 
              value="142" 
              change="+12% vs last hr" 
              isPositive={true} 
              icon={<Car className="w-4 h-4" />} 
            />
            <MetricCard 
               title="Occupancy Rate" 
               value="85%" 
               change="-2% vs yesterday" 
               isPositive={false} 
               icon={<AlertTriangle className="w-4 h-4" />} 
            />
            <MetricCard 
               title="Avg. Duration" 
               value="2h 15m" 
               change="Stable" 
               isPositive={true} 
               icon={<Clock className="w-4 h-4" />} 
            />
            <MetricCard 
               title="Today's Revenue" 
               value="Rp 12,4M" 
               change="+18% vs yesterday" 
               isPositive={true} 
               icon={<DollarSign className="w-4 h-4" />} 
            />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <RevenueChart />

            <div className="bg-[#1E293B] rounded-lg border border-slate-700 p-4 col-span-1 xl:col-span-1 flex flex-col">
               <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center justify-between mb-4">
                  Real-time Recap
                  <span className="px-1.5 py-0.5 bg-red-500/20 text-red-500 text-[8px] rounded uppercase">Live</span>
               </h3>
               
               <div className="space-y-2 flex-1 overflow-y-auto pr-1">
                  {[
                     { plate: "B 1234 XYZ", time: "2 min ago", type: "Entry", gate: "South Gate" },
                     { plate: "D 9912 AB", time: "5 min ago", type: "Exit", gate: "North Gate" },
                     { plate: "L 777 QR", time: "12 min ago", type: "Entry", gate: "Main Gate" },
                     { plate: "B 1010 CD", time: "15 min ago", type: "Exit", gate: "VIP Gate" },
                     { plate: "F 4321 AA", time: "22 min ago", type: "Entry", gate: "East Gate"},
                  ].map((log, i) => (
                     <div key={i} className="group relative bg-slate-900 rounded overflow-hidden border border-slate-800 p-2 flex items-center justify-between hover:border-slate-700 transition-colors">
                        <div>
                           <div className="text-[10px] text-white font-mono uppercase">{log.plate}</div>
                           <div className="text-[8px] text-slate-500 mt-0.5">{log.gate} • {log.time}</div>
                        </div>
                        <div className={`text-[9px] px-2 py-0.5 border rounded ${log.type === "Entry" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-rose-500/10 text-rose-400 border-rose-500/20"}`}>
                           {log.type}
                        </div>
                     </div>
                  ))}
               </div>
               
               <button className="w-full py-2 mt-4 bg-slate-800 hover:bg-slate-700 text-slate-400 text-[10px] uppercase font-bold tracking-widest rounded border border-slate-700 transition-colors">
                  View Full Logs
               </button>
            </div>
          </div>

          <div className="mt-2">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Live CCTV Feeds</h2>
              <div className="flex items-center space-x-1.5">
                <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-medium text-slate-500">3 Online, 1 Offline</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {cctvCameras.map((cam) => (
                <CameraStream key={cam.id} {...cam} />
              ))}
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
