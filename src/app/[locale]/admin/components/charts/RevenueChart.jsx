"use client";

import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import apiClient from "@/data/services/apiConfig/apiClient";

const COLORS = ["#0B2149", "#C9A227"]; // Navy Blue = Settled, Gold = Pending

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function formatCurrency(amount, currency = "INR") {
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
  return `₹${Math.round(amount)}`;
}

export default function RevenueChart() {
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRevenue = async () => {
      setLoading(true);
      try {
        const res = await apiClient.get(
          `/subscriptions/internal/revenue?month=${selectedMonth}&year=${selectedYear}`
        );
        const raw = res.data?.data || res.data;
        setStats(raw);
      } catch (e) {
        console.error("Failed to fetch revenue stats", e);
        setStats(null);
      } finally {
        setLoading(false);
      }
    };
    fetchRevenue();
  }, [selectedMonth, selectedYear]);

  const pieData =
    stats && stats.totalAmount > 0
      ? [
        { name: "Settled", value: stats.settledPercent },
        { name: "Pending", value: stats.pendingPercent },
      ]
      : [
        { name: "Settled", value: 0 },
        { name: "Pending", value: 100 },
      ];

  const totalLabel = stats
    ? stats.totalAmount > 0
      ? formatCurrency(stats.totalAmount)
      : "₹0"
    : "—";

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col hover:shadow-lg transition-shadow duration-300">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-gray-900 tracking-tight">
          Revenue Overview
        </h3>
        <div className="flex gap-2">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="text-xs border border-gray-200 rounded-md px-2 py-1 text-gray-600 bg-gray-50 focus:outline-none"
          >
            {MONTH_NAMES.map((m, i) => (
              <option key={i + 1} value={i + 1}>{m}</option>
            ))}
          </select>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="text-xs border border-gray-200 rounded-md px-2 py-1 text-gray-600 bg-gray-50 focus:outline-none"
          >
            {Array.from({ length: 4 }, (_, i) => now.getFullYear() - i).map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Pie Chart */}
      <div className="relative w-full h-56 mx-auto my-auto">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
            Loading...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: "none",
                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                }}
                itemStyle={{ fontWeight: 600 }}
                formatter={(value, name) => [
                  name === "Settled"
                    ? formatCurrency(stats?.settledAmount || 0)
                    : formatCurrency(stats?.pendingAmount || 0),
                  name,
                ]}
              />
              <Pie
                data={pieData}
                innerRadius={72}
                outerRadius={96}
                paddingAngle={pieData[0].value > 0 ? 5 : 0}
                dataKey="value"
                startAngle={90}
                endAngle={-270}
                stroke="none"
                cornerRadius={8}
              >
                {pieData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        )}

        {/* Centre label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-bold text-gray-900">{loading ? "—" : totalLabel}</span>
          <span className="text-xs text-gray-500 uppercase tracking-widest mt-1">Total</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-8 mt-4 text-sm">
        {[
          { name: "Settled", amount: stats?.settledAmount, pct: stats?.settledPercent },
          { name: "Pending", amount: stats?.pendingAmount, pct: stats?.pendingPercent },
        ].map((entry, index) => (
          <div key={entry.name} className="flex flex-col items-center gap-1 group">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: COLORS[index] }} />
              <span className="text-gray-600 font-medium group-hover:text-gray-900 transition-colors">
                {entry.name}
              </span>
            </div>
            <span className="text-base font-bold text-gray-900">
              {loading ? "—" : entry.amount != null ? formatCurrency(entry.amount) : "₹0"}
            </span>
            <span className="text-xs text-gray-400">
              {loading ? "" : `${entry.pct ?? 0}%`}
            </span>
          </div>
        ))}
      </div>

      {stats && stats.totalAmount === 0 && !loading && (
        <p className="text-center text-xs text-gray-400 mt-3">
          No subscription revenue recorded this month
        </p>
      )}
    </div>
  );
}
