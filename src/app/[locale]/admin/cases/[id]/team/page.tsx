"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/data/redux/hooks";
import {
  fetchTeamByMatter,
  createTeamMember,
  updateTeamMember,
  removeTeamMember,
  clearMatterTeamMessage,
  clearMatterTeamError,
} from "@/data/features/matter-team/matterTeamThunks";
import { fetchAllUsers } from "@/data/features/users/usersThunks";
import { RoleInMatter, AccessLevel, MatterTeamMember } from "@/data/features/matter-team/matter-team.types";
import { casesService } from "@/data/services/cases-service/casesService";
import toast from "react-hot-toast";
import Loader from "@/components/ui/Loader";
import { ArrowLeft, Plus, Pencil, Trash2, Users, Shield, Eye, FileEdit, Award, X } from "lucide-react";
import { useDocTitle } from "@/hooks/useDocTitle";

export default function MatterTeamPage() {
  useDocTitle("Matter Team Management | Sajjad Husain Law Associates");
  const router = useRouter();
  const params = useParams();
  const dispatch = useAppDispatch();

  const { teamMembers, loading, error, message } = useAppSelector((state) => state.matterTeam);
  const { users, loading: usersLoading } = useAppSelector((state) => state.users);
  const { user: currentUser } = useAppSelector((state) => state.auth);

  const [caseDetails, setCaseDetails] = useState<any>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<MatterTeamMember | null>(null);

  // Add member form state
  const [newMember, setNewMember] = useState({
    userId: "",
    roleInMatter: RoleInMatter.ASSOCIATE,
    accessLevel: AccessLevel.READ,
  });

  // Edit member form state
  const [editMemberData, setEditMemberData] = useState({
    roleInMatter: RoleInMatter.ASSOCIATE,
    accessLevel: AccessLevel.READ,
  });

  const matterId = params.id as string;

  useEffect(() => {
    if (matterId) {
      fetchCaseDetails();
      dispatch(fetchTeamByMatter(matterId));
      dispatch(fetchAllUsers());
    }
  }, [matterId]);

  useEffect(() => {
    if (message) {
      toast.success(message);
      dispatch(clearMatterTeamMessage());
    }
    if (error) {
      toast.error(error);
      dispatch(clearMatterTeamError());
    }
  }, [message, error]);

  const fetchCaseDetails = async () => {
    try {
      const response = await casesService.getById(matterId);
      setCaseDetails(response.data.data);
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch case details");
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.id) {
      toast.error("You must be logged in to add team members");
      return;
    }

    await dispatch(createTeamMember({
      data: {
        matterId,
        userId: newMember.userId,
        roleInMatter: newMember.roleInMatter,
        accessLevel: newMember.accessLevel,
      },
      assignedBy: currentUser.id,
    }));

    setShowAddModal(false);
    setNewMember({
      userId: "",
      roleInMatter: RoleInMatter.ASSOCIATE,
      accessLevel: AccessLevel.READ,
    });
    dispatch(fetchTeamByMatter(matterId));
  };

  const handleEditMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember) return;

    await dispatch(updateTeamMember({
      id: selectedMember.id,
      data: editMemberData,
    }));

    setShowEditModal(false);
    setSelectedMember(null);
    dispatch(fetchTeamByMatter(matterId));
  };

  const handleRemoveMember = async (memberId: string) => {
    if (confirm("Are you sure you want to remove this team member?")) {
      await dispatch(removeTeamMember(memberId));
      dispatch(fetchTeamByMatter(matterId));
    }
  };

  const openEditModal = (member: MatterTeamMember) => {
    setSelectedMember(member);
    setEditMemberData({
      roleInMatter: member.roleInMatter,
      accessLevel: member.accessLevel,
    });
    setShowEditModal(true);
  };

  const getRoleIcon = (role: RoleInMatter) => {
    switch (role) {
      case RoleInMatter.LEAD:
        return <Award size={16} className="text-purple-600" />;
      case RoleInMatter.SENIOR:
        return <Shield size={16} className="text-blue-600" />;
      case RoleInMatter.ASSOCIATE:
        return <Users size={16} className="text-green-600" />;
      case RoleInMatter.PARALEGAL:
        return <FileEdit size={16} className="text-orange-600" />;
      case RoleInMatter.CONSULTANT:
        return <Eye size={16} className="text-gray-600" />;
      default:
        return null;
    }
  };

  const getRoleBadgeColor = (role: RoleInMatter) => {
    switch (role) {
      case RoleInMatter.LEAD:
        return "bg-purple-100 text-purple-700 border-purple-200";
      case RoleInMatter.SENIOR:
        return "bg-blue-100 text-blue-700 border-blue-200";
      case RoleInMatter.ASSOCIATE:
        return "bg-green-100 text-green-700 border-green-200";
      case RoleInMatter.PARALEGAL:
        return "bg-orange-100 text-orange-700 border-orange-200";
      case RoleInMatter.CONSULTANT:
        return "bg-gray-100 text-gray-700 border-gray-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getAccessBadgeColor = (access: AccessLevel) => {
    switch (access) {
      case AccessLevel.FULL:
        return "bg-red-100 text-red-700 border-red-200";
      case AccessLevel.CONTRIBUTE:
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case AccessLevel.READ:
        return "bg-blue-100 text-blue-700 border-blue-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  // Filter out users already on the team
  const availableUsers = users.filter(
    (user) => !teamMembers.some((member) => member.userId === user._id)
  );

  if (loading && !caseDetails) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader size="lg" text="Loading Matter Team..." />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-200 rounded-full transition-colors"
        >
          <ArrowLeft size={24} className="text-gray-600" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Matter Team Management</h1>
          {caseDetails && (
            <p className="text-gray-500 text-sm mt-1">
              {caseDetails.caseNumber} - {caseDetails.title}
            </p>
          )}
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-[#0A2342] text-white rounded-lg hover:bg-[#153a66] font-medium transition-colors flex items-center gap-2"
        >
          <Plus size={18} />
          <span className="hidden sm:inline">Add Team Member</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      {/* Team Members List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Team Member</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Office</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Role in Matter</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Access Level</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Assigned By</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Assigned Date</th>
                <th className="text-right py-4 px-6 text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {teamMembers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-500">
                    <Users size={48} className="mx-auto mb-3 text-gray-300" />
                    <p className="text-lg font-medium">No team members assigned yet</p>
                    <p className="text-sm mt-1">Click "Add Team Member" to get started</p>
                  </td>
                </tr>
              ) : (
                teamMembers.map((member) => (
                  <tr key={member.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-medium text-gray-900">{member.user?.name || "Unknown User"}</p>
                        <p className="text-sm text-gray-500">{member.user?.email || member.userId}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-gray-700">
                        {member.user?.office?.name || "Not Assigned"}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${getRoleBadgeColor(member.roleInMatter)}`}>
                        {getRoleIcon(member.roleInMatter)}
                        {member.roleInMatter.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${getAccessBadgeColor(member.accessLevel)}`}>
                        {member.accessLevel.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-gray-700">
                        {member.assignedByUser?.name || "System"}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-gray-700">
                        {new Date(member.assignedAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditModal(member)}
                          className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                          title="Edit member"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleRemoveMember(member.id)}
                          className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                          title="Remove member"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden divide-y divide-gray-100">
          {teamMembers.length === 0 ? (
            <div className="text-center py-12 px-4 text-gray-500">
              <Users size={48} className="mx-auto mb-3 text-gray-300" />
              <p className="text-lg font-medium">No team members assigned yet</p>
              <p className="text-sm mt-1">Click "Add" to get started</p>
            </div>
          ) : (
            teamMembers.map((member) => (
              <div key={member.id} className="p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{member.user?.name || "Unknown User"}</p>
                    <p className="text-sm text-gray-500">{member.user?.email || member.userId}</p>
                    <p className="text-xs text-gray-400 mt-1">{member.user?.office?.name || "Not Assigned"}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(member)}
                      className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => handleRemoveMember(member.id)}
                      className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getRoleBadgeColor(member.roleInMatter)}`}>
                    {getRoleIcon(member.roleInMatter)}
                    {member.roleInMatter.toUpperCase()}
                  </span>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getAccessBadgeColor(member.accessLevel)}`}>
                    {member.accessLevel.toUpperCase()}
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  Assigned by {member.assignedByUser?.name || "System"} on {new Date(member.assignedAt).toLocaleDateString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Add Team Member</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleAddMember} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select User <span className="text-red-500">*</span>
                </label>
                <select
                  value={newMember.userId}
                  onChange={(e) => setNewMember({ ...newMember, userId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none"
                  required
                >
                  <option value="">-- Select User --</option>
                  {availableUsers.map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role in Matter <span className="text-red-500">*</span>
                </label>
                <select
                  value={newMember.roleInMatter}
                  onChange={(e) => setNewMember({ ...newMember, roleInMatter: e.target.value as RoleInMatter })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none"
                  required
                >
                  <option value={RoleInMatter.LEAD}>Lead</option>
                  <option value={RoleInMatter.SENIOR}>Senior</option>
                  <option value={RoleInMatter.ASSOCIATE}>Associate</option>
                  <option value={RoleInMatter.PARALEGAL}>Paralegal</option>
                  <option value={RoleInMatter.CONSULTANT}>Consultant</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Access Level <span className="text-red-500">*</span>
                </label>
                <select
                  value={newMember.accessLevel}
                  onChange={(e) => setNewMember({ ...newMember, accessLevel: e.target.value as AccessLevel })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none"
                  required
                >
                  <option value={AccessLevel.FULL}>Full Access</option>
                  <option value={AccessLevel.CONTRIBUTE}>Contribute</option>
                  <option value={AccessLevel.READ}>Read Only</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || usersLoading}
                  className="flex-1 px-4 py-2.5 bg-[#0A2342] text-white rounded-lg hover:bg-[#153a66] font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? "Adding..." : "Add Member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Member Modal */}
      {showEditModal && selectedMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Edit Team Member</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleEditMember} className="p-6 space-y-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="font-medium text-gray-900">{selectedMember.user?.name || "Unknown User"}</p>
                <p className="text-sm text-gray-500">{selectedMember.user?.email || selectedMember.userId}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role in Matter <span className="text-red-500">*</span>
                </label>
                <select
                  value={editMemberData.roleInMatter}
                  onChange={(e) => setEditMemberData({ ...editMemberData, roleInMatter: e.target.value as RoleInMatter })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none"
                  required
                >
                  <option value={RoleInMatter.LEAD}>Lead</option>
                  <option value={RoleInMatter.SENIOR}>Senior</option>
                  <option value={RoleInMatter.ASSOCIATE}>Associate</option>
                  <option value={RoleInMatter.PARALEGAL}>Paralegal</option>
                  <option value={RoleInMatter.CONSULTANT}>Consultant</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Access Level <span className="text-red-500">*</span>
                </label>
                <select
                  value={editMemberData.accessLevel}
                  onChange={(e) => setEditMemberData({ ...editMemberData, accessLevel: e.target.value as AccessLevel })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none"
                  required
                >
                  <option value={AccessLevel.FULL}>Full Access</option>
                  <option value={AccessLevel.CONTRIBUTE}>Contribute</option>
                  <option value={AccessLevel.READ}>Read Only</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 bg-[#0A2342] text-white rounded-lg hover:bg-[#153a66] font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? "Updating..." : "Update Member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
