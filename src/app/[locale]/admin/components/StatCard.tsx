import { ReactNode } from "react";
import Sparkline from "./charts/Sparkline";

export type StatCardColor = "blue" | "emerald" | "amber" | "violet" | "indigo" | "rose" | "sky" | "slate";

interface StatCardProps {
  icon: ReactNode;
  title: string;
  value: string | number;
  trend?: string | null;
  trendUp?: boolean;
  sparklineData?: { value: number }[];
  color?: StatCardColor;
}

const colorStyles: Record<StatCardColor, { iconBg: string; hoverBorder: string; hoverShadow: string }> = {
  blue: {
    iconBg: "bg-blue-50 text-blue-600 border border-blue-100/80",
    hoverBorder: "hover:border-blue-400",
    hoverShadow: "hover:shadow-blue-500/10",
  },
  emerald: {
    iconBg: "bg-emerald-50 text-emerald-600 border border-emerald-100/80",
    hoverBorder: "hover:border-emerald-400",
    hoverShadow: "hover:shadow-emerald-500/10",
  },
  amber: {
    iconBg: "bg-amber-50 text-amber-600 border border-amber-100/80",
    hoverBorder: "hover:border-amber-400",
    hoverShadow: "hover:shadow-amber-500/10",
  },
  violet: {
    iconBg: "bg-violet-50 text-violet-600 border border-violet-100/80",
    hoverBorder: "hover:border-violet-400",
    hoverShadow: "hover:shadow-violet-500/10",
  },
  indigo: {
    iconBg: "bg-indigo-50 text-indigo-600 border border-indigo-100/80",
    hoverBorder: "hover:border-indigo-400",
    hoverShadow: "hover:shadow-indigo-500/10",
  },
  rose: {
    iconBg: "bg-rose-50 text-rose-600 border border-rose-100/80",
    hoverBorder: "hover:border-rose-400",
    hoverShadow: "hover:shadow-rose-500/10",
  },
  sky: {
    iconBg: "bg-sky-50 text-sky-600 border border-sky-100/80",
    hoverBorder: "hover:border-sky-400",
    hoverShadow: "hover:shadow-sky-500/10",
  },
  slate: {
    iconBg: "bg-slate-100 text-slate-700 border border-slate-200/80",
    hoverBorder: "hover:border-slate-400",
    hoverShadow: "hover:shadow-slate-500/10",
  },
};

const StatCard = ({
  icon,
  title,
  value,
  trend,
  trendUp = true,
  sparklineData,
  color = "blue",
}: StatCardProps) => {
  const isFetching = value === "Fetching...";
  const isTextValue =
    !isFetching && typeof value === "string" && isNaN(Number(value.replace(/,/g, "")));
  const palette = colorStyles[color] || colorStyles.blue;

  return (
    <div
      className={`relative bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-sm ${palette.hoverBorder} ${palette.hoverShadow} hover:shadow-md transition-all duration-200 overflow-hidden cursor-inherit h-[152px] min-h-[152px] max-h-[152px] flex flex-col justify-between`}
    >
      {/* Top Section: Icon badge & Trend */}
      <div className="flex items-start justify-between z-10">
        <div
          className={`p-2.5 rounded-xl shadow-sm flex items-center justify-center ${palette.iconBg}`}
        >
          {icon}
        </div>

        {trend && (
          <div
            className={`px-2 py-0.5 rounded-full text-xs font-semibold leading-none tracking-wide flex items-center gap-1 border ${
              trendUp
                ? "bg-emerald-50 text-emerald-700 border-emerald-200/80"
                : "bg-rose-50 text-rose-700 border-rose-200/80"
            }`}
          >
            <span>{trendUp ? "↑" : "↓"}</span>
            <span>{trend}</span>
          </div>
        )}
      </div>

      {/* Bottom Section: Metric Value & Label */}
      <div className="z-10 flex items-end justify-between gap-2 mt-auto">
        <div className="min-w-0 flex-1">
          {/* Strictly locked height (h-11 = 44px) so massive text and large numbers share identical vertical rhythm */}
          <div className="h-11 flex items-center min-w-0">
            {isFetching ? (
              <span className="text-sm font-medium text-slate-400 animate-pulse">
                Fetching...
              </span>
            ) : isTextValue ? (
              <span
                className="text-xs sm:text-sm font-bold text-slate-900 leading-snug line-clamp-2 break-words max-w-full"
                title={String(value)}
              >
                {value}
              </span>
            ) : (
              <h3 className="text-2xl sm:text-[1.85rem] font-extrabold text-slate-900 tracking-tight leading-none">
                {value}
              </h3>
            )}
          </div>
          <p className="text-[11px] font-semibold text-slate-500 tracking-wider uppercase mt-1 truncate">
            {title}
          </p>
        </div>

        {sparklineData && sparklineData.length > 0 && (
          <div className="mb-0.5 opacity-70 flex-shrink-0">
            <Sparkline
              data={sparklineData}
              color={trendUp ? "#10b981" : "#f43f5e"}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
