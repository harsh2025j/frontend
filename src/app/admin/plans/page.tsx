"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSubscriptionListActions } from "@/data/features/subscription/useSubscriptionActions";
import { Plans } from "@/data/features/subscription/subscription.types";
import apiClient from "@/data/services/apiConfig/apiClient";
import toast from "react-hot-toast";
import { UserData } from "@/data/features/profile/profile.types";
import { useProfileActions } from "@/data/features/profile/useProfileActions";
import Loader from "@/components/ui/Loader";

export default function PlanTable() {
    const router = useRouter();
    const { user: reduxUser } = useProfileActions();
    const user = reduxUser as UserData;
    const [isAuthorized, setIsAuthorized] = useState(false);
    useEffect(() => {
        // if (loading) return;

        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

        // 1. No Token? -> Go to Login
        if (!token) {
            router.replace("/auth/login");
            return;
        }

        // 2. Role Check
       if (user) {
    if (user.roles?.length) {
        const allowedRoles = ["admin", "superadmin"];
        const hasAccess = user.roles.some((r) => allowedRoles.includes(r.name));
        if (!hasAccess) router.replace("/auth/login");
        else setIsAuthorized(true);
    } else {
        // User exists but has no roles -> Redirect or Deny
        router.replace("/auth/login");
    }
}
    }, [user, router]);


    const [showPopup, setShowPopup] = useState(false);

    const handleActionClick = () => {
        setShowPopup(true);
    };

    const handleAddNewPlan = () => {
        router.push("/admin/plans/add-new-plan");
    };
    const { plans, loading, error, } = useSubscriptionListActions();
    // console.log("hii", plans)
    const [AllPlan, setAllPlans] = useState<Plans[]>([]);


    useEffect(() => {
        setAllPlans(plans);
        // console.log("object");

    }, [])

    const toggleStatus = async (id: string, currentStatus: any) => {
        const newStatus = currentStatus === "active" ? "inactive" : "active";
        setShowPopup(false)


        try {
            await apiClient.post("/subscription/update-status", {
                id: id,
                status: newStatus,
            });


            setAllPlans((prev) =>
                prev.map((p) => (p.id === id ? { ...p, status: newStatus } : p))
            );
        } catch (err) {
            console.error("Failed to update status", err);
            toast.error("Status update failed");
        }
    };
    if (!isAuthorized) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-50">
                <Loader size="lg" text="Checking Permissions..." />
            </div>
        );
    }
    return (
        <div>

            <h1 className="text-xl  font-poppins mb-6 text-black font-medium"> Premium Plans Management</h1>

            <div className="bg-white p-6 rounded-2xl shadow-sm mt-6">
                <div className="flex bg-gray rounded-xl px-6 py-3  justify-between items-center mb-4">
                    <p className="text-sm font-medium">
                        Total Active Plans: {AllPlan.filter((p) => p.status === "active").length}
                    </p>
                    <input
                        type="text"
                        placeholder="Search Plan"
                        className="px-4 py-2 rounded-md border bg-white border-gray-300 text-sm"
                    />
                </div>
                <div className="flex">
                    <button className="bg-yellow-500 p-2 px-6 rounded-xl ml-auto mr-10" onClick={handleAddNewPlan}>
                        Add New Plan
                    </button>
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
                            {plans.map((plan: Plans, index: number) => (
                                <tr key={plan.id} className="border-t-[1.5px] border-gray-400 hover:bg-gray-50">

                                    <td className="p-3 ">{index + 1}</td>
                                    <td className="p-3  font-semibold">{plan.name}</td>
                                    <td className="p-3 ">{plan.discount}</td>
                                    <td className="p-3 ">{plan.price}</td>
                                    <td className="p-3 ">{plan.status}</td>
                                    <td className="p-3  flex gap-2">
                                        <button className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-md text-sm">
                                            Edit
                                        </button>
                                        <button
                                            // onClick={() => toggleStatus(plan._id, plan.status)}
                                            onClick={handleActionClick}
                                            className={`${plan.status === "active"
                                                ? "bg-gray-300 text-gray-700 hover:bg-gray-400"
                                                : "bg-green-500 text-white hover:bg-green-600"
                                                } px-3 py-1 rounded-md text-sm`}
                                        >
                                            {plan.status === "active" ? "Pause" : "Activate"}
                                        </button>

                                        {showPopup && (
                                            <div className="fixed inset-0 bg-black/10 bg-opacity-40 flex items-center justify-center z-50">
                                                <div className="bg-white rounded-xl shadow-lg p-6 w-80">
                                                    <h2 className="text-xl font-semibold mb-3">
                                                        {plan.status === "active" ? "Pause this plan?" : "Activate this plan?"}
                                                    </h2>

                                                    <p className="text-gray-600 mb-6">
                                                        Are you sure you want to continue?
                                                    </p>

                                                    <div className="flex justify-end gap-3">
                                                        {/* Cancel */}
                                                        <button
                                                            onClick={() => setShowPopup(false)}
                                                            className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
                                                        >
                                                            Cancel
                                                        </button>

                                                        {/* Confirm */}
                                                        <button
                                                            onClick={() => toggleStatus(plan.id, plan.status)}
                                                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                                        >
                                                            Confirm
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
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
