"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/data/redux/hooks";
import { fetchAllRoles, updateRolePermissions } from "@/data/features/roles/rolesThunks";
import { fetchAllPermissions } from "@/data/features/permissions/permissionsThunks";
import toast from "react-hot-toast";
import Loader from "@/components/ui/Loader";
import { Shield, Save, Search, Grid3x3, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { useDocTitle } from "@/hooks/useDocTitle";

export default function PermissionMatrixPage() {
  useDocTitle("Permission Matrix | Sajjad Husain Law Associates");
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { roles, loading: rolesLoading } = useAppSelector((state) => state.roles);
  const { permissions, loading: permissionsLoading } = useAppSelector((state) => state.permissions);

  const [searchTerm, setSearchTerm] = useState("");
  const [saving, setSaving] = useState(false);
  const [changedRoles, setChangedRoles] = useState<Set<string>>(new Set());

  // Matrix state: roleId -> permissionId[] mapping
  const [matrix, setMatrix] = useState<Record<string, string[]>>({});

  useEffect(() => {
    dispatch(fetchAllRoles());
    dispatch(fetchAllPermissions());
  }, []);

  useEffect(() => {
    // Initialize matrix from roles data
    const initialMatrix: Record<string, string[]> = {};
    roles.forEach((role) => {
      const permissionIds = role.permissions?.map((p: any) => p._id || p.permission?._id || p) || [];
      initialMatrix[role._id] = permissionIds;
    });
    setMatrix(initialMatrix);
  }, [roles]);

  const handleTogglePermission = (roleId: string, permissionId: string) => {
    setMatrix((prev) => {
      const current = prev[roleId] || [];
      const updated = current.includes(permissionId)
        ? current.filter((id) => id !== permissionId)
        : [...current, permissionId];

      setChangedRoles((changedSet) => new Set(changedSet).add(roleId));

      return {
        ...prev,
        [roleId]: updated,
      };
    });
  };

  const handleToggleAll = (roleId: string, checked: boolean) => {
    setMatrix((prev) => ({
      ...prev,
      [roleId]: checked ? permissions.map((p) => p._id) : [],
    }));
    setChangedRoles((changedSet) => new Set(changedSet).add(roleId));
  };

  const handleSaveChanges = async () => {
    if (changedRoles.size === 0) {
      toast("No changes to save");
      return;
    }

    setSaving(true);
    let successCount = 0;
    let errorCount = 0;

    for (const roleId of Array.from(changedRoles)) {
      try {
        const permissionIds = matrix[roleId] || [];
        await dispatch(updateRolePermissions({ roleId, permissionIds })).unwrap();
        successCount++;
      } catch (error) {
        errorCount++;
      }
    }

    setSaving(false);
    setChangedRoles(new Set());

    if (errorCount === 0) {
      toast.success(`Successfully updated ${successCount} role(s)`);
    } else {
      toast.error(`Updated ${successCount} role(s), ${errorCount} failed`);
    }

    dispatch(fetchAllRoles());
  };

  const handleDiscardChanges = () => {
    // Reset matrix to original state
    const initialMatrix: Record<string, string[]> = {};
    roles.forEach((role) => {
      const permissionIds = role.permissions?.map((p: any) => p._id || p.permission?._id || p) || [];
      initialMatrix[role._id] = permissionIds;
    });
    setMatrix(initialMatrix);
    setChangedRoles(new Set());
    toast("Changes discarded");
  };

  const filteredPermissions = permissions.filter((perm) =>
    perm.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    perm.resource?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isLoading = rolesLoading || permissionsLoading;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader size="lg" text="Loading Permission Matrix..." />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {saving && <Loader fullScreen text="Saving Changes..." />}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Grid3x3 size={28} className="text-[#0A2342]" />
            Permission Matrix
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage role-permission assignments in a visual grid
          </p>
        </div>
        {changedRoles.size > 0 && (
          <div className="flex gap-2">
            <button
              onClick={handleDiscardChanges}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
            >
              Discard
            </button>
            <button
              onClick={handleSaveChanges}
              disabled={saving}
              className="px-4 py-2 bg-[#0A2342] text-white rounded-lg hover:bg-[#153a66] font-medium transition-colors flex items-center gap-2 disabled:opacity-70"
            >
              <Save size={18} />
              Save Changes ({changedRoles.size})
            </button>
          </div>
        )}
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start gap-3">
        <AlertCircle size={20} className="text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm text-blue-800">
            <strong>Tip:</strong> Click on cells to toggle permissions. Changes are highlighted and must be saved.
            Use the search box to filter permissions.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="relative">
          <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search permissions..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none"
          />
        </div>
      </div>

      {/* Matrix Grid */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-max">
            <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
              <tr>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 sticky left-0 bg-gray-50 z-10 min-w-[200px]">
                  Permission / Role
                </th>
                {roles.map((role) => (
                  <th key={role._id} className="text-center py-4 px-4 text-sm font-semibold text-gray-700 min-w-[150px]">
                    <div className="flex flex-col items-center gap-2">
                      <span>{role.name}</span>
                      <label className="flex items-center gap-1 cursor-pointer text-xs font-normal text-gray-500 hover:text-gray-700">
                        <input
                          type="checkbox"
                          checked={(matrix[role._id] || []).length === permissions.length}
                          onChange={(e) => handleToggleAll(role._id, e.target.checked)}
                          className="rounded border-gray-300 text-[#0A2342] focus:ring-[#C9A227]"
                        />
                        All
                      </label>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredPermissions.length === 0 ? (
                <tr>
                  <td colSpan={roles.length + 1} className="text-center py-12 text-gray-500">
                    <Shield size={48} className="mx-auto mb-3 text-gray-300" />
                    <p className="text-lg font-medium">No permissions found</p>
                    <p className="text-sm mt-1">Try adjusting your search</p>
                  </td>
                </tr>
              ) : (
                filteredPermissions.map((permission, index) => (
                  <tr
                    key={permission._id}
                    className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${index % 2 === 0 ? "bg-white" : "bg-gray-50"
                      }`}
                  >
                    <td className="py-3 px-6 sticky left-0 bg-inherit z-10">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{permission.name}</p>
                        {permission.resource && (
                          <p className="text-xs text-gray-500 mt-0.5">{permission.resource}</p>
                        )}
                      </div>
                    </td>
                    {roles.map((role) => {
                      const hasPermission = (matrix[role._id] || []).includes(permission._id);
                      const wasChanged = changedRoles.has(role._id);

                      return (
                        <td
                          key={`${role._id}-${permission._id}`}
                          className="text-center py-3 px-4"
                        >
                          <button
                            onClick={() => handleTogglePermission(role._id, permission._id)}
                            className={`ml-9
                              w-10 h-10 rounded-lg flex items-center justify-center transition-all
                              ${hasPermission
                                ? wasChanged
                                  ? "bg-yellow-100 border-2 border-yellow-400 text-yellow-700"
                                  : "bg-green-100 border border-green-300 text-green-700"
                                : "bg-gray-100 border border-gray-300 text-gray-400 hover:bg-gray-200"
                              }
                            `}
                            title={hasPermission ? "Click to remove" : "Click to grant"}
                          >
                            {hasPermission ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-green-100 border border-green-300 flex items-center justify-center">
            <CheckCircle2 size={16} className="text-green-700" />
          </div>
          <span>Granted (Saved)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-yellow-100 border-2 border-yellow-400 flex items-center justify-center">
            <CheckCircle2 size={16} className="text-yellow-700" />
          </div>
          <span>Granted (Unsaved)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-gray-100 border border-gray-300 flex items-center justify-center">
            <XCircle size={16} className="text-gray-400" />
          </div>
          <span>Not Granted</span>
        </div>
      </div>

      {/* Statistics */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Total Roles</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{roles.length}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Total Permissions</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{permissions.length}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Unsaved Changes</p>
          <p className="text-2xl font-bold text-yellow-600 mt-1">{changedRoles.size}</p>
        </div>
      </div>
    </div>
  );
}
