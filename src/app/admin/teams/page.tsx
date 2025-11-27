"use client";
import { UserData } from "@/data/features/profile/profile.types";
import { useProfileActions } from "@/data/features/profile/useProfileActions";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import addNewMemberPage from "./add-new-member/page";

interface TeamMember {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
}

const TeamManagementPage: React.FC = () => {
  
  const router = useRouter();
  const { user: reduxUser} = useProfileActions();
    const user = reduxUser as UserData;
    useEffect(() => {
  
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
      if (!token) {
        router.replace("/auth/login");
        return;
      }

      if (user?.role) {
        const currentRole = user.role.name;
        const allowedRoles = ["admin", "super_admin"];
        if (!allowedRoles.includes(currentRole)) {
          router.replace("/auth/login"); 
        }
      }
    }, [user, router]);
  
   const addNewMember=()=>{
    router.push("/admin/teams/add-new-member")
  }
  const teamList: TeamMember[] = [
    { id: 1, name: "Sameer Raoe", email: "Example@example.com", role: "Editor", status: "Working" },
    { id: 2, name: "Sameer Raoe", email: "Example@example.com", role: "Admin", status: "Working" },
    { id: 3, name: "Sameer Raoe", email: "Example@example.com", role: "Support", status: "Working" },
    { id: 4, name: "Sameer Raoe", email: "Example@example.com", role: "Designer", status: "Working" },
    { id: 5, name: "Sameer Raoe", email: "Example@example.com", role: "Editor", status: "Working" },
    { id: 6, name: "Sameer Raoe", email: "Example@example.com", role: "Editor", status: "Working" },
    { id: 7, name: "Sameer Raoe", email: "Example@example.com", role: "Editor", status: "Working" },
    { id: 8, name: "Sameer Raoe", email: "Example@example.com", role: "Manager", status: "Working" },
  ];

  return (
    <div>
      <h1 className="text-xl  font-poppins text-black font-medium">Team Management</h1>

    <div className="flex min-h-screen bg-gray-50 text-gray-800">
     
       

      <main className="flex-1 p-6">
        <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow p-8">
          <h1 className="text-2xl font-semibold mb-6"></h1>

          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 bg-gray rounded-xl px-6 py-3">
            <div className="text-sm md:text-base">
              <strong>Total Team:</strong> 8
            </div>
            <button className="bg-yellow-400 text-white px-5 py-2 rounded-md font-medium hover:bg-yellow-500" onClick={addNewMember}>
              + Invite new Member
            </button>
          </div>
          

          {/* Filters */}
          <div className="flex bg-gray rounded-xl px-6 py-3 flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium">Role:</label>
              <select className="border rounded-md px-3 py-2 bg-gray-50 focus:outline-none">
                <option>All</option>
                <option>Admin</option>
                <option>Editor</option>
                <option>Designer</option>
                <option>Support</option>
                <option>Manager</option>
              </select>
            </div>
            <div className=" w-full md:w-80">
              <input
                type="text"
                placeholder="Search name or roles..."
                className="w-full border rounded-md px-4 py-2 pl-10 bg-gray-50 focus:outline-none"
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="absolute left-1 top-2.5 h-5 w-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 21l-4.35-4.35m0 0A5.5 7.4 0 1120.65 16.63z"
                />
              </svg>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto  rounded-xl bg-lightgray">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-100 text-gray-700 border-b border-bordercolor">
                <tr>
                  <th className="py-3 px-4  text-sm font-medium">#</th>
                  <th className="py-3 px-4  text-sm font-medium">User</th>
                  <th className="py-3 px-4  text-sm font-medium">Email</th>
                  <th className="py-3 px-4  text-sm font-medium">Role</th>
                  <th className="py-3 px-4  text-sm font-medium">Status</th>
                  <th className="py-3 px-4 text-sm font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {teamList.map((member) => (
                  <tr
                    key={member.id}
                    className="border-b-1 border-bordercolor hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-3 px-4  text-sm">{member.id}</td>
                    <td className="py-3 px-4  text-sm">{member.name}</td>
                    <td className="py-3 px-4  text-sm">{member.email}</td>
                    <td className="py-3 px-4  text-sm">{member.role}</td>
                    <td className="py-3 px-4  text-sm">
                      <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full font-medium">
                        {member.status}
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
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
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
