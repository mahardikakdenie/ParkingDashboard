import { MetricCard } from "@/components/MetricCard";
import { RevenueChart } from "@/components/RevenueChart";
import { Car, DollarSign, Clock, AlertTriangle, Building2, Users } from "lucide-react";

// Mock data for Company Partners Stats
const partnerStats = [
  { id: "PTN-01", name: "TechCorp Inc.", vehiclesToday: 45, revenue: "Rp 2,5M", status: "active", trend: "+5%" },
  { id: "PTN-02", name: "Global Logistics", vehiclesToday: 120, revenue: "Rp 8,2M", status: "active", trend: "+12%" },
  { id: "PTN-03", name: "City Mall Center", vehiclesToday: 350, revenue: "Rp 15,1M", status: "active", trend: "-2%" },
  { id: "PTN-04", name: "StartUp Hub", vehiclesToday: 12, revenue: "Rp 450K", status: "warning", trend: "-15%" },
];

export default function Dashboard() {
  return (
    <>
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

      <div className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Building2 className="w-4 h-4 text-slate-400" />
            <h2 className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Company Partners Overview</h2>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span className="text-[10px] font-medium text-slate-500">4 Active Partners</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {partnerStats.map((partner) => (
            <div key={partner.id} className="bg-slate-900 rounded-lg border border-slate-800 p-4 hover:border-slate-700 transition-colors flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-white truncate pr-2">{partner.name}</span>
                <span className={`text-[8px] px-1.5 py-0.5 border rounded uppercase ${partner.status === "active" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border-amber-500/20"}`}>
                  {partner.status}
                </span>
              </div>
              
              <div className="space-y-3 mt-auto">
                <div>
                  <div className="text-[9px] text-slate-500 uppercase tracking-wider mb-1">Vehicles Entered</div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-mono text-slate-200">{partner.vehiclesToday}</span>
                    <Users className="w-3 h-3 text-slate-600" />
                  </div>
                </div>
                
                <div>
                  <div className="text-[9px] text-slate-500 uppercase tracking-wider mb-1">Revenue Generated</div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-mono text-emerald-400">{partner.revenue}</span>
                    <div className={`flex items-center text-[9px] font-medium ${partner.trend.startsWith('+') ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {partner.trend}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

