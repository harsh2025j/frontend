"use client";
import { UserData } from "@/data/features/profile/profile.types";
import { useProfileActions } from "@/data/features/profile/useProfileActions";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import Loader from "@/components/ui/Loader";
import { fetchUsers } from "@/data/features/users/usersThunks";
import { useAppDispatch, useAppSelector } from "@/data/redux/hooks";
import { useDocTitle } from "@/hooks/useDocTitle";


const TeamManagementPage: React.FC = () => {
  useDocTitle("Team Management  | Sajjad Husain Law Associates");
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
        <main className="flex-1 pt-4">
          <div className="mx-auto bg-white rounded-2xl shadow p-4">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 bg-gray rounded-xl px-6 py-3">
              <div className="text-sm md:text-base">
                <strong>Total Team:</strong> {filteredUsers?.length || 0}
              </div>
              <button
                onClick={() => router.push('/admin/teams/add-new-member')}
                className="bg-[#0B2149] text-white px-5 py-2 rounded-md font-medium hover:bg-[#1a3a75] transition-colors flex items-center gap-2"
              >
                <span>+</span> Invite New Member
              </button>
            </div>

            {/* Mobile/Tablet Card View */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:hidden mb-6">
              {loading || !filteredUsers ? (
                // Skeleton
                [...Array(4)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl shadow p-5 animate-pulse flex flex-col gap-4">
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-8 bg-gray-200 rounded w-full mt-auto"></div>
                  </div>
                ))
              ) : filteredUsers.length === 0 ? (
                <div className="col-span-full text-center py-10 text-gray-500 bg-white rounded-xl shadow">
                  No team members found.
                </div>
              ) : (
                filteredUsers.map((member) => (
                  <div key={member._id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex flex-col gap-4">
                    <div className="border-b border-gray-100 pb-3 flex justify-between items-start">
                      <div>
                        <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">User</span>
                        <h3 className="text-lg font-bold text-[#0A2342]">{member.name}</h3>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${member.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {member.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>

                    <div className="space-y-3 text-sm text-gray-600">
                      <div className="flex flex-col gap-1">
                        <span className="font-medium text-gray-900">Email:</span>
                        <span className="truncate">{member.email}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="font-medium text-gray-900">Roles:</span>
                        <div className="flex flex-wrap gap-1">
                          <TruncatedList items={member.roles || []} />
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="font-medium text-gray-900">Permissions:</span>
                        <div className="flex flex-wrap gap-1">
                          <TruncatedList items={member.permissions || []} />
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => router.push(`/admin/teams/edit/${member._id}`)}
                      className="mt-auto w-full bg-[#0B2149] text-white py-2 rounded-lg text-sm font-medium hover:bg-[#1a3a75] transition-colors flex items-center justify-center gap-2"
                    >
                      Manage Member
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Table */}
            <div className="hidden lg:block overflow-x-auto rounded-xl bg-lightgray">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-100 text-gray-700 border-b border-bordercolor">
                  <tr>
                    <th className="py-3 px-4 text-sm font-medium">#</th>
                    <th className="py-3 px-4 text-sm font-medium">User</th>
                    <th className="py-3 px-4 text-sm font-medium">Email</th>
                    <th className="py-3 px-4 text-sm font-medium">Role</th>
                    <th className="py-3 px-4 text-sm font-medium">Permissions</th>
                    <th className="py-3 px-4 text-sm font-medium">Status</th>
                    <th className="py-3 px-4 text-sm font-medium">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {loading || !filteredUsers ? (
                    <tr>
                      <td colSpan={7} className="text-center py-10">
                        <Loader size="lg" text="Loading Team..." />
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
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
                          <TruncatedList items={member.roles || []} />
                        </td>
                        <td className="py-3 px-4 text-sm">
                          <TruncatedList items={member.permissions || []} />
                        </td>
                        <td className="py-3 px-4 text-sm">
                          <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full font-medium">
                            {member.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="py-3 px-4 flex gap-2 ">
                          <button onClick={() => router.push(`/admin/teams/edit/${member._id}`)} className="bg-[#0B2149] text-white px-4 py-1 rounded-md text-sm hover:bg-gray-400">
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

// Helper component for truncating lists (Roles/Permissions)
function TruncatedList({ items }: { items: { _id?: string; id?: string; name: string }[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [style, setStyle] = useState<React.CSSProperties>({});
  const containerRef = React.useRef<HTMLDivElement>(null);
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  const calculateStyle = () => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;

    const newStyle: React.CSSProperties = {
      left: rect.left,
      position: 'fixed',
      zIndex: 9999,
    };

    // Flip up if space below is tight (<200px)
    if (spaceBelow < 200) {
      newStyle.bottom = window.innerHeight - rect.top + 4;
      newStyle.maxHeight = rect.top - 20; // prevent overflow top
    } else {
      newStyle.top = rect.bottom + 4;
      newStyle.maxHeight = window.innerHeight - rect.bottom - 20; // prevent overflow bottom
    }

    setStyle(newStyle);
  };

  // Close on click outside or Scroll
  useEffect(() => {
    // Generic click listener for outside clicks
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      window.addEventListener("scroll", () => setIsOpen(false), true);
      document.addEventListener("mousedown", handleClick);
    }

    return () => {
      window.removeEventListener("scroll", () => setIsOpen(false), true);
      document.removeEventListener("mousedown", handleClick);
    };
  }, [isOpen]);

  if (!items || items.length === 0) {
    return <span className="text-gray-400 text-sm">-</span>;
  }

  const displayedItems = items.slice(0, 1);
  const remainingCount = items.length - 1;

  return (
    <div className="relative flex flex-wrap gap-1 items-center" ref={containerRef}>
      {displayedItems.map((item) => (
        <span
          key={item._id || item.id}
          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100 whitespace-nowrap"
        >
          {item.name}
        </span>
      ))}

      {remainingCount > 0 && (
        <div
          className="relative"
          onMouseEnter={() => { calculateStyle(); setIsOpen(true); }}
          onMouseLeave={() => setIsOpen(false)}
        >
          <button
            ref={buttonRef}
            onClick={(e) => { e.preventDefault(); calculateStyle(); setIsOpen(!isOpen); }}
            className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium transition-colors cursor-pointer
                          ${isOpen
                ? "bg-blue-600 text-white border border-blue-600"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200"
              }`}
          >
            +{remainingCount}
          </button>

          {/* Fixed Tooltip (Z-Axis Independent) */}
          {isOpen && (
            <div
              className="fixed bg-white border border-gray-100 rounded-lg shadow-xl p-3 flex flex-col gap-1.5 w-max min-w-[120px] max-w-[200px]"
              style={style}
            >
              {items.slice(1).map((item) => (
                <span
                  key={item._id || item.id}
                  className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100 shadow-sm"
                >
                  {item.name}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
