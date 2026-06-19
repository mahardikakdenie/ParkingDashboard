import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  icon: ReactNode;
}

export function MetricCard({ title, value, change, isPositive, icon }: MetricCardProps) {
  return (
    <div className="bg-[#1E293B] rounded-lg border border-slate-700 p-4 shadow-sm flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{title}</h3>
        <div className="text-blue-400">
          {icon}
        </div>
      </div>
      <div className="flex items-end justify-between mt-auto">
        <div className="text-3xl font-light text-white">{value}</div>
        <div className={cn("text-xs mb-1 font-mono tracking-tighter flex items-center", isPositive ? "text-emerald-400" : "text-rose-400")}>
          {isPositive ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
          {change}
        </div>
      </div>
    </div>
  );
}
