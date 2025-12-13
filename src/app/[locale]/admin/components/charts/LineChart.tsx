import { useState, useMemo, useRef } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { ChevronDown } from "lucide-react";

// Helper to generating years (e.g., current year - 5 to current year)
const currentYear = new Date().getFullYear();
const years = Array.from({ length: 6 }, (_, i) => currentYear - i);

const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

interface CustomSelectProps {
    value: number;
    options: { label: string; value: number }[];
    onChange: (value: number) => void;
}

const CustomSelect = ({ value, options, onChange }: CustomSelectProps) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleSelect = (val: number) => {
        onChange(val);
        setIsOpen(false);
    };

    const currentLabel = options.find((o) => o.value === value)?.label;

    return (
        <div
            className="relative"
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
        >
            <button
                // Combine click toggle with focus behavior
                onClick={() => setIsOpen(!isOpen)}
                // onBlur handles closing when tabbing away or clicking outside if the container doesn't capture it
                // We use a small timeout to allow option clicks to register before closing
                onBlur={() => setTimeout(() => setIsOpen(false), 200)}
                className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A73E8] bg-white flex items-center gap-2 min-w-[100px] justify-between"
            >
                <span>{currentLabel}</span>
                <ChevronDown size={14} className="text-gray-500" />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0  w-full min-w-[120px] bg-white border border-gray-200 rounded-md shadow-lg z-10 max-h-60 overflow-y-auto">
                    {options.map((option) => (
                        <div
                            key={option.value}
                            onClick={() => handleSelect(option.value)}
                            className={`px-3 py-1 text-sm cursor-pointer hover:bg-gray-50 flex items-center justify-between ${option.value === value ? "bg-blue-50 text-[#1A73E8] font-medium" : "text-gray-700"
                                }`}
                        >
                            {option.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default function DummyChart({ articles = [] }: { articles: any[] }) {
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const scrollRef = useRef<HTMLDivElement>(null);

    const chartData = useMemo(() => {
        // ... (logic remains same)
        const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
        const stats: Record<number, number> = {};
        for (let i = 1; i <= daysInMonth; i++) {
            stats[i] = 0;
        }
        articles.forEach((article) => {
            if (!article.createdAt) return;
            const date = new Date(article.createdAt);
            if (date.getMonth() === selectedMonth && date.getFullYear() === selectedYear) {
                const day = date.getDate();
                stats[day] = (stats[day] || 0) + 1;
            }
        });
        return Object.keys(stats).map((day) => ({
            name: `${day}`,
            value: stats[parseInt(day)],
            fullDate: `${months[selectedMonth]} ${day}, ${selectedYear}`
        }));
    }, [articles, selectedMonth, selectedYear]);

    return (
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                <h3 className="text-lg font-semibold text-gray-800">
                    Article Creation Trend
                </h3>
                <div className="flex gap-2 z-20">
                    <CustomSelect
                        value={selectedMonth}
                        onChange={setSelectedMonth}
                        options={months.map((m, i) => ({ label: m, value: i }))}
                    />
                    <CustomSelect
                        value={selectedYear}
                        onChange={setSelectedYear}
                        options={years.map((y) => ({ label: y.toString(), value: y }))}
                    />
                </div>
            </div>

            <div
                ref={scrollRef}
                className="overflow-x-auto pb-2 outline-none"
                tabIndex={0}
                onMouseEnter={() => {
                    // Prevent jumping if focus causes scroll, though unlikely with simple focus()
                    scrollRef.current?.focus({ preventScroll: true });
                }}
            >
                <div className="min-w-[800px] h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
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
                                interval={0}
                            />
                            <YAxis
                                stroke="#9CA3AF"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={10}
                                allowDecimals={false}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "white",
                                    borderRadius: "8px",
                                    border: "1px solid #E5E7EB",
                                    boxShadow: "0 4px 8px rgba(0,0,0,0.05)",
                                }}
                                labelStyle={{ color: "#6B7280", fontWeight: 500 }}
                                labelFormatter={(label, payload) => {
                                    if (payload && payload.length > 0 && payload[0].payload) {
                                        return payload[0].payload.fullDate;
                                    }
                                    return label;
                                }}
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
            </div>
        </div>
    );
}
