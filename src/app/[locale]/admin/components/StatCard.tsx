import { ReactNode } from "react";

interface StatCardProps {
  icon: ReactNode;
  title: string;
  value: string;
}

const StatCard = ({ icon, title, value }: StatCardProps) => {
  return (
    <div className="bg-[#0A2342] p-4 rounded-2xl shadow-sm border flex items-center justify-between">
      <div>
        <h3 className="text-2xl font-semibold text-white">{value}</h3>
        <p className="text-sm text-gray-500">{title}sdf</p>
      </div>
      <div className="text-primary bg-white rounded-full p-4">{icon}</div>
    </div>
  );
};

export default StatCard;
