"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { ChevronLeft } from "lucide-react";

// Components & Hooks
import Loader from "@/components/ui/Loader";
import CustomInput from "@/components/ui/CustomInput";
import { useProfileActions } from "@/data/features/profile/useProfileActions";
import { useAppDispatch, useAppSelector } from "@/data/redux/hooks";

// Thunks & Types
import { fetchRoles } from "@/data/features/roles/rolesThunks";
import { fetchPermissions } from "@/data/features/permissions/permissionsThunks";
import { registerUser } from "@/data/features/auth/authThunks";
import { UserData } from "@/data/features/profile/profile.types";
import { Role } from "@/data/features/roles/roles.types";
import { Permission } from "@/data/features/permissions/permissions.types";

export default function AddNewMemberPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  // --- Auth & Profile ---
  const { user: reduxUser } = useProfileActions();
  const user = reduxUser as UserData;
  const [isAuthorized, setIsAuthorized] = useState(false);

  // --- Redux Data ---
  const { roles, loading: rolesLoading } = useAppSelector((state) => state.roles);
  const { permissions, loading: permsLoading } = useAppSelector((state) => state.permissions);
  const { loading: authLoading } = useAppSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    roleIds: [] as string[],
    permissionIds: [] as string[],
  });

  // --- Authorization Check ---
  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      router.replace("/auth/login");
      return;
    }

    if (user?.roles?.length) {
      const allowedRoles = ["admin", "superadmin"];
      const hasAccess = user.roles.some((r) => allowedRoles.includes(r.name));
      if (!hasAccess) {
        router.replace("/auth/login");
      } else {
        setIsAuthorized(true);
      }
    }
  }, [user, router]);

  // --- Fetch Data on Mount ---
  useEffect(() => {
    if (isAuthorized) {
      dispatch(fetchRoles());
      dispatch(fetchPermissions());
    }
  }, [dispatch, isAuthorized]);

  // --- Handlers ---
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoleToggle = (roleId: string) => {
    setFormData((prev) => {
      const isSelected = prev.roleIds.includes(roleId);
      if (isSelected) {
        return { ...prev, roleIds: prev.roleIds.filter((id) => id !== roleId) };
      } else {
        return { ...prev, roleIds: [...prev.roleIds, roleId] };
      }
    });
  };

  const handlePermissionToggle = (permId: string) => {
    setFormData((prev) => {
      const isSelected = prev.permissionIds.includes(permId);
      if (isSelected) {
        return { ...prev, permissionIds: prev.permissionIds.filter((id) => id !== permId) };
      } else {
        return { ...prev, permissionIds: [...prev.permissionIds, permId] };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    // console.log("Form Data:", formData);
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      toast.error("Please fill in all required fields (Name, Email, Password)");
      return;
    }

    if (formData.roleIds.length === 0) {
      toast.error("Please select at least one role");
      return;
    }

    const payload = {
      ...formData,
      createdBy: user?._id, // Pass the current user's ID
    };

    try {
      const resultAction = await dispatch(registerUser(payload));
      if (registerUser.fulfilled.match(resultAction)) {
        toast.success("Member invited successfully!");
        router.push("/admin/teams");
      } else {
        // Error is handled by thunk/toast usually, but we can show generic error
        if (resultAction.payload) {
          toast.error(resultAction.payload as string);
        } else {
          toast.error("Failed to invite member");
        }
      }
    } catch (error) {
      // console.error("Invite error:", error);
      toast.error("An unexpected error occurred");
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
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-200 rounded-full transition"
          >
            <ChevronLeft size={24} className="text-gray-700" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-[#0A2342]">Invite New Team Member</h1>
            <p className="text-sm text-gray-500">Create a new account and assign access levels.</p>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-8">

            {/* Section 1: Basic Info */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <CustomInput
                  label="Full Name"
                  name="name"
                  placeholder="Member Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
                <CustomInput
                  label="Email Address"
                  name="email"
                  type="email"
                  placeholder="ex:member@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
                <CustomInput
                  label="Phone Number"
                  name="phone"
                  placeholder="+91 987xx xx210"
                  value={formData.phone}
                  onChange={handleChange}
                />
                <CustomInput
                  label="Password"
                  name="password"
                  type="password"
                  placeholder="Set a temporary password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Section 2: Roles */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Assign Roles</h3>
              <p className="text-sm text-gray-500 mb-4">Select one or more roles for this user.</p>

              {rolesLoading ? (
                <div className="py-4 text-gray-500">Loading roles...</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {roles.map((role: Role) => {
                    const roleId = role._id || (role as any).id;
                    // console.log("Role ID:", roleId);
                    if (!roleId) return null;

                    return (
                      <label
                        key={roleId}
                        className={`
                        flex items-center p-4 border rounded-xl cursor-pointer transition-all
                        ${formData.roleIds.includes(roleId)
                            ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500"
                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"}
                      `}
                      >
                        <input
                          type="checkbox"
                          className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300 mr-3"
                          checked={formData.roleIds.includes(roleId)}
                          onChange={() => { handleRoleToggle(roleId) }}
                        />
                        <div>
                          <span className="font-medium text-gray-900 block">{role.name}</span>
                          {role.description && (
                            <span className="text-xs text-gray-500">{role.description}</span>
                          )}
                        </div>
                      </label>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Section 3: Permissions */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Additional Permissions</h3>
              <p className="text-sm text-gray-500 mb-4">Grant specific permissions beyond the assigned roles.</p>

              {permsLoading ? (
                <div className="py-4 text-gray-500">Loading permissions...</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {permissions.map((perm: Permission) => {
                    const permId = perm._id || (perm as any).id;
                    if (!permId) return null;

                    return (
                      <label
                        key={permId}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer"
                      >
                        <div className="relative flex items-center">
                          <input
                            type="checkbox"
                            className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-gray-300 transition-all checked:border-blue-600 checked:bg-blue-600"
                            checked={formData.permissionIds.includes(permId)}
                            onChange={() => handlePermissionToggle(permId)}
                          />
                          <div className="pointer-events-none absolute top-2/4 left-2/4 -translate-y-2/4 -translate-x-2/4 text-white opacity-0 transition-opacity peer-checked:opacity-100">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-3.5 w-3.5"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                              stroke="currentColor"
                              strokeWidth="1"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              ></path>
                            </svg>
                          </div>
                        </div>
                        <span className="text-sm text-gray-700 font-medium">{perm.name}</span>
                      </label>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-4 pt-6 mt-6 border-t border-gray-100">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-8 py-2.5 rounded-lg bg-[#C9A227] text-white font-medium hover:bg-[#b08d21] shadow-md transition disabled:opacity-70 flex items-center gap-2"
                disabled={rolesLoading || permsLoading || authLoading}
              >
                {authLoading && <Loader size="sm" />}
                {authLoading ? "Inviting..." : "Invite Member"}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
