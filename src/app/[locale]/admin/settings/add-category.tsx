"use client";

import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { useAppDispatch } from "@/data/redux/hooks";
import { createCategory, updateCategory } from "@/data/features/category/categoryThunks";
import { Category } from "@/data/features/category/category.types";

export default function AddCategory({
  onClose,
  onSave,
  parentId,
  categoryToEdit,
}: {
  onClose: () => void;
  onSave?: (success: boolean) => void;
  parentId?: string | null;
  categoryToEdit?: Category | null;
}) {
  const [categoryName, setCategoryName] = useState("");
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (categoryToEdit) {
      setCategoryName(categoryToEdit.name);
    }
  }, [categoryToEdit]);

  const handleSave = async () => {
    if (!categoryName) {
      toast.error("Please enter a category name");
      return;
    }

    setLoading(true);

    try {
      // Generate unique slug from category name
      const baseSlug = categoryName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");

      // Only append suffix for new categories to ensure uniqueness
      // For updates, we might want to keep the slug clean or update it similarly
      // The requirement was to update name and slug
      const uniqueSuffix = Date.now().toString().slice(-6);
      const generatedSlug = categoryToEdit ? baseSlug : `${baseSlug}-${uniqueSuffix}`;

      let resultAction;

      if (categoryToEdit) {
        const payload = {
          id: categoryToEdit.id,
          name: categoryName,
          slug: generatedSlug, // Updating slug as well based on new name
        };
        resultAction = await dispatch(updateCategory(payload));
      } else {
        const payload: any = { name: categoryName, slug: generatedSlug };
        if (parentId) {
          payload.parentId = parentId;
        }
        resultAction = await dispatch(createCategory(payload));
      }

      if (
        (categoryToEdit && updateCategory.fulfilled.match(resultAction)) ||
        (!categoryToEdit && createCategory.fulfilled.match(resultAction))
      ) {
        toast.success(categoryToEdit ? "Successfully updated" : "Successfully added");
        if (onSave) {
          onSave(true);
        }
        onClose();
      } else {
        if (resultAction.payload) {
          toast.error(resultAction.payload as string);
        } else {
          toast.error(categoryToEdit ? "Failed to update category" : "Failed to add category");
        }
      }
    } catch (error: any) {
      // console.error(error);
      toast.error(error.message || "Error saving category");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-xl w-150 shadow-xl space-y-4">
      <h2 className="text-2xl font-semibold mb-4">
        {categoryToEdit
          ? "Edit Category"
          : parentId
            ? "Add Sub Category"
            : "Add New Category"}
      </h2>

      <div className="space-y-3">
        <label className="font-medium">
          {categoryToEdit ? "Category Name" : parentId ? "Sub Category" : "Category"}
        </label>
        <input
          className="border p-2 rounded w-full"
          placeholder={
            categoryToEdit
              ? "Enter category name"
              : parentId
                ? "Enter sub category"
                : "Enter category"
          }
          value={categoryName}
          required
          onChange={(e) => setCategoryName(e.target.value)}
        />
      </div>

      <div className="flex gap-3 pt-4">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-300 rounded w-full"
        >
          Cancel
        </button>

        <button
          className="px-4 py-2 bg-black text-white rounded w-full"
          onClick={handleSave}
          disabled={loading}
        >
          {loading ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}
