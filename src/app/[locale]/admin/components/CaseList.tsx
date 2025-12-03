import { FileText, Calendar } from "lucide-react";

const CaseList = () => {
  const cases = [
    { id: 1, name: "Ravi vs Delhi Police", date: "Oct 20, 2025", status: "Ongoing" },
    { id: 2, name: "Meera vs XYZ Corp", date: "Oct 15, 2025", status: "Closed" },
    { id: 3, name: "Arjun vs RTO", date: "Oct 18, 2025", status: "Hearing Soon" },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border p-4">
      <h3 className="font-semibold mb-3 text-gray-800">Recent Cases</h3>
      <ul className="space-y-3">
        {cases.map((c) => (
          <li key={c.id} className="flex justify-between items-center border-b pb-2 last:border-none">
            <div className="flex items-center gap-3">
              <FileText className="text-primary" size={18} />
              <div>
                <p className="font-medium">{c.name}</p>
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <Calendar size={12} /> {c.date}
                </span>
              </div>
            </div>
            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-md">
              {c.status}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CaseList;
