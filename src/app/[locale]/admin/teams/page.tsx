"use client";
import { UserData } from "@/data/features/profile/profile.types";
import { useProfileActions } from "@/data/features/profile/useProfileActions";
import React, { useEffect, useState, useCallback, Suspense } from "react";
import Loader from "@/components/ui/Loader";
import { useDocTitle } from "@/hooks/useDocTitle";
import { teamsApi } from "@/data/services/teams-service/teamsService";
import { User } from "@/data/features/users/users.types";
import Pagination from "@/components/Pagination";
import toast from "react-hot-toast";
import { Search } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import { useSearchParams, useRouter } from "next/navigation";

const TeamManagementPageContent: React.FC = () => {
  useDocTitle("Team Management | Sajjad Husain Law Associates");
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useProfileActions();

  // --- Derived from URL ---
  const currentPage = parseInt(searchParams.get("page") || "1");
  const urlSearch = searchParams.get("q") || "";

  // --- Local State for Input ---
  const [searchTerm, setSearchTerm] = useState(urlSearch);
  const debouncedSearchTerm = useDebounce(searchTerm, 600);

  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 15;

  const updateUrl = (updates: Record<string, string | number | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value !== "" && value !== null && value !== undefined) {
        params.set(key, value.toString());
      } else {
        params.delete(key);
      }
    });
    router.push(`/admin/teams?${params.toString()}`);
  };

  // Sync debounced search to URL
  useEffect(() => {
    if (debouncedSearchTerm !== urlSearch) {
      updateUrl({ q: debouncedSearchTerm, page: 1 });
    }
  }, [debouncedSearchTerm]);


  const fetchTeamData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await teamsApi.fetchTeams({
        page: currentPage,
        limit,
        name: urlSearch,
      });
      const paginatedData = response.data;
      setTeamMembers(paginatedData.data || []);
      setTotal(paginatedData.total || 0);
      setTotalPages(Math.ceil((paginatedData.total || 0) / limit));
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch team members");
    } finally {
      setLoading(false);
    }
  }, [currentPage, urlSearch]);

  useEffect(() => {
    fetchTeamData();
  }, [fetchTeamData]);



  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0A2342]">Team Management</h1>
          <p className="text-gray-500 text-sm mt-1">Manage users created by you</p>
        </div>
        <button
          onClick={() => router.push('/admin/teams/add-new-member')}
          className="bg-[#0B2149] text-white px-5 py-2.5 rounded-lg font-medium hover:bg-[#1a3a75] transition-colors flex items-center gap-2 shadow-sm"
        >
          <span>+</span> Invite New Member
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50/50 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search team members..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="text-sm font-medium text-gray-600">
            Total Team Members: <span className="text-[#0A2342] font-bold">{total}</span>
          </div>
        </div>

        {/* Mobile View */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:hidden p-4">
          {loading ? (
            [...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 animate-pulse flex flex-col gap-4">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-8 bg-gray-200 rounded w-full mt-auto"></div>
              </div>
            ))
          ) : teamMembers.length === 0 ? (
            <div className="col-span-full text-center py-10 text-gray-500">
              No team members found.
            </div>
          ) : (
            teamMembers.map((member) => (
              <div key={member._id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex flex-col gap-4 hover:shadow-md transition-shadow">
                <div className="border-b border-gray-100 pb-3 flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-[#0A2342]">{member.name}</h3>
                    <p className="text-sm text-gray-500">{member.email}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${member.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {member.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex flex-col gap-1">
                    <span className="font-semibold text-gray-700 uppercase text-[10px] tracking-wider">Roles</span>
                    <TruncatedList items={member.roles || []} />
                  </div>
                </div>

                <button
                  onClick={() => router.push(`/admin/teams/edit/${member._id}`)}
                  className="mt-auto w-full border border-[#0B2149] text-[#0B2149] py-2 rounded-lg text-sm font-medium hover:bg-[#0B2149] hover:text-white transition-all flex items-center justify-center gap-2"
                >
                  Manage Member
                </button>
              </div>
            ))
          )}
        </div>

        {/* Desktop View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-gray-500 border-b border-gray-200">
              <tr>
                <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider">User</th>
                <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider">Email</th>
                <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider">Roles</th>
                <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider">Status</th>
                <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 bg-white">
              {loading ? (
                [...Array(10)].map((_, i) => (
                  <tr key={i} className="animate-pulse border-b border-gray-100">
                    <td className="py-4 px-6"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
                    <td className="py-4 px-6"><div className="h-4 bg-gray-200 rounded w-48"></div></td>
                    <td className="py-4 px-6">
                      <div className="flex gap-1">
                        <div className="h-5 bg-gray-200 rounded-full w-16"></div>
                        <div className="h-5 bg-gray-200 rounded-full w-20"></div>
                      </div>
                    </td>
                    <td className="py-4 px-6"><div className="h-6 bg-gray-200 rounded-full w-20"></div></td>
                    <td className="py-4 px-6 text-right"><div className="h-4 bg-gray-200 rounded w-12 ml-auto"></div></td>
                  </tr>
                ))
              ) : teamMembers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-gray-500">
                    No team members found.
                  </td>
                </tr>
              ) : (
                teamMembers.map((member) => (
                  <tr key={member._id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6 font-medium text-gray-900">{member.name}</td>
                    <td className="py-4 px-6 text-gray-600">{member.email}</td>
                    <td className="py-4 px-6">
                      <TruncatedList items={member.roles || []} />
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${member.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {member.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => router.push(`/admin/teams/edit/${member._id}`)}
                        className="text-[#0B2149] hover:text-[#C9A227] font-medium text-sm transition-colors"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-200 bg-gray-50/30">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => updateUrl({ page })}
            />
          </div>
        )}
      </div>
    </div>
  );
};

const TeamManagementPage: React.FC = () => {
  return (
    <Suspense fallback={<Loader />}>
      <TeamManagementPageContent />
    </Suspense>
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

    if (spaceBelow < 200) {
      newStyle.bottom = window.innerHeight - rect.top + 4;
      newStyle.maxHeight = rect.top - 20;
    } else {
      newStyle.top = rect.bottom + 4;
      newStyle.maxHeight = window.innerHeight - rect.bottom - 20;
    }

    setStyle(newStyle);
  };

  useEffect(() => {
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
