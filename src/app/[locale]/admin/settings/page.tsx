"use client";

import React, { useState, useEffect } from "react";
import AddCategory from "./add-category";

import { toast } from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "@/data/redux/hooks";
import { fetchCategories, deleteCategory } from "@/data/features/category/categoryThunks";
import { Category } from "@/data/features/category/category.types";
import { UserData } from "@/data/features/profile/profile.types";
import { useRouter } from "next/navigation";
import { useProfileActions } from "@/data/features/profile/useProfileActions";
import Loader from "@/components/ui/Loader";

export default function Settings() {

    const router = useRouter();
    const { user: reduxUser } = useProfileActions();
    const user = reduxUser as UserData;
    const [isAuthorized, setIsAuthorized] = useState(false);
    useEffect(() => {
        // if (loading) return;

        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

        // 1. No Token? -> Go to Login
        if (!token) {
            router.replace("/auth/login");
            return;
        }

        // 2. Role Check
        if (user?.roles?.length) {
            const allowedRoles = ["admin", "superadmin"];
            // console.log("user111", user);
            const hasAccess = user.roles.some((r) => allowedRoles.includes(r.name));
            // console.log("hasAccess", hasAccess);
            if (!hasAccess) {
                router.replace("/auth/login");
            }
            else {
                setIsAuthorized(true)
            }
        }
    }, [user, router]);



    const [openCategoryPopup, setOpenCategoryPopup] = useState(false);
    const [selectedParentId, setSelectedParentId] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

    const dispatch = useAppDispatch();
    const { categories, loading } = useAppSelector((state) => state.category);

    useEffect(() => {
        dispatch(fetchCategories());
    }, [dispatch]);

    const handleAddCategory = (parentId: string | null = null) => {
        setSelectedParentId(parentId);
        setSelectedCategory(null);
        setOpenCategoryPopup(true);
    };

    const handleEditCategory = (category: Category) => {
        setSelectedCategory(category);
        setSelectedParentId(null);
        setOpenCategoryPopup(true);
    };

    const handleCategorySaved = () => {
        dispatch(fetchCategories());
        setOpenCategoryPopup(false);
        setSelectedCategory(null);
    };

    const handleDeleteCategory = async (id: string) => {
        if (confirm("Are you sure you want to delete this category?")) {
            const resultAction = await dispatch(deleteCategory(id));
            if (deleteCategory.fulfilled.match(resultAction)) {
                toast.success("Category deleted successfully");
                dispatch(fetchCategories());
            } else {
                toast.error("Failed to delete category");
            }
        }
    };
    if (!isAuthorized) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-50">
                <Loader size="lg" text="Checking Permissions..." />
            </div>
        );
    }
    // Recursive function to render categories
    const renderCategoryRow = (category: Category, level: number = 0) => {
        return (
            <React.Fragment key={category.id}>
                <tr className="border-t hover:bg-gray-50">
                    <td className="p-2 pl-4" style={{ paddingLeft: `${level * 20 + 10}px` }}>
                        <div className="flex items-center gap-2">
                            {level > 0 && <span className="text-gray-400">↳</span>}
                            <span>{category.name}</span>
                        </div>
                    </td>
                    <td className="p-2 text-gray-500">{category.slug}</td>
                    <td className="p-2">
                        <div className="flex gap-2">
                            <button
                                className="px-2 py-1 bg-blue-100 text-blue-600 rounded text-sm hover:bg-blue-200"
                                onClick={() => handleAddCategory(category.id)}
                                title="Add Subcategory"
                            >
                                + Sub
                            </button>
                            <button
                                className="px-2 py-1 bg-yellow-100 text-yellow-600 rounded text-sm hover:bg-yellow-200"
                                onClick={() => handleEditCategory(category)}
                            >
                                Edit
                            </button>
                            <button
                                className="px-2 py-1 bg-red-100 text-red-600 rounded text-sm hover:bg-red-200"
                                onClick={() => handleDeleteCategory(category.id)}
                            >
                                Delete
                            </button>
                        </div>
                    </td>
                </tr>
                {category.children &&
                    category.children.length > 0 &&
                    category.children.map((child) => renderCategoryRow(child, level + 1))}
            </React.Fragment>
        );
    };

    return (
        <div className="p-8 space-y-8">
            <h2 className="text-2xl font-semibold">Settings</h2>

            {/* Organization & Branding */}
            {/* <section className="space-y-4">
                <h3 className="text-xl font-semibold">Organization & Branding</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="border p-4 rounded-xl space-y-4">
                        <p className="font-medium">Firm Logo</p>
                        <div className="h-24 w-48 border rounded-lg flex items-center justify-center bg-gray-100">
                            LOGO
                        </div>
                        <button className="px-4 py-2 bg-black text-white rounded-lg">
                            Upload File
                        </button>
                    </div>

                    <div className="border p-4 rounded-xl space-y-4">
                        <p className="font-medium">Firm Name</p>
                        <input
                            className="border rounded-lg w-full p-2"
                            defaultValue="Sajjad Husain Law Associates"
                        />
                    </div>
                </div>
            </section> */}



            {/* Category Management */}
            <section className="space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-xl font-semibold">Category Management</h3>
                    <button
                        className="px-8 py-2 bg-yellow-500 text-black rounded-3xl"
                        onClick={() => handleAddCategory(null)}
                    >
                        Add New Category
                    </button>
                </div>
                <div className="border border-[#1A73E8] rounded-2xl overflow-hidden mt-5">
                    <table className="w-full">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="p-2 text-left pl-4">Category Name</th>
                                <th className="p-2 text-left">Slug</th>
                                <th className="p-2 text-left">Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {loading && (!categories || categories.length === 0) ? (
                                <tr>
                                    <td colSpan={3} className="p-4 text-center text-gray-500">
                                        Loading...
                                    </td>
                                </tr>
                            ) : categories && categories.length > 0 ? (
                                categories.map((category) => renderCategoryRow(category))
                            ) : (
                                <tr>
                                    <td colSpan={3} className="p-4 text-center text-gray-500">
                                        No categories found. Add one to get started.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            {openCategoryPopup && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <AddCategory
                        onClose={() => setOpenCategoryPopup(false)}
                        onSave={handleCategorySaved}
                        parentId={selectedParentId}
                        categoryToEdit={selectedCategory}
                    />
                </div>
            )}
        </div>
    );
}
