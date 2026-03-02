"use client";

import { LineChart, Line, ResponsiveContainer } from "recharts";

interface SparklineProps {
    data: { value: number }[];
    color: string;
}

export default function Sparkline({ data, color }: SparklineProps) {
    return (
        <div className="h-10 w-24">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                    <Line
                        type="monotone"
                        dataKey="value"
                        stroke={color}
                        strokeWidth={2}
                        dot={false}
                        isAnimationActive={true}
                        animationDuration={1500}
                        animationEasing="ease-out"
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
