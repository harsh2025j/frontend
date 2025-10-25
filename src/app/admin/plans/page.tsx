"use client";

import { useState } from "react";

type Plan = {
  id: number;
  name: string;
  discount: string;
  price: string;
  status: "Active" | "Paused";
};

export default function PlanTable() {
  const [plans, setPlans] = useState<Plan[]>([
    { id: 1, name: "Free Plan", discount: "0%", price: "00", status: "Active" },
    { id: 2, name: "JURIST PRO", discount: "20% /on yearly plan", price: "199", status: "Active" },
    { id: 3, name: "JUDGMENT ENGINE", discount: "30% /on yearly plan", price: "299", status: "Active" },
    { id: 4, name: "Standard", discount: "10% /on yearly plan", price: "99", status: "Paused" },
  ]);

  const toggleStatus = (id: number) => {
    setPlans((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, status: p.status === "Active" ? "Paused" : "Active" }
          : p
      )
    );
  };

  return (
    <div>

      <h1 className="text-xl  font-poppins mb-6 text-black font-medium"> Premium Plans Management</h1>

      <div className="bg-white p-6 rounded-2xl shadow-sm mt-6">
        <div className="flex bg-gray rounded-xl px-6 py-3  justify-between items-center mb-4">
          <p className="text-sm font-medium">
            Total Active Plans: {plans.filter((p) => p.status === "Active").length}
          </p>
          <input
            type="text"
            placeholder="Search Plan"
            className="px-4 py-2 rounded-md border bg-white border-gray-300 text-sm"
          />
        </div>
        <div className="bg-lightgray p-4 rounded-2xl">
          <table className="w-full  text-sm text-left  overflow-hidden">
            <thead className="">
              <tr>
                <th className="p-3 ">#</th>
                <th className="p-3 ">Plan Name</th>
                <th className="p-3 ">Discounts</th>
                <th className="p-3 ">Price</th>
                <th className="p-3 ">Status</th>
                <th className="p-3 ">Action</th>
              </tr>
            </thead>
            <tbody>
              {plans.map((plan) => (
                <tr key={plan.id} className="border-t-[1.5px] border-gray-400 hover:bg-gray-50">
                  <td className="p-3 ">{plan.id}</td>
                  <td className="p-3  font-semibold">{plan.name}</td>
                  <td className="p-3 ">{plan.discount}</td>
                  <td className="p-3 ">{plan.price}</td>
                  <td className="p-3 ">{plan.status}</td>
                  <td className="p-3  flex gap-2">
                    <button className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-md text-sm">
                      Edit
                    </button>
                    <button
                      onClick={() => toggleStatus(plan.id)}
                      className={`${plan.status === "Active"
                        ? "bg-gray-300 text-gray-700 hover:bg-gray-400"
                        : "bg-green-500 text-white hover:bg-green-600"
                        } px-3 py-1 rounded-md text-sm`}
                    >
                      {plan.status === "Active" ? "Pause" : "Active"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>


      </div>
    </div>
  );
}
