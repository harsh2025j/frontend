"use client";

import React, { useState, useEffect, useMemo } from "react";
import AddCategory from "./add-category";

import { toast } from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "@/data/redux/hooks";
import { fetchCategories, deleteCategory } from "@/data/features/category/categoryThunks";
import { UserData } from "@/data/features/profile/profile.types";
import { User } from "@/data/features/users/users.types";
import { useRouter } from "next/navigation";
import { useProfileActions } from "@/data/features/profile/useProfileActions";
import Loader from "@/components/ui/Loader";
import { useDocTitle } from "@/hooks/useDocTitle";


import { fetchUsers } from "@/data/features/users/usersThunks";

export default function Settings() {
    useDocTitle("Settings | Sajjad Husain Law Associates");
    const router = useRouter();
    const dispatch = useAppDispatch();

    const { user } = useProfileActions();

    const { users, loading: usersLoading } = useAppSelector((state) => state.users);


    useEffect(() => {
        dispatch(fetchUsers());
    }, [dispatch]);

    // Filter users to only show those created by the current admin (same logic as team management page)
    const filteredUsers = useMemo(() => {
        if (!user || !user._id || !users) return [];
        return users.filter((u) => u.createdBy?._id === user._id);
    }, [users, user]);


    return (
        <div className="space-y-8 pb-12">
            <header className="space-y-4">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Platform Settings</h1>
                    <div className="h-1.5 w-20 bg-[#0B2149] rounded-full"></div>
                </div>

                <div className="bg-blue-50 border-l-4 border-[#0B2149] p-6 rounded-r-2xl shadow-sm">
                    <p className="text-gray-700 leading-relaxed text-lg">
                        Welcome to the central administrative hub. This page is dedicated to <strong>Team Management</strong> and organizational oversight.
                        As an administrator, you can invite new colleagues, manage their access levels, and monitor the active team hierarchy from here.
                    </p>
                    <p className="text-gray-600 mt-4 text-sm italic">
                        Note: Category Management has been moved to the <span className="font-semibold text-[#0B2149]">Content</span> section in the sidebar for better organization.
                    </p>
                </div>
            </header>

            {/* Team Management Section */}
            <section className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h3 className="text-xl font-bold text-gray-800">Your Team</h3>
                        <p className="text-gray-500 text-sm">Overview of team members you have invited to the platform.</p>
                    </div>
                    <button
                        className="px-6 py-2.5 bg-[#0B2149] text-white hover:bg-[#1a3a75] transition-all rounded-xl font-semibold shadow-lg hover:shadow-xl active:scale-95 flex items-center gap-2"
                        onClick={() => router.push('/admin/teams/add-new-member')}
                    >
                        <span className="text-xl">+</span> Invite New Member
                    </button>
                </div>

                <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="p-5 text-sm font-semibold text-gray-600">Member Name</th>
                                    <th className="p-5 text-sm font-semibold text-gray-600">Email Address</th>
                                    <th className="p-5 text-sm font-semibold text-gray-600 hidden md:table-cell">Role</th>
                                    <th className="p-5 text-sm font-semibold text-gray-600">Status</th>
                                    <th className="p-5 text-sm font-semibold text-gray-600 text-right">Action</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-50">
                                {usersLoading ? (
                                    <tr>
                                        <td colSpan={5} className="p-12 text-center">
                                            <div className="flex justify-center flex-col items-center gap-3">
                                                <div className="w-10 h-10 border-4 border-[#0B2149] border-t-transparent rounded-full animate-spin"></div>
                                                <span className="text-gray-500 font-medium">Loading your team...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredUsers.length > 0 ? (
                                    filteredUsers.map((member: User) => (
                                        <tr key={member._id} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="p-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-[#0B2149]/10 text-[#0B2149] flex items-center justify-center font-bold text-lg">
                                                        {member.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <span className="font-semibold text-gray-900 group-hover:text-[#0B2149] transition-colors">{member.name}</span>
                                                </div>
                                            </td>
                                            <td className="p-5 text-gray-600">{member.email}</td>
                                            <td className="p-5 hidden md:table-cell">
                                                <div className="flex flex-wrap gap-1">
                                                    {member.roles?.map((role: { name: string }) => (
                                                        <span key={role.name} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md text-xs font-medium border border-gray-200 uppercase">
                                                            {role.name}
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="p-5">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${member.isActive
                                                    ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                                                    : "bg-rose-100 text-rose-700 border border-rose-200"
                                                    }`}>
                                                    {member.isActive ? "Active" : "Inactive"}
                                                </span>
                                            </td>
                                            <td className="p-5 text-right">
                                                <button
                                                    onClick={() => router.push(`/admin/teams/edit/${member._id}`)}
                                                    className="px-4 py-1.5 text-sm font-semibold text-[#0B2149] hover:bg-[#0B2149] hover:text-white border border-[#0B2149] rounded-lg transition-all"
                                                >
                                                    Manage
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="p-16 text-center text-gray-500">
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="p-4 bg-gray-50 rounded-full text-gray-300">
                                                    <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                                    </svg>
                                                </div>
                                                <p className="text-xl font-medium text-gray-600">Your team is empty</p>
                                                <p className="text-gray-400 max-w-xs mx-auto text-sm">Start building your administrative team by inviting your first member today.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            <section className="mt-12 bg-gray-50 rounded-3xl p-8 border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-4">About Team Management</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-2">
                        <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center font-bold">1</div>
                        <h4 className="font-bold text-gray-900">Granular Access</h4>
                        <p className="text-sm text-gray-600 leading-relaxed">Assign specific roles and permissions to each team member to ensure secure and efficient workflow across the legal platform.</p>
                    </div>
                    <div className="space-y-2">
                        <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center font-bold">2</div>
                        <h4 className="font-bold text-gray-900">Collaboration</h4>
                        <p className="text-sm text-gray-600 leading-relaxed">Enable multiple legal associates to work on cases, content, and reports simultaneously with individual tracking.</p>
                    </div>
                    <div className="space-y-2">
                        <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center font-bold">3</div>
                        <h4 className="font-bold text-gray-900">Security First</h4>
                        <p className="text-sm text-gray-600 leading-relaxed">Monitor activation status and easily revoke access for members who are no longer part of the firm's administrative operations.</p>
                    </div>
                </div>
            </section>
        </div>
    );
}

