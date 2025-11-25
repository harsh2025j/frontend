"use client";
import { useCreatePlanActions } from "@/data/features/subscription/useSubscriptionActions";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function AddNewPlan() {
  const featureList = [
    "Daily News Feed",
    "Latest News",
    "Weekly Digest Email",
    "AI Summaries",
    "Ad-Free",
    "Basic Archive",
    "AI Verdict Analysis",
    "AI Recommendation",
    "Multi-User Access",
  ];


  const {
    formData,
    handleAddPlan,
    handleChange,
    loading,
    error,
    message,
    toggleFeature
    } = useCreatePlanActions();
  
  useEffect(() => {
      if (error) toast.error(error);
      if (message) toast.success(message);
    }, [error, message]);

const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  handleAddPlan();
};
  return (
    <div className="max-w-lg mx-auto bg-white p-6 rounded-xl shadow-md mt-6">
      <h2 className="text-xl font-semibold mb-4 ml-auto">Add New Plan</h2>

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Plan Name */}
        <div>
          <label className="block mb-1 font-medium">Plan Name</label>
          <input
            type="text"
            name="name"
            className="w-full border p-2 rounded"
            placeholder="Enter plan name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        {/* Price */}
        <div>
          <label className="block mb-1 font-medium">Price in (₹)/Month</label>
          <input
            type="number"
            name="price"
            className="w-full border p-2 rounded"
            placeholder="Enter price"
            value={formData.price}
            onChange={handleChange}
            required
            min={0}
          />
        </div>

        {/* Discount */}
        <div>
          <label className="block mb-1 font-medium">Discount (%) on yearly plan</label>
          <input
            type="number"
            name="discount"
            className="w-full border p-2 rounded"
            placeholder="eg: 20"
            value={formData.discount}
            onChange={handleChange}
            required
            min={0}
            max={100}
          />
        </div>

        {/* Features */}
        <div>
          <label className="block mb-2 font-medium">Select Features</label>

          <div className="grid grid-cols-1 gap-2">
            {featureList.map((feature) => (
              <label key={feature} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.features.includes(feature)}
                  onChange={() => toggleFeature(feature)}
                  className="w-4 h-4"
                />
                <span>{feature}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full text-white py-2 rounded-lg transition ${
            loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Saving..." : "Save Plan"}
        </button>
      </form>
    </div>
  );
}
