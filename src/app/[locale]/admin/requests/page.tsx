"use client";

import { useState, useEffect } from "react";
import { permissionRequestService } from "@/data/features/permission-requests/permissionRequestService";
import Loader from "@/components/ui/Loader";
import { toast } from "react-hot-toast";
import { Check, X, User, Calendar, MapPin, Phone, Mail, Clock, Briefcase, Award, Hash, Globe } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/data/redux/hooks";
import { fetchRoles } from "@/data/features/roles/rolesThunks";
import { fetchPermissions } from "@/data/features/permissions/permissionsThunks";
import { RootState } from "@/data/redux/store";
import Pagination from "@/components/Pagination";

export default function AdminRequestsPage() {
    const dispatch = useAppDispatch();
    const { roles } = useAppSelector((state: RootState) => state.roles);
    const { permissions } = useAppSelector((state: RootState) => state.permissions);

    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const limit = 12;

    // Modal State
    const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<any>(null);
    const [adminNote, setAdminNote] = useState("");

    // Reject Modal State
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);

    const fetchRequests = async (page: number) => {
        setLoading(true);
        try {
            const response = await permissionRequestService.getAllRequests(page, limit);
            // Handle both array and paginated object response
            if (response && response.data) {
                setRequests(response.data);
                setTotalPages(response.totalPages);
                setTotal(response.total);
            } else {
                setRequests(Array.isArray(response) ? response : []);
            }
        } catch (error) {
            toast.error("Failed to fetch requests.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests(currentPage);
    }, [currentPage]);

    useEffect(() => {
        dispatch(fetchRoles());
        dispatch(fetchPermissions());
    }, [dispatch]);

    const openApproveModal = (request: any) => {
        setSelectedRequest(request);
        setAdminNote(`Request accepted by admin.`);
        setIsApproveModalOpen(true);
    };

    const openRejectModal = (request: any) => {
        setSelectedRequest(request);
        setAdminNote("");
        setIsRejectModalOpen(true);
    };

    const handleAction = async (id: string, status: 'accepted' | 'rejected', extraData?: any) => {
        setProcessingId(id);
        try {
            await permissionRequestService.updateStatus(id, {
                status,
                adminNote: extraData?.adminNote || `Request ${status} by admin.`
            });
            toast.success(`Request ${status} successfully!`);
            setIsApproveModalOpen(false);
            fetchRequests(currentPage); // Refresh current page
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

                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Briefcase size={16} className="text-gray-400" />
                                                <span>{request.designation}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Award size={16} className="text-gray-400" />
                                                <span>{request.yearsOfExperience} years exp.</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Globe size={16} className="text-gray-400" />
                                                <span>{request.specialization}</span>
                                            </div>
                                            {request.barRegistrationNumber && (
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <Hash size={16} className="text-gray-400" />
                                                    <span>BAR: {request.barRegistrationNumber}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="pt-2">
                                            <p className="text-sm font-medium text-gray-700 mb-2">Requested Roles & Permissions:</p>
                                            <div className="flex flex-wrap gap-2">
                                                {request.requestedRoleIds?.map((r: any, idx: number) => (
                                                    <span key={typeof r === 'string' ? `${r}-${idx}` : r._id} className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs border border-blue-100 font-bold">
                                                        Role: {typeof r === 'string' ? r : r.name}
                                                    </span>
                                                ))}
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
                                                onClick={() => openApproveModal(request)}
                                                disabled={processingId === request._id}
                                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium text-sm disabled:opacity-50 shadow-sm shadow-green-100"
                                            >
                                                <Check size={18} />
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => openRejectModal(request)}
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

            {/* Pagination Controls */}
            {!loading && requests.length > 0 && totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-4 text-sm text-gray-500 bg-white rounded-xl border border-gray-100 shadow-sm">
                    <p>Showing <span className="font-medium text-gray-900">{requests.length}</span> of <span className="font-medium text-gray-900">{total}</span> requests</p>
                    <div className="w-full sm:w-auto">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={(page) => setCurrentPage(page)}
                        />
                    </div>
                </div>
            )}

            {/* Approve Modal */}
            {isApproveModalOpen && selectedRequest && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 bg-opacity-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="p-6 border-b flex justify-between items-center">
                            <h2 className="text-xl font-bold">Approve Membership</h2>
                            <button onClick={() => setIsApproveModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto flex-1 space-y-6">
                            <div className="bg-blue-50 p-6 rounded-xl flex items-center gap-4 border border-blue-100">
                                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                                    <User size={32} />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-lg font-bold text-gray-900">{selectedRequest.userId?.name}</p>
                                    <p className="text-sm text-gray-500">{selectedRequest.userId?.email}</p>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        <span className="px-2 py-0.5 bg-blue-600 text-white rounded text-xs font-bold">
                                            {selectedRequest.designation}
                                        </span>
                                        <span className="px-2 py-0.5 bg-gray-200 text-gray-700 rounded text-xs">
                                            {selectedRequest.yearsOfExperience} years exp.
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm font-bold text-gray-700 mb-2">Requested Roles & Permissions:</p>
                                    <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                        {selectedRequest.requestedRoleIds?.map((r: any, idx: number) => (
                                            <span key={typeof r === 'string' ? `${r}-${idx}` : r._id} className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs border border-blue-100 font-bold">
                                                Role: {typeof r === 'string' ? r : r.name}
                                            </span>
                                        ))}
                                        {selectedRequest.requestedPermissionIds?.map((p: any) => (
                                            <span key={p._id} className="px-2 py-1 bg-white text-gray-600 rounded text-xs border border-gray-200">
                                                {p.name}
                                            </span>
                                        ))}
                                        {(!selectedRequest.requestedRoleIds?.length && !selectedRequest.requestedPermissionIds?.length) && (
                                            <span className="text-xs text-gray-400 italic">No specific privileges requested.</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/50">
                                <p className="text-sm text-blue-800 font-medium text-center">Confirm membership approval. The above privileges will be granted automatically.</p>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Admin Note (optional)</label>
                                <textarea
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                                    rows={3}
                                    placeholder="Write a message to the user..."
                                    value={adminNote}
                                    onChange={(e) => setAdminNote(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="p-6 border-t flex gap-3">
                            <button
                                onClick={() => setIsApproveModalOpen(false)}
                                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleAction(selectedRequest._id, 'accepted', { adminNote })}
                                disabled={processingId === selectedRequest._id}
                                className="flex-[2] py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-green-100 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {processingId === selectedRequest._id ? <Loader /> : <><Check size={20} /> Approve & Grant Access</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Confirmation Modal */}
            {isRejectModalOpen && selectedRequest && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 bg-opacity-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden flex flex-col scale-in-center">
                        <div className="p-6 border-b flex justify-between items-center bg-red-50">
                            <h2 className="text-xl font-bold text-red-700 flex items-center gap-2">
                                <X size={24} /> Reject Request
                            </h2>
                            <button onClick={() => setIsRejectModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <p className="text-sm text-gray-500 mb-1">Are you sure you want to reject the application from:</p>
                                <p className="font-bold text-gray-900">{selectedRequest.userId?.name}</p>
                                <p className="text-xs text-gray-500">{selectedRequest.userId?.email}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Reason for rejection (optional)</label>
                                <textarea
                                    className="w-full p-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-red-500 transition-all text-sm"
                                    rows={3}
                                    placeholder="e.g. Incomplete documentation, invalid bar number..."
                                    value={adminNote}
                                    onChange={(e) => setAdminNote(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="p-6 border-t flex gap-3">
                            <button
                                onClick={() => setIsRejectModalOpen(false)}
                                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    handleAction(selectedRequest._id, 'rejected', { adminNote });
                                    setIsRejectModalOpen(false);
                                }}
                                disabled={processingId === selectedRequest._id}
                                className="flex-[2] py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-red-100 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {processingId === selectedRequest._id ? <Loader /> : <><X size={20} /> Reject Request</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
