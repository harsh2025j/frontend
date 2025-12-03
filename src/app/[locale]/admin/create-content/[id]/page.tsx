"use client";
import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useCreateArticleActions } from "@/data/features/article/useArticleActions";
import { useAppDispatch, useAppSelector } from "@/data/redux/hooks";
import { fetchCategories } from "@/data/features/category/categoryThunks";
import { Category } from "@/data/features/category/category.types";
import RichTextEditor from "@/components/ui/RichTextEditor";
import { useParams, useRouter } from "next/navigation";
import { useProfileActions } from "@/data/features/profile/useProfileActions";
import { UserData } from "@/data/features/profile/profile.types";
import { articleApi } from "@/data/services/article-service/article-service";

const EditArticlePage: React.FC = () => {
    const { id } = useParams();
    const articleId = Array.isArray(id) ? id[0] : id;

    const {
        formData,
        setFormData,
        handleChange,
        handleContentChange,
        handleFileUpload,
        handleAddTag,
        handleRemoveTag,
        loading: createLoading,
    } = useCreateArticleActions();

    const [loading, setLoading] = useState(false);
    const [tagInput, setTagInput] = React.useState("");

    const router = useRouter();
    const { user: reduxUser } = useProfileActions();
    const user = reduxUser as UserData;

    useEffect(() => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (!token) {
            router.replace("/auth/login");
            return;
        }
        if (user?.roles?.length) {
            const hasAccess = user.roles.some((r) => r.name !== "user");
            if (!hasAccess) {
                router.replace("/auth/login");
            }
        }
    }, [user, router]);

    const dispatch = useAppDispatch();
    const { categories } = useAppSelector((state) => state.category);

    useEffect(() => {
        dispatch(fetchCategories());
    }, [dispatch]);

    // Fetch article details
    useEffect(() => {
        const fetchArticleDetails = async () => {
            if (!articleId) return;

            setLoading(true);
            try {
                // We need a method to fetch a single article. 
                // Assuming fetchArticles can filter by ID or we filter from the list, 
                // but ideally we should have a getArticleById endpoint.
                // For now, let's try to fetch all and find it, or use a specific endpoint if available.
                // Looking at article-service, there isn't a getById. 
                // I'll assume we can use fetchArticles with a param or I'll add getById.
                // Let's try fetching all and finding it for now as a fallback, 
                // but really we should add getArticleById to the service.

                // Actually, let's check if we can filter by ID in fetchArticles params
                const response = await articleApi.fetchArticles();
                // response.data is the body, response.data.data is the array of articles
                const articles = response.data.data || [];
                const article = articles.find((a: any) => a.id === articleId);

                if (article) {
                    setFormData({
                        title: article.title,
                        category: (typeof article.category === 'object' ? article.category?.id : article.category) || "",
                        location: article.location || "",
                        slug: article.slug,
                        subHeadline: article.subHeadline || "",
                        advocateName: article.advocateName || "",
                        language: article.language || "English/हिन्दी",
                        author: article.authors || "",
                        content: article.content,
                        tags: Array.isArray(article.tags) ? article.tags : (typeof article.tags === 'string' ? (article.tags as string).split(',') : []),
                        thumbnail: null, // We can't set file object from URL easily, handled separately or just show preview
                        status: article.status === 'published' ? 'publish' : 'draft'
                    });
                    // If we want to show the existing thumbnail, we might need a separate state for preview URL
                    // The existing code uses useMemo on formData.thumbnail. 
                    // We might need to adjust that logic to support string URL for existing image.
                    if (article.thumbnail) {
                        setExistingThumbnailUrl(article.thumbnail);
                    }
                } else {
                    toast.error("Article not found");
                    router.push("/admin/content-management");
                }
            } catch (error) {
                console.error("Failed to fetch article", error);
                toast.error("Failed to load article details");
            } finally {
                setLoading(false);
            }
        };

        fetchArticleDetails();
    }, [articleId, setFormData, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await handleUpdate("publish");
    };

    const handleUpdate = async (status: "draft" | "publish") => {
        if (!formData.title || !formData.content) {
            toast.error("Please fill in the Title and Main Content.");
            return;
        }

        setLoading(true);
        try {
            // We pass the formData object directly. The service handles FormData construction.
            await articleApi.updateArticle(articleId!, formData);

            toast.success("Article updated successfully");
            router.push("/admin/content-management");
        } catch (error: any) {
            console.error("Update failed", error);
            toast.error(error?.message || "Failed to update article");
        } finally {
            setLoading(false);
        }
    };

    const flattenCategories = (cats: Category[], prefix = ""): { id: string; name: string }[] => {
        let options: { id: string; name: string }[] = [];
        cats.forEach((cat) => {
            if (cat.children && cat.children.length > 0) {
                options = options.concat(flattenCategories(cat.children, prefix + cat.name + " > "));
            } else {
                options.push({ id: cat.id, name: prefix + cat.name });
            }
        });
        return options;
    };

    const categoryOptions = useMemo(() => {
        return flattenCategories(categories || []);
    }, [categories]);

    // Handle preview URL for existing image vs new upload
    // Since we don't store the existing URL in formData (it has File | null), 
    // we might need a local state or just rely on the fact that if formData.thumbnail is null, 
    // we might want to show the existing one. 
    // But I didn't save the existing URL in the fetch. 
    // Let's add a state for existingThumbnailUrl.
    const [existingThumbnailUrl, setExistingThumbnailUrl] = useState<string | null>(null);

    const previewUrl = useMemo(() => {
        if (formData.thumbnail) {
            return URL.createObjectURL(formData.thumbnail);
        }
        return existingThumbnailUrl;
    }, [formData.thumbnail, existingThumbnailUrl]);


    return (
        <div className="flex min-h-screen bg-gray-50 text-gray-800">
            <main className="flex-1 w-full p-3 sm:p-4 md:p-6 lg:p-8">
                <h1 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 px-2">Edit Content</h1>
                <div className="max-w-6xl mx-auto bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-sm">
                    <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit}>

                        {/* Category + Advocate Name */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                            <div>
                                <label className="block text-sm font-medium mb-1.5">Category</label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    className="w-full border rounded-lg px-3 py-2.5 bg-gray-50 text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                >
                                    <option value="">Select Category</option>
                                    {categoryOptions.map((opt) => (
                                        <option key={opt.name} value={opt.id}>
                                            {opt.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1.5">Advocate Name</label>
                                <input type="text"
                                    name="advocateName"
                                    placeholder="Enter Advocate Name"
                                    value={formData.advocateName}
                                    onChange={handleChange}
                                    className="w-full border rounded-lg px-3 py-2.5 bg-gray-50 text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>
                        </div>

                        {/* Headline */}
                        <div>
                            <label className="block text-sm font-medium mb-1.5">Headline</label>
                            <input
                                type="text"
                                name="title"
                                placeholder="Enter article headline..."
                                value={formData.title}
                                onChange={handleChange}
                                className="w-full border rounded-lg px-3 py-2.5 bg-gray-50 text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                        </div>

                        {/* Sub Headline */}
                        <div>
                            <label className="block text-sm font-medium mb-1.5">Sub Headline</label>
                            <input
                                type="text"
                                name="subHeadline"
                                placeholder="Enter article sub headline..."
                                value={formData.subHeadline}
                                onChange={handleChange}
                                className="w-full border rounded-lg px-3 py-2.5 bg-gray-50 text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        {/* Slug */}
                        <div>
                            <label className="block text-sm font-medium mb-1.5">Slug</label>
                            <input
                                type="text"
                                name="slug"
                                placeholder="Enter slug of article"
                                value={formData.slug}
                                onChange={handleChange}
                                className="w-full border rounded-lg px-3 py-2.5 bg-gray-50 text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                        </div>

                        {/* Tags + Location */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                            <div>
                                <label className="block text-sm font-medium mb-1.5">Tags</label>
                                <div className="space-y-2">
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={tagInput}
                                            onChange={(e) => setTagInput(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    if (tagInput.trim()) {
                                                        handleAddTag(tagInput);
                                                        setTagInput("");
                                                    }
                                                }
                                            }}
                                            placeholder="Type tag and press Enter..."
                                            className="flex-1 border rounded-lg px-3 py-2 bg-gray-50 text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (tagInput.trim()) {
                                                    handleAddTag(tagInput);
                                                    setTagInput("");
                                                }
                                            }}
                                            className="bg-primary hover:bg-primary/80 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                                        >
                                            Add
                                        </button>
                                    </div>
                                    {formData.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-2 p-2 border rounded-lg bg-gray-50">
                                            {formData.tags.map((tag, i) => (
                                                <span
                                                    key={i}
                                                    className="bg-blue-100 text-blue-700 text-xs sm:text-sm px-3 py-1.5 rounded-full flex items-center gap-2 group hover:bg-blue-200 transition-colors"
                                                >
                                                    {tag}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveTag(tag)}
                                                        className="text-blue-600 hover:text-red-600 font-bold transition-colors"
                                                        aria-label={`Remove ${tag} `}
                                                    >
                                                        ×
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1.5">Location</label>
                                <input type="text"
                                    name="location"
                                    placeholder="Enter Location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    className="w-full border rounded-lg px-3 py-2.5 bg-gray-50 text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>
                        </div>

                        {/* Language + Author */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                            <div>
                                <label className="block text-sm font-medium mb-1.5">Language</label>
                                <select
                                    name="language"
                                    value={formData.language}
                                    onChange={handleChange}
                                    className="w-full border rounded-lg px-3 py-2.5 bg-gray-50 text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                >
                                    <option value="English/हिन्दी">English/हिन्दी</option>
                                    <option value="English">English</option>
                                    <option value="Hindi">Hindi</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1.5">Authors</label>
                                <input
                                    type="text"
                                    name="author"
                                    placeholder="Enter author Name..."
                                    value={formData.author}
                                    onChange={handleChange}
                                    className="w-full border rounded-lg px-3 py-2.5 bg-gray-50 text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>
                        </div>

                        {/* Thumbnail */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                            <div className="border rounded-lg p-4 sm:p-6 bg-gray-50 flex items-center justify-center h-40 sm:h-48 order-2 md:order-1">
                                {previewUrl ? (
                                    <img src={previewUrl} alt="Preview" className="max-h-full max-w-full object-contain rounded" />
                                ) : (
                                    <span className="text-gray-400 text-sm">Preview Thumbnail</span>
                                )}
                            </div>

                            <label className="border-2 border-dashed rounded-lg p-4 sm:p-6 cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-center flex-col h-40 sm:h-48 order-1 md:order-2">
                                <input
                                    type="file"
                                    name="thumbnail"
                                    className="hidden"
                                    onChange={handleFileUpload}
                                    accept="image/*"
                                />
                                <svg className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                                <span className="text-gray-500 text-sm text-center">Click to upload thumbnail</span>

                                {formData.thumbnail && (
                                    <p className="text-xs text-blue-500 mt-2 text-center truncate max-w-full px-2">{formData.thumbnail.name}</p>
                                )}
                            </label>
                        </div>

                        {/* Content Editor */}
                        <div>
                            <label className="block text-sm font-medium mb-2">Main Content Editor</label>
                            <div className="border rounded-lg overflow-hidden">
                                <RichTextEditor
                                    value={formData.content}
                                    onChange={handleContentChange}
                                    placeholder="Write your content here..."
                                />
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 mt-6 sm:mt-8 pt-4 border-t">
                            <button
                                type="button"
                                className="w-full sm:w-auto bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={() => handleUpdate("draft")}
                                disabled={loading}
                            >
                                Save Draft
                            </button>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full sm:w-auto bg-[#0B2149] hover:bg-[#0a1a3a] text-white px-6 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? "Updating..." : "Update Content"}
                            </button>
                        </div>

                    </form>
                </div>
            </main>
        </div>
    );
};

export default EditArticlePage;
