"use client";

import React, { useState, useEffect } from "react";
import AddCategory from "../settings/add-category";
import { toast } from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "@/data/redux/hooks";
import { fetchCategories, deleteCategory } from "@/data/features/category/categoryThunks";
import { Category } from "@/data/features/category/category.types";
import { UserData } from "@/data/features/profile/profile.types";
import { useRouter } from "next/navigation";
import { useProfileActions } from "@/data/features/profile/useProfileActions";
import Loader from "@/components/ui/Loader";
import { useDocTitle } from "@/hooks/useDocTitle";

export default function CategoryManagement() {
    useDocTitle("Category Management | Sajjad Husain Law Associates");
    const router = useRouter();
    const { user: reduxUser } = useProfileActions();
    const user = reduxUser as UserData;
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (!token) {
            router.replace("/auth/login");
            return;
        }

        if (user?.roles?.length) {
            const allowedRoles = ["admin", "superadmin", "editor", "creator"];
            const hasAccess = user.roles.some((r) => allowedRoles.includes(r.name));
            if (!hasAccess) {
                router.replace("/auth/login");
            } else {
                setIsAuthorized(true);
            }
        }
    }, [user, router]);

    const [openCategoryPopup, setOpenCategoryPopup] = useState(false);
    const [selectedParentId, setSelectedParentId] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

    const dispatch = useAppDispatch();
    const { categories, loading } = useAppSelector((state) => state.category);

    useEffect(() => {
        if (isAuthorized) {
            dispatch(fetchCategories());
        }
    }, [dispatch, isAuthorized]);

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

    // Recursive function to render categories as a visual tree
    const renderCategoryTree = (category: Category, isLast: boolean, level: number = 0) => {
        return (
            <div key={category.id} className="relative">
                <div className="flex items-center group py-2">
                    {/* Visual Connector Lines */}
                    {level > 0 && (
                        <div className="flex">
                            {[...Array(level)].map((_, i) => (
                                <div key={i} className="w-8 flex justify-center flex-shrink-0">
                                    <div className="w-0.5 bg-gray-200 h-full"></div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="flex items-center flex-1 ml-2">
                        <div className="flex items-center gap-3 bg-white border border-gray-100 p-3 rounded-2xl shadow-sm hover:shadow-md hover:border-blue-200 transition-all flex-1">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                </svg>
                            </div>

                            <div className="flex-1">
                                <h4 className="font-bold text-gray-800">{category.name}</h4>
                                <p className="text-xs text-gray-400 font-mono">/{category.slug}</p>
                            </div>

                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    onClick={() => handleAddCategory(category.id)}
                                    title="Add Subcategory"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                </button>
                                <button
                                    className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                                    onClick={() => handleEditCategory(category)}
                                    title="Edit"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                </button>
                                <button
                                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                    onClick={() => handleDeleteCategory(category.id)}
                                    title="Delete"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {category.children && category.children.length > 0 && (
                    <div className="transition-all">
                        {category.children.map((child, index) =>
                            renderCategoryTree(child, index === category.children!.length - 1, level + 1)
                        )}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-20">
            <header className="flex flex-col gap-2">
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Category Structure</h1>
                <p className="text-gray-600 max-w-2xl">
                    Manage the content tree for your platform. Subcategories inherit properties from their parent nodes.
                </p>
            </header>

            <div className="bg-white/50 backdrop-blur-sm border border-gray-100 rounded-3xl p-6 shadow-sm">
                <div className="flex justify-between items-center mb-10">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
                        <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                        Hierarchical Tree View
                    </div>
                    <button
                        className="px-6 py-2.5 bg-[#0B2149] text-white hover:bg-[#1a3a75] transition-all rounded-xl font-semibold shadow-lg hover:shadow-xl active:scale-95 flex items-center gap-2"
                        onClick={() => handleAddCategory(null)}
                    >
                        <span className="text-xl">+</span> Add Root Category
                    </button>
                </div>

                <div className="space-y-2">
                    {loading && (!categories || categories.length === 0) ? (
                        <div className="py-20 text-center">
                            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-gray-500 animate-pulse">Building tree structure...</p>
                        </div>
                    ) : categories && categories.length > 0 ? (
                        categories.map((category, index) =>
                            renderCategoryTree(category, index === categories.length - 1, 0)
                        )
                    ) : (
                        <div className="py-20 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                            <p className="text-gray-400 font-medium">No categories created yet.</p>
                            <button
                                onClick={() => handleAddCategory(null)}
                                className="mt-4 text-blue-600 font-bold hover:underline"
                            >
                                Create your first category →
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {openCategoryPopup && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="w-full max-w-lg">
                        <AddCategory
                            onClose={() => setOpenCategoryPopup(false)}
                            onSave={handleCategorySaved}
                            parentId={selectedParentId}
                            categoryToEdit={selectedCategory}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
