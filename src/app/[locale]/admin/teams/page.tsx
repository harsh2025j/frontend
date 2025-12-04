"use client";
import { UserData } from "@/data/features/profile/profile.types";
import { useProfileActions } from "@/data/features/profile/useProfileActions";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import Loader from "@/components/ui/Loader";
import { fetchUsers } from "@/data/features/users/usersThunks";
import { useAppDispatch, useAppSelector } from "@/data/redux/hooks";

const TeamManagementPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { users, loading } = useAppSelector((state) => state.users);

  const router = useRouter();
  const { user: reduxUser } = useProfileActions();
  const user = reduxUser as UserData;

  const [isAuthorized, setIsAuthorized] = useState(false);

  // 1) Validate token + role
  useEffect(() => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;

    if (!token) {
      router.replace("/auth/login");
      return;
    }

    if (user) {
      const allowedRoles = ["admin", "superadmin"];
      const hasAccess = user.roles?.some((r) => allowedRoles.includes(r.name));

      if (!hasAccess) router.replace("/auth/login");
      else setIsAuthorized(true);
    }
  }, [user, router]);

  useEffect(() => {
    if (isAuthorized) dispatch(fetchUsers());
  }, [isAuthorized, dispatch]);

  // 3) Filter users (must be BEFORE any return)
  const filteredUsers = useMemo(() => {
    if (!reduxUser || !reduxUser._id) return null;
    if (!users || users.length === 0) return null;
    return users.filter((u) => u.createdBy?._id === reduxUser._id);
  }, [users, reduxUser]);

  // 4) Render loader until authorization + user ready
  if (!isAuthorized || !user) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-50">
        <Loader size="lg" text="Checking Permissions..." />
      </div>
    );
  }

  const addNewMember = () => {
    router.push("/admin/teams/add-new-member");
  };

  return (
    <div>
      <h1 className="text-xl font-poppins text-black font-medium">
        Team Management
      </h1>

      <div className="flex min-h-screen bg-gray-50 text-gray-800">
        <main className="flex-1 p-6">
          <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow p-8">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 bg-gray rounded-xl px-6 py-3">
              <div className="text-sm md:text-base">
                <strong>Total Team:</strong> {filteredUsers?.length || 0}
              </div>
              <button
                className="bg-yellow-400 text-white px-5 py-2 rounded-md font-medium hover:bg-yellow-500"
                onClick={addNewMember}
              >
                + Invite new Member
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-xl bg-lightgray">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-100 text-gray-700 border-b border-bordercolor">
                  <tr>
                    <th className="py-3 px-4 text-sm font-medium">#</th>
                    <th className="py-3 px-4 text-sm font-medium">User</th>
                    <th className="py-3 px-4 text-sm font-medium">Email</th>
                    <th className="py-3 px-4 text-sm font-medium">Role</th>
                    <th className="py-3 px-4 text-sm font-medium">Status</th>
                    <th className="py-3 px-4 text-sm font-medium">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {loading || !filteredUsers ? (
                    <tr>
                      <td colSpan={6} className="text-center py-10">
                        <Loader size="lg" text="Loading Team..." />
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="text-center py-10 text-gray-500 text-sm"
                      >
                        No team members found.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((member, index) => (
                      <tr
                        key={member._id}
                        className="border-b border-bordercolor hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-3 px-4 text-sm">{index + 1}</td>
                        <td className="py-3 px-4 text-sm">{member.name}</td>
                        <td className="py-3 px-4 text-sm">{member.email}</td>
                        <td className="py-3 px-4 text-sm">
                          <div className="flex flex-wrap gap-1">
                            {member.roles?.length ? (
                              member.roles.map((role) => (
                                <span
                                  key={role._id}
                                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100"
                                >
                                  {role.name}
                                </span>
                              ))
                            ) : (
                              <span className="text-gray-400 text-xs italic">
                                No Role
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm">
                          <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full font-medium">
                            {member.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="py-3 px-4 flex gap-2">
                          <button className="bg-yellow-500 text-white px-4 py-1 rounded-md text-sm hover:bg-yellow-600">
                            Message
                          </button>
                          <button className="bg-gray-300 text-gray-700 px-4 py-1 rounded-md text-sm hover:bg-gray-400">
                            Manage
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex justify-center items-center mt-4 space-x-2 text-gray-600 text-sm">
              <button className="px-2 py-1 hover:text-[#0B2149]">&lt;</button>
              <span className="px-3 py-1 border rounded-md bg-gray-100">1</span>
              <button className="px-2 py-1 hover:text-[#0B2149]">&gt;</button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default TeamManagementPage;
