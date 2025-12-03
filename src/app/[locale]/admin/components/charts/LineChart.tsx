"use client";

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

const data = [
    { name: "Jan", value: 4000 },
    { name: "Feb", value: 3200 },
    { name: "Mar", value: 5000 },
    { name: "Apr", value: 4780 },
    { name: "May", value: 5890 },
    { name: "Jun", value: 4390 },
    { name: "Jul", value: 6490 },
];

export default function DummyChart() {
    return (
        <div className="lg:col-span-2 bg-white p-6 rounded-xl  border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
                AI Summary Generation Trand       </h3>

            <ResponsiveContainer width="100%" height={280}>
                <LineChart data={data}>
                    <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#1A73E8" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#1A73E8" stopOpacity={0} />
                        </linearGradient>
                    </defs>

                    <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                    <XAxis
                        dataKey="name"
                        stroke="#9CA3AF"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={10}
                    />
                    <YAxis
                        stroke="#9CA3AF"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={10}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: "white",
                            borderRadius: "8px",
                            border: "1px solid #E5E7EB",
                            boxShadow: "0 4px 8px rgba(0,0,0,0.05)",
                        }}
                        labelStyle={{ color: "#6B7280", fontWeight: 500 }}
                    />
                    <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#1A73E8"
                        strokeWidth={3}
                        dot={{ r: 4, strokeWidth: 2, fill: "#fff" }}
                        activeDot={{ r: 7, stroke: "#1A73E8", fill: "#1A73E8" }}
                        fillOpacity={1}
                        fill="url(#colorValue)"
                        animationDuration={1200}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
