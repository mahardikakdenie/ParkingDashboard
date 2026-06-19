"use client";

import { useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { time: "06:00", revenue: 120000 },
  { time: "08:00", revenue: 450000 },
  { time: "10:00", revenue: 850000 },
  { time: "12:00", revenue: 1200000 },
  { time: "14:00", revenue: 1100000 },
  { time: "16:00", revenue: 1500000 },
  { time: "18:00", revenue: 2100000 },
  { time: "20:00", revenue: 1600000 },
  { time: "22:00", revenue: 800000 },
];

const currencyFormatter = (value: number) => 
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumSignificantDigits: 3 }).format(value);

export function RevenueChart() {
  return (
    <div className="bg-[#1E293B] p-4 rounded-lg border border-slate-700 shadow-sm col-span-full xl:col-span-2 flex flex-col">
      <div className="mb-4">
        <h2 className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Today's Revenue Analytics</h2>
        <p className="text-[10px] text-slate-500 italic mt-1 pb-1">Real-time revenue accumulation across all zones.</p>
      </div>
      <div className="flex-1 w-full min-h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 30, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
            <YAxis 
              stroke="#64748b" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false} 
              tickFormatter={(val) => `Rp ${(val / 1000).toFixed(0)}k`} 
            />
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
            <Tooltip 
              formatter={(value: any) => [currencyFormatter(Number(value) || 0), "Revenue"]}
              contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '4px', fontSize: '10px', color: '#f8fafc' }}
              itemStyle={{ color: '#3b82f6' }}
            />
            <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
