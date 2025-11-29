"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { X, ChevronLeft, Plus } from "lucide-react";

// Components & Hooks
import Loader from "@/components/ui/Loader";
import CustomInput from "@/components/ui/CustomInput";
import { useProfileActions } from "@/data/features/profile/useProfileActions";
import { useAppDispatch, useAppSelector } from "@/data/redux/hooks";

// Thunks & Types
import { fetchRoles } from "@/data/features/roles/rolesThunks";
import { fetchPermissions } from "@/data/features/permissions/permissionsThunks";
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

 
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "",
    permissions: [] as string[], 
  });

  // --- Authorization Check ---
  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      router.replace("/auth/login");
      return;
    }

    if (user?.role) {
      const currentRole = user.role.name;
      const allowedRoles = ["admin", "super_admin"];
      if (!allowedRoles.includes(currentRole)) {
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

  const handlePermissionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedPermId = e.target.value;
    if (!selectedPermId) return;

    if (!formData.permissions.includes(selectedPermId)) {
      setFormData((prev) => ({
        ...prev,
        permissions: [...prev.permissions, selectedPermId],
      }));
    }
    // Reset select to default
    e.target.value = "";
  };

  const removePermission = (permId: string) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.filter((id) => id !== permId),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password || !formData.role) {
      toast.error("Please fill in all required fields");
      return;
    }

    // TODO: Dispatch action to create member here
    console.log("Submitting Form Data:", formData);
    toast.success("Member added successfully (Demo)");
    
    // Redirect back after success
    // router.push("/admin/teams");
  };

  if (!isAuthorized) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-50">
        <Loader size="lg" text="Checking Permissions..." />
      </div>
    );
  }

  // Helper to get permission name by ID
  const getPermissionName = (id: string) => {
    return permissions.find((p) => p._id === id)?.name || id;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => router.back()} 
            className="p-2 hover:bg-gray-200 rounded-full transition"
          >
            <ChevronLeft size={24} className="text-gray-700" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-[#0A2342]">Add New Team Member</h1>
            <p className="text-sm text-gray-500">Create a new account for your staff member.</p>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Row 1: Name & Email */}
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
            </div>

            {/* Row 2: Phone & Password */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

            <hr className="border-gray-100" />


            <div>
              <label className="block font-medium mb-1 text-gray-700">Assign Role </label>
              <div className="relative">
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 appearance-none"
                  required
                >
                  <option value="" disabled>Select a Role</option>
                  {rolesLoading ? (
                    <option disabled>Loading roles...</option>
                  ) : (
                    roles.map((role: Role) => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))
                  )}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center">
                  <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor" className="text-gray-400">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">This defines the user&apos;s primary access level.</p>
            </div>

           
            <div>
              <label className="block font-medium mb-2 text-gray-700">Additional Permissions</label>
              
             
              <div className="relative mb-3">
                <select
                  onChange={handlePermissionChange}
                  className="w-full border rounded-lg px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 appearance-none"
                  defaultValue=""
                >
                  <option value="" disabled>Select permission to add...</option>
                  {permsLoading ? (
                    <option disabled>Loading permissions...</option>
                  ) : (
                    permissions
                      .filter(p => !formData.permissions.includes(p._id)) 
                      .map((perm: Permission) => (
                        <option key={perm._id} value={perm._id}>
                          {perm.name}
                        </option>
                      ))
                  )}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center">
                  <Plus size={18} className="text-gray-400" />
                </div>
              </div>

              {/* Selected Permissions Pills */}
              <div className="flex flex-wrap gap-2 min-h-[40px] p-2 border border-gray-100 bg-gray-50 rounded-lg">
                {formData.permissions.length === 0 && (
                  <span className="text-sm text-gray-400 italic px-2 self-center">No specific permissions added yet.</span>
                )}
                
                {formData.permissions.map((permId) => (
                  <div 
                    key={permId} 
                    className="flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium border border-blue-200"
                  >
                    <span>{getPermissionName(permId)}</span>
                    <button
                      type="button"
                      onClick={() => removePermission(permId)}
                      className="hover:bg-blue-200 rounded-full p-0.5 transition"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
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
                className="px-8 py-2.5 rounded-lg bg-[#C9A227] text-white font-medium hover:bg-[#b08d21] shadow-md transition disabled:opacity-70"
                disabled={rolesLoading || permsLoading}
              >
                Add Member
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}