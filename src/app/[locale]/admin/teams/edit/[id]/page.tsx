"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Loader from "@/components/ui/Loader";
import { useAppDispatch, useAppSelector } from "@/data/redux/hooks";
import { fetchUserById, assignUserRoles, updateUserAccessControl } from "@/data/features/users/usersThunks";
import { fetchOffices } from "@/data/features/offices/officesThunks";
import { fetchPracticeAreas } from "@/data/features/practiceAreas/practiceAreasThunks";
import { rolesApi } from "@/data/services/roles-service/roles-service";
import { permissionsApi } from "@/data/services/permissions-service/permissions-service";
import { useDocTitle } from "@/hooks/useDocTitle";
import { ArrowLeft, Save, CheckCircle, Building2, Scale, Shield, Calendar, Users } from "lucide-react";
import { Toaster, toast } from "react-hot-toast";


type RoleOption = {
    _id?: string;
    id?: string;
    name: string;
};

type PermissionOption = {
    _id?: string;
    id?: string;
    name: string;
};

const EditTeamMemberPage: React.FC = () => {
    useDocTitle("Edit User Profile | Sajjad Husain Law Associates");
    const dispatch = useAppDispatch();
    const router = useRouter();
    const params = useParams();
    const userId = params.id as string;

    const { users, loading: usersLoading } = useAppSelector((state) => state.users);
    const { offices } = useAppSelector((state) => state.offices);
    const { practiceAreas } = useAppSelector((state) => state.practiceAreas);

    // Local state for options
    const [availableRoles, setAvailableRoles] = useState<RoleOption[]>([]);
    const [availablePermissions, setAvailablePermissions] = useState<PermissionOption[]>([]);

    // Selection state
    const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

    // Law Firm Access Control state
    const [selectedOfficeId, setSelectedOfficeId] = useState<string>("");
    const [selectedPracticeAreaIds, setSelectedPracticeAreaIds] = useState<string[]>([]);
    const [selectedClearanceLevel, setSelectedClearanceLevel] = useState<number>(2);
    const [accessEndDate, setAccessEndDate] = useState<string>("");
    const [reportingTo, setReportingTo] = useState<string>("");
    const [conflictList, setConflictList] = useState<string>("");

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loadingConfig, setLoadingConfig] = useState(true);

    // Find user from redux to display info
    const user = users.find((u) => u._id === userId);

    // Available managers (all users except current user)
    const availableManagers = users.filter(u => u._id !== userId && u.isActive);

    useEffect(() => {
        const init = async () => {
            try {
                setLoadingConfig(true);
                // 1. Fetch User if not found or ensure fresh data
                if (!user) {
                    await dispatch(fetchUserById(userId)).unwrap();
                }

                // 2. Fetch Roles, Permissions, Offices, and Practice Areas
                const [rolesRes, permsRes] = await Promise.all([
                    rolesApi.fetchRoles(),
                    permissionsApi.fetchPermissions(),
                    dispatch(fetchOffices()),
                    dispatch(fetchPracticeAreas()),
                ]);

                // Normalize data
                const rolesData = rolesRes.data?.data || rolesRes.data || [];
                const permsData = permsRes.data?.data || permsRes.data || [];

                setAvailableRoles(rolesData as RoleOption[]);
                setAvailablePermissions(permsData as PermissionOption[]);

            } catch (error) {
                console.error("Failed to load init data", error);
                toast.error("Failed to load initial data");
            } finally {
                setLoadingConfig(false);
            }
        };

        if (userId) {
            init();
        }
    }, [dispatch, userId]);

    // Set initial selections when user is loaded
    useEffect(() => {
        if (user) {
            // Map user roles/permissions to IDs
            const userRoleIds = user.roles?.map((r: any) => r._id || r.id || r) || [];
            const userPermIds = user.permissions?.map((p: any) => p._id || p.id || p) || [];

            setSelectedRoles(userRoleIds as string[]);
            setSelectedPermissions(userPermIds as string[]);

            // Set law firm access control values
            setSelectedOfficeId(user.officeId || "");
            setSelectedPracticeAreaIds(user.practiceAreaIds || []);
            setSelectedClearanceLevel(user.clearanceLevel || 2);
            setAccessEndDate(user.accessEndDate ? user.accessEndDate.split('T')[0] : "");
            setReportingTo(user.reportingTo || "");
            setConflictList(user.conflictList?.join(", ") || "");
        }
    }, [user]);


    const handleRoleToggle = (roleId: string) => {
        setSelectedRoles(prev =>
            prev.includes(roleId)
                ? prev.filter(id => id !== roleId)
                : [...prev, roleId]
        );
    };

    const handlePermissionToggle = (permId: string) => {
        setSelectedPermissions(prev =>
            prev.includes(permId)
                ? prev.filter(id => id !== permId)
                : [...prev, permId]
        );
    };

    const handlePracticeAreaToggle = (areaId: string) => {
        setSelectedPracticeAreaIds(prev =>
            prev.includes(areaId)
                ? prev.filter(id => id !== areaId)
                : [...prev, areaId]
        );
    };

    const handleSubmit = async () => {
        if (!userId) return;
        try {
            setIsSubmitting(true);

            // Update roles and permissions
            await dispatch(assignUserRoles({
                userId,
                roleIds: selectedRoles,
                permissionIds: selectedPermissions
            })).unwrap();

            // Update access control
            await dispatch(updateUserAccessControl({
                userId,
                officeId: selectedOfficeId || null,
                practiceAreaIds: selectedPracticeAreaIds,
                clearanceLevel: selectedClearanceLevel,
                accessEndDate: accessEndDate || null,
                reportingTo: reportingTo || null,
                conflictList: conflictList ? conflictList.split(",").map(s => s.trim()).filter(Boolean) : [],
            })).unwrap();

            toast.success("User updated successfully!");
            // Redirect back
            setTimeout(() => router.back(), 1500);
        } catch (error: any) {
            toast.error(error || "Failed to update user");
        } finally {
            setIsSubmitting(false);
        }
    };


    if (usersLoading || loadingConfig) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-50">
                <Loader size="lg" text="Loading User Data..." />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-gray-50 text-gray-500">
                <p className="mb-4">User not found</p>
                <button onClick={() => router.back()} className="text-blue-600 hover:underline">
                    Go Back
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6 pb-24">
            <Toaster position="top-right" />
            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.back()}
                            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                        >
                            <ArrowLeft size={24} className="text-gray-600" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Edit User Profile</h1>
                            <p className="text-gray-500 text-sm">Update roles, permissions, and access control for {user.name}</p>
                        </div>
                    </div>
                </div>

                {/* User Info Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                    <div className="flex items-start gap-4">
                        <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xl font-bold">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">{user.name}</h2>
                            <p className="text-gray-500">{user.email}</p>
                            <div className="flex items-center gap-2 mt-2">
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${user.isActive ? 'bg-green-50 text-green-700 border-green-100' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                                    {user.isActive ? 'Active' : 'Inactive'}
                                </span>
                                {user.isVerified && (
                                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100 flex items-center gap-1">
                                        <CheckCircle size={10} /> Verified
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Roles & Permissions Section */}
                <div className="mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Shield size={20} className="text-blue-600" />
                        Roles & Permissions
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Roles Selection */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h3 className="text-base font-semibold text-gray-900 mb-4 border-b pb-2">Roles</h3>
                            <div className="space-y-3 max-h-80 overflow-y-auto">
                                {availableRoles.length === 0 ? (
                                    <p className="text-gray-400 text-sm italic">No roles available.</p>
                                ) : (
                                    availableRoles.map(role => {
                                        const rId = role._id || role.id!;
                                        const isSelected = selectedRoles.includes(rId);
                                        return (
                                            <label
                                                key={rId}
                                                className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${isSelected
                                                    ? 'border-blue-500 bg-blue-50'
                                                    : 'border-gray-200 hover:bg-gray-50'
                                                    }`}
                                            >
                                                <span className="font-medium text-gray-700">{role.name}</span>
                                                <input
                                                    type="checkbox"
                                                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                                                    checked={isSelected}
                                                    onChange={() => handleRoleToggle(rId)}
                                                />
                                            </label>
                                        );
                                    })
                                )}
                            </div>
                        </div>

                        {/* Permissions Selection */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h3 className="text-base font-semibold text-gray-900 mb-4 border-b pb-2">Extra Permissions</h3>
                            <div className="space-y-3 max-h-80 overflow-y-auto">
                                {availablePermissions.length === 0 ? (
                                    <p className="text-gray-400 text-sm italic">No permissions available.</p>
                                ) : (
                                    availablePermissions.map(perm => {
                                        const pId = perm._id || perm.id!;
                                        const isSelected = selectedPermissions.includes(pId);
                                        return (
                                            <label
                                                key={pId}
                                                className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${isSelected
                                                    ? 'border-purple-500 bg-purple-50'
                                                    : 'border-gray-200 hover:bg-gray-50'
                                                    }`}
                                            >
                                                <span className="font-medium text-gray-700">{perm.name}</span>
                                                <input
                                                    type="checkbox"
                                                    className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                                                    checked={isSelected}
                                                    onChange={() => handlePermissionToggle(pId)}
                                                />
                                            </label>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Law Firm Access Control Section */}
                <div className="mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Building2 size={20} className="text-purple-600" />
                        Law Firm Access Control
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Office Selection */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h3 className="text-base font-semibold text-gray-900 mb-4 border-b pb-2 flex items-center gap-2">
                                <Building2 size={16} className="text-blue-600" />
                                Office Assignment
                            </h3>
                            <select
                                value={selectedOfficeId}
                                onChange={(e) => setSelectedOfficeId(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                            >
                                <option value="">No Office Assigned</option>
                                {offices.filter(o => o.isActive).map((office) => (
                                    <option key={office.id} value={office.id}>
                                        {office.name} ({office.code})
                                    </option>
                                ))}
                            </select>
                            <p className="text-xs text-gray-500 mt-2">Assign user to a specific office/branch</p>
                        </div>

                        {/* Clearance Level */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h3 className="text-base font-semibold text-gray-900 mb-4 border-b pb-2 flex items-center gap-2">
                                <Shield size={16} className="text-orange-600" />
                                Clearance Level
                            </h3>
                            <div className="space-y-2">
                                {[
                                    { level: 1, label: "Level 1 - Public", color: "gray" },
                                    { level: 2, label: "Level 2 - Internal", color: "blue" },
                                    { level: 3, label: "Level 3 - Confidential", color: "yellow" },
                                    { level: 4, label: "Level 4 - Restricted", color: "orange" },
                                    { level: 5, label: "Level 5 - Highly Sensitive", color: "red" },
                                ].map(({ level, label, color }) => (
                                    <label
                                        key={level}
                                        className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer transition-all ${selectedClearanceLevel === level
                                            ? `border-${color}-500 bg-${color}-50`
                                            : 'border-gray-200 hover:bg-gray-50'
                                            }`}
                                    >
                                        <span className="text-sm font-medium text-gray-700">{label}</span>
                                        <input
                                            type="radio"
                                            name="clearanceLevel"
                                            value={level}
                                            checked={selectedClearanceLevel === level}
                                            onChange={(e) => setSelectedClearanceLevel(parseInt(e.target.value))}
                                            className="w-4 h-4"
                                        />
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Practice Areas */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:col-span-2">
                            <h3 className="text-base font-semibold text-gray-900 mb-4 border-b pb-2 flex items-center gap-2">
                                <Scale size={16} className="text-purple-600" />
                                Practice Areas
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-64 overflow-y-auto">
                                {practiceAreas.filter(pa => pa.isActive).length === 0 ? (
                                    <p className="text-gray-400 text-sm italic col-span-full">No practice areas available.</p>
                                ) : (
                                    practiceAreas.filter(pa => pa.isActive).map(area => {
                                        const isSelected = selectedPracticeAreaIds.includes(area.id);
                                        return (
                                            <label
                                                key={area.id}
                                                className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${isSelected
                                                    ? 'border-purple-500 bg-purple-50'
                                                    : 'border-gray-200 hover:bg-gray-50'
                                                    }`}
                                            >
                                                <span className="text-sm font-medium text-gray-700">{area.name}</span>
                                                <input
                                                    type="checkbox"
                                                    className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                                                    checked={isSelected}
                                                    onChange={() => handlePracticeAreaToggle(area.id)}
                                                />
                                            </label>
                                        );
                                    })
                                )}
                            </div>
                            <p className="text-xs text-gray-500 mt-3">Select all practice areas this user can work on</p>
                        </div>

                        {/* Reporting Manager */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h3 className="text-base font-semibold text-gray-900 mb-4 border-b pb-2 flex items-center gap-2">
                                <Users size={16} className="text-green-600" />
                                Reporting Manager
                            </h3>
                            <select
                                value={reportingTo}
                                onChange={(e) => setReportingTo(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                            >
                                <option value="">No Manager Assigned</option>
                                {availableManagers.map((manager) => (
                                    <option key={manager._id} value={manager._id}>
                                        {manager.name} ({manager.email})
                                    </option>
                                ))}
                            </select>
                            <p className="text-xs text-gray-500 mt-2">Senior user for hierarchy and oversight</p>
                        </div>

                        {/* Access End Date */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h3 className="text-base font-semibold text-gray-900 mb-4 border-b pb-2 flex items-center gap-2">
                                <Calendar size={16} className="text-red-600" />
                                Access End Date (For Interns)
                            </h3>
                            <input
                                type="date"
                                value={accessEndDate}
                                onChange={(e) => setAccessEndDate(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            />
                            <p className="text-xs text-gray-500 mt-2">Leave empty for permanent access</p>
                        </div>

                        {/* Conflict List */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:col-span-2">
                            <h3 className="text-base font-semibold text-gray-900 mb-4 border-b pb-2">Conflict List</h3>
                            <textarea
                                value={conflictList}
                                onChange={(e) => setConflictList(e.target.value)}
                                rows={3}
                                placeholder="Enter opposing party names separated by commas (e.g., ABC Corp, XYZ Ltd)"
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            />
                            <p className="text-xs text-gray-500 mt-2">Comma-separated list of opposing parties to prevent conflicts of interest</p>
                        </div>
                    </div>
                </div>

            </div>

            {/* Fixed Footer for Save Button */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-10 flex justify-end">
                <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex items-center gap-2 bg-[#0B2149] text-white px-8 py-3 rounded-lg font-medium hover:bg-[#1a3a75] disabled:opacity-70 transition-colors shadow-md text-base"
                >
                    {isSubmitting ? (
                        <Loader text="" size="sm" />
                    ) : (
                        <Save size={20} />
                    )}
                    Save All Changes
                </button>
            </div>
        </div>
    );
};

export default EditTeamMemberPage;
