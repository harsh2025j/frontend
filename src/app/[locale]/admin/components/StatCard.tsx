import { ReactNode } from "react";
import Sparkline from "./charts/Sparkline";

interface StatCardProps {
  icon: ReactNode;
  title: string;
  value: string;
  trend?: string;
  trendUp?: boolean;
  sparklineData?: { value: number }[];
}

const StatCard = ({ icon, title, value, trend, trendUp = true, sparklineData }: StatCardProps) => {
  return (
    <div className="group relative bg-[#0B2149] p-6 rounded-2xl shadow-[0_4px_20px_-4px_rgba(11,33,73,0.4)] hover:shadow-[0_8px_30px_-4px_rgba(11,33,73,0.55)] flex flex-col justify-between transition-all duration-300 ease-out transform hover:-translate-y-1 overflow-hidden cursor-default border border-[#0B2149]/80">

      {/* Gold accent line at top */}
      {/* <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#C9A227] via-[#e8c84a] to-[#C9A227] rounded-t-2xl" /> */}

      {/* Subtle shimmer on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      <div className="flex items-start justify-between mb-4 z-10">
        <div className="p-3 bg-white/10 text-[#C9A227] rounded-xl group-hover:bg-[#C9A227] group-hover:text-[#0B2149] transition-all duration-300 shadow-sm border border-white/10">
          {icon}
        </div>
        {trend && (
          <div className={`px-2.5 py-1 rounded-full text-xs font-bold leading-none tracking-wide flex items-center gap-1 ${trendUp ? 'bg-emerald-400/20 text-emerald-300' : 'bg-rose-400/20 text-rose-300'}`}>
            {trendUp ? '↑' : '↓'} {trend}
          </div>
        )}
      </div>

      <div className="z-10 flex items-end justify-between mt-2">
        <div>
          <h3 className="text-[2rem] font-extrabold text-white tracking-tight leading-none mb-1.5">{value}</h3>
          <p className="text-xs font-semibold text-[#C9A227]/80 tracking-widest uppercase">{title}</p>
        </div>

        {sparklineData && sparklineData.length > 0 && (
          <div className="mb-1 opacity-60 group-hover:opacity-100 transition-opacity">
            <Sparkline data={sparklineData} color={trendUp ? "#34d399" : "#f87171"} />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
