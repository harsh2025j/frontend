"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { usePlanActions } from "@/data/features/plan/usePlanActions";
import { Plan } from "@/data/features/plan/plan.types";
import { Trash2, Edit, Plus, Search } from "lucide-react";
import Loader from "@/components/ui/Loader";
import AddEditPlanModal from "./PlanModal";

export default function PlansManagement() {
    const router = useRouter();
    const { plans, loading, deletePlan } = usePlanActions();
    const [searchQuery, setSearchQuery] = useState("");
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
    const [showPlanModal, setShowPlanModal] = useState(false);
    const [editingPlan, setEditingPlan] = useState<Plan | null>(null);

    const filteredPlans = plans.filter((plan: Plan) =>
        plan.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleDelete = async () => {
        if (selectedPlan) {
            await deletePlan(selectedPlan.id);
            setShowDeleteModal(false);
            setSelectedPlan(null);
        }
    };

    const handleEdit = (plan: Plan) => {
        setEditingPlan(plan);
        setShowPlanModal(true);
    };

    const handleAddNew = () => {
        setEditingPlan(null);
        setShowPlanModal(true);
    };

    const handleCloseModal = () => {
        setShowPlanModal(false);
        setEditingPlan(null);
    };

    if (loading && plans.length === 0) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Loader text="Loading Plans..." size="lg" />
            </div>
        );
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6 text-[#0A2342]">Premium Plans Management</h1>

            <div className="bg-white p-6 rounded-xl border border-gray-200">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="font-semibold text-[#0A2342]">Total Plans:</span>
                        <span className="bg-[#0A2342] text-white px-3 py-1 rounded-full text-xs font-bold">
                            {plans.length}
                        </span>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                        <div className="relative flex-1 sm:flex-initial">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search plans..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#C9A227] focus:border-transparent outline-none"
                            />
                        </div>
                        <button
                            onClick={handleAddNew}
                            className="flex items-center justify-center gap-2 bg-[#C9A227] hover:bg-[#b8921f] text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Add New Plan
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="text-left p-4 font-semibold text-[#0A2342]">#</th>
                                <th className="text-left p-4 font-semibold text-[#0A2342]">Plan Name</th>
                                <th className="text-left p-4 font-semibold text-[#0A2342]">Description</th>
                                <th className="text-left p-4 font-semibold text-[#0A2342]">Price</th>
                                <th className="text-left p-4 font-semibold text-[#0A2342]">Features</th>
                                <th className="text-center p-4 font-semibold text-[#0A2342]">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPlans.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center p-8 text-gray-500">
                                        No plans found
                                    </td>
                                </tr>
                            ) : (
                                filteredPlans.map((plan: Plan, index: number) => (
                                    <tr key={plan.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                        <td className="p-4 text-gray-600">{index + 1}</td>
                                        <td className="p-4 font-semibold text-[#0A2342]">{plan.name}</td>
                                        <td className="p-4 text-gray-600 max-w-xs truncate">{plan.description}</td>
                                        <td className="p-4 font-semibold text-[#0A2342]">
                                            {plan.currency} {plan.price.toLocaleString()}
                                        </td>
                                        <td className="p-4">
                                            <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                                                {plan.features.length} features
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => handleEdit(plan)}
                                                    className="p-2 text-[#0A2342] hover:bg-[#0A2342] hover:text-white rounded-lg transition-all"
                                                    title="Edit Plan"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setSelectedPlan(plan);
                                                        setShowDeleteModal(true);
                                                    }}
                                                    className="p-2 text-red-600 hover:bg-red-600 hover:text-white rounded-lg transition-all"
                                                    title="Delete Plan"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold text-[#0A2342] mb-3">Delete Plan</h2>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete <span className="font-semibold">{selectedPlan?.name}</span>? This action cannot be undone.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setSelectedPlan(null);
                                }}
                                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-semibold transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add/Edit Plan Modal */}
            {showPlanModal && (
                <AddEditPlanModal
                    plan={editingPlan}
                    onClose={handleCloseModal}
                />
            )}
        </div>
    );
}
