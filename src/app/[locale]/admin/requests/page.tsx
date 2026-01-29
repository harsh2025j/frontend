"use client";

import { useState, useEffect } from "react";
import { permissionRequestService } from "@/data/features/permission-requests/permissionRequestService";
import Loader from "@/components/ui/Loader";
import { toast } from "react-hot-toast";
import { Check, X, User, Calendar, MapPin, Phone, Mail, Clock } from "lucide-react";

export default function AdminRequestsPage() {
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    const fetchRequests = async () => {
        try {
            const data = await permissionRequestService.getAllRequests();
            setRequests(Array.isArray(data) ? data : []);
        } catch (error) {
            toast.error("Failed to fetch requests.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleAction = async (id: string, status: 'accepted' | 'rejected') => {
        setProcessingId(id);
        try {
            await permissionRequestService.updateStatus(id, { status, adminNote: `Request ${status} by admin.` });
            toast.success(`Request ${status} successfully!`);
            fetchRequests(); // Refresh list
        } catch (error: any) {
            toast.error(error.response?.data?.message || `Failed to ${status} request.`);
        } finally {
            setProcessingId(null);
        }
    };

    if (loading) return <Loader />;

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold text-gray-900">Permission Requests</h1>
                <p className="text-gray-500">Review and manage membership applications for content privileges.</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {requests.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                        <p className="text-gray-500 italic">No pending requests found.</p>
                    </div>
                ) : (
                    requests.map((request) => (
                        <div key={request._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-6">
                                <div className="flex flex-col lg:flex-row justify-between gap-6">
                                    <div className="space-y-4 flex-1">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                                                <User size={24} />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900">{request.userId?.name || "Unknown User"}</h3>
                                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                                    <Mail size={14} />
                                                    <span>{request.userId?.email}</span>
                                                </div>
                                            </div>
                                            <div className="ml-auto lg:ml-0">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${request.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                    request.status === 'accepted' ? 'bg-green-100 text-green-700' :
                                                        'bg-red-100 text-red-700'
                                                    }`}>
                                                    {request.status.toUpperCase()}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Calendar size={16} className="text-gray-400" />
                                                <span>DOB: {new Date(request.dob).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Phone size={16} className="text-gray-400" />
                                                <span>{request.phoneNumber}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <MapPin size={16} className="text-gray-400" />
                                                <span>{request.city}, {request.state}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Clock size={16} className="text-gray-400" />
                                                <span>Applied: {new Date(request.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>

                                        <div className="pt-2">
                                            <p className="text-sm font-medium text-gray-700 mb-2">Requested Permissions:</p>
                                            <div className="flex flex-wrap gap-2">
                                                {request.requestedPermissionIds.map((p: any) => (
                                                    <span key={p._id} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs border border-gray-200">
                                                        {p.name}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {request.status === 'pending' && (
                                        <div className="flex lg:flex-col justify-end gap-3 lg:w-40">
                                            <button
                                                onClick={() => handleAction(request._id, 'accepted')}
                                                disabled={processingId === request._id}
                                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium text-sm disabled:opacity-50 shadow-sm shadow-green-100"
                                            >
                                                <Check size={18} />
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => handleAction(request._id, 'rejected')}
                                                disabled={processingId === request._id}
                                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-red-50 text-red-600 border border-red-200 rounded-lg transition-colors font-medium text-sm disabled:opacity-50"
                                            >
                                                <X size={18} />
                                                Reject
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
