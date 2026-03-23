"use client";

import { useState, useEffect } from "react";
import { useProfileActions } from "@/data/features/profile/useProfileActions";
import { UserData } from "@/data/features/profile/profile.types";
import { permissionRequestService } from "@/data/features/permission-requests/permissionRequestService";
import { PERMISSIONS, canAccessContentManagementPage } from "@/utils/permissions";
import Loader from "@/components/ui/Loader";
import { toast } from "react-hot-toast";
import { Check, Clock } from "lucide-react";

export default function MembershipForm() {
    const { user: reduxUser, updateProfile } = useProfileActions();
    const user = reduxUser as UserData;

    const [loading, setLoading] = useState(false);
    const [fetchingRequests, setFetchingRequests] = useState(true);
    const [existingRequests, setExistingRequests] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        dob: "",
        phoneNumber: "",
        state: "",
        city: "",
        designation: "",
        yearsOfExperience: "",
        specialization: "",
        barRegistrationNumber: "",
    });

    // const [selectedPermissions, setSelectedPermissions] = useState<string[]>([
    //     PERMISSIONS.ARTICLE.CREATE,
    //     PERMISSIONS.ARTICLE.EDIT,
    // ]);

    const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

    const [requestedRoleIds, setRequestedRoleIds] = useState<string[]>([]);

    const fetchMyRequests = async () => {
        try {
            const data = await permissionRequestService.getMyRequests();
            setExistingRequests(Array.isArray(data) ? data : []);
        } catch (error: any) {
            // Silently handle errors - user can still submit a new request
            console.log("Could not fetch existing requests:", error.message);
            setExistingRequests([]);
        } finally {
            setFetchingRequests(false);
        }
    };

    useEffect(() => {
        fetchMyRequests();
    }, []);

    const pendingRequest = existingRequests.find(r => r.status === 'pending');

    const hasAlreadySpecialPermissions = canAccessContentManagementPage(user);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        if (name === 'designation') {
            // Mapping Designation to Role names
            const roleMap: Record<string, string> = {
                'Advocate': 'advocate',
                'Lawyer': 'lawyer',
                'Legal Advisor': 'legal_advisor',
                'Law Student': 'law_student',
                'Paralegal': 'paralegal',
                // 'Judges': 'judge'
            };
            const roleName = roleMap[value];
            if (roleName) {
                setRequestedRoleIds([roleName]);
            }

            // Mapping Designation to Permission arrays as requested
            const permissionMap: Record<string, string[]> = {
                'Advocate': [PERMISSIONS.ARTICLE.CREATE, PERMISSIONS.ARTICLE.EDIT, PERMISSIONS.ARTICLE.DELETE, PERMISSIONS.ARTICLE.READ, PERMISSIONS.MANAGE.CASES],
                'Lawyer': [PERMISSIONS.ARTICLE.CREATE, PERMISSIONS.ARTICLE.EDIT, PERMISSIONS.ARTICLE.DELETE, PERMISSIONS.ARTICLE.READ, PERMISSIONS.MANAGE.CASES],
                // 'Judges': [PERMISSIONS.ARTICLE.CREATE, PERMISSIONS.ARTICLE.EDIT, PERMISSIONS.ARTICLE.DELETE, PERMISSIONS.ARTICLE.READ, PERMISSIONS.MANAGE.CASES],
                'Law Student': [PERMISSIONS.ARTICLE.CREATE, PERMISSIONS.ARTICLE.EDIT, PERMISSIONS.ARTICLE.DELETE, PERMISSIONS.ARTICLE.READ, PERMISSIONS.MANAGE.CASES],
                'Legal Advisor': [PERMISSIONS.ARTICLE.CREATE, PERMISSIONS.ARTICLE.EDIT, PERMISSIONS.ARTICLE.DELETE, PERMISSIONS.ARTICLE.READ, PERMISSIONS.MANAGE.CASES],
                'Paralegal': [PERMISSIONS.ARTICLE.CREATE, PERMISSIONS.ARTICLE.EDIT, PERMISSIONS.ARTICLE.DELETE, PERMISSIONS.ARTICLE.READ, PERMISSIONS.MANAGE.CASES],
            };

            const perms = permissionMap[value];
            setSelectedPermissions(perms);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Validation
        if (!formData.dob) {
            toast.error("Date of Birth is required");
            setLoading(false);
            return;
        }
        if (!formData.phoneNumber) {
            toast.error("Phone Number is required");
            setLoading(false);
            return;
        }
        if (formData.yearsOfExperience !== "" && (isNaN(Number(formData.yearsOfExperience)) || Number(formData.yearsOfExperience) < 0 || Number(formData.yearsOfExperience) > 100)) {
            toast.error("Please enter a valid number for Years of Experience (0-100)");
            setLoading(false);
            return;
        }
        if (!formData.designation) {
            toast.error("Designation is required");
            setLoading(false);
            return;
        }

        try {
            await permissionRequestService.create({
                ...formData,
                yearsOfExperience: formData.yearsOfExperience ? Number(formData.yearsOfExperience) : 0,
                requestedPermissionIds: selectedPermissions,
                requestedRoleIds: requestedRoleIds,
            });

            // Sync with profile data
            await updateProfile({
                phone: formData.phoneNumber,
                dob: formData.dob,
                city: formData.city,
                state: formData.state,
                designation: formData.designation,
                yearsOfExperience: formData.yearsOfExperience ? Number(formData.yearsOfExperience) : 0,
                specialization: formData.specialization,
                barRegistrationNumber: formData.barRegistrationNumber,
            });

            toast.success("Membership request submitted successfully!");
            fetchMyRequests(); // Refresh state
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to submit request.");
        } finally {
            setLoading(false);
        }
    };

    if (!user || fetchingRequests) return <Loader />;

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Membership Application</h2>

            {hasAlreadySpecialPermissions ? (
                <div className="p-6 bg-green-50 border border-green-100 rounded-xl mb-6">
                    <div className="flex items-center gap-3 text-green-800 mb-2">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <Check size={18} />
                        </div>
                        <h3 className="font-bold">You are a Premium Member</h3>
                    </div>
                    <p className="text-sm text-green-700">
                        You already have the privileges to create and manage articles.
                        No further application is required.
                    </p>
                </div>
            ) : pendingRequest ? (
                <div className="p-6 bg-yellow-50 border border-yellow-100 rounded-xl mb-6">
                    <div className="flex items-center gap-3 text-yellow-800 mb-2">
                        <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                            <Clock size={18} />
                        </div>
                        <h3 className="font-bold">Application Pending</h3>
                    </div>
                    <p className="text-sm text-yellow-700">
                        You have a membership application submitted on <strong>{new Date(pendingRequest.createdAt).toLocaleDateString()}</strong>.
                        Please wait for an administrator to review your request.
                    </p>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* ... form fields remain same ... */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input
                            type="text"
                            value={user.name}
                            disabled
                            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            value={user.email}
                            disabled
                            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                            <input
                                type="date"
                                name="dob"
                                required
                                value={formData.dob}
                                onChange={handleChange}
                                className="w-full p-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                            <input
                                type="tel"
                                name="phoneNumber"
                                required
                                placeholder="e.g. +1234567890"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                className="w-full p-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                            <input
                                type="text"
                                name="state"
                                required
                                placeholder="e.g. Uttar Pradesh"
                                value={formData.state}
                                onChange={handleChange}
                                className="w-full p-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                            <input
                                type="text"
                                name="city"
                                required
                                placeholder="e.g. Lucknow"
                                value={formData.city}
                                onChange={handleChange}
                                className="w-full p-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
                        <select
                            name="designation"
                            required
                            value={formData.designation}
                            onChange={handleChange}
                            className="w-full p-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                        >
                            <option value="">Select Designation</option>
                            <option value="Advocate">Advocate</option>
                            <option value="Lawyer">Lawyer</option>
                            <option value="Legal Advisor">Legal Advisor</option>
                            <option value="Law Student">Law Student</option>
                            <option value="Paralegal">Paralegal</option>
                            {/* <option value="Judges">Judges</option> */}
                        </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
                            <input
                                type="number"
                                name="yearsOfExperience"
                                required
                                placeholder="e.g. 5"
                                value={formData.yearsOfExperience}
                                onChange={handleChange}
                                className="w-full p-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
                            <input
                                type="text"
                                name="specialization"
                                required
                                placeholder="e.g. Criminal Law"
                                value={formData.specialization}
                                onChange={handleChange}
                                className="w-full p-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                            />
                        </div>
                    </div>

                    {(formData.designation === 'Advocate' || formData.designation === 'Lawyer') && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Bar Council Registration Number</label>
                            <input
                                type="text"
                                name="barRegistrationNumber"
                                required
                                placeholder="e.g. BC/1234/2020"
                                value={formData.barRegistrationNumber}
                                onChange={handleChange}
                                className="w-full p-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                            />
                        </div>
                    )}

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors shadow-lg shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader size="sm" color="white" /> : "Submit Application"}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}
