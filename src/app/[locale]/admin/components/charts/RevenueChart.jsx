"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const data = [
  { name: "Settled", value: 70 },
  { name: "Pending", value: 30 },
];

const COLORS = ["#1A73E8", "#EF4444"]; // blue, red

export default function RevenueChart() {
  return (
    <div className="bg-white p-6 rounded-xl  border border-gray-100 flex flex-col">
      {/* Heading */}
      <h3 className="text-lg font-semibold text-gray-800 mb-4 text-left">
        Total Revenue
      </h3>

      {/* Pie Chart */}
      <div className="relative w-60 h-60 mx-auto">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              innerRadius={90}
              outerRadius={100}
              paddingAngle={3}
              dataKey="value"
              startAngle={90}
              endAngle={-270}
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-gray-900">10,50,256</span>
        </div>
      </div>

     <div className="flex gap-6 mt-4 text-sm justify-start">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#1A73E8]" />
          <span className="text-gray-700">Settled</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#EF4444]" />
          <span className="text-gray-700">Pending</span>
        </div>
      </div>
    </div>
  );
}
