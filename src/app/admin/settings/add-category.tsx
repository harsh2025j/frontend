"use client";

import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { useAppDispatch } from "@/data/redux/hooks";
import { createCategory } from "@/data/features/category/categoryThunks";

export default function AddCategory({
  onClose,
  onSave,
  parentId,
}: {
  onClose: () => void;
  onSave?: (success: boolean) => void;
  parentId?: string | null;
}) {
  const [category, setCategory] = useState("");
  const [slug, setSlug] = useState("");
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();

  const handleSave = async () => {
    if (!category || !slug) {
      toast.error("Please fill all fields");
      return;
    }

    setLoading(true);

    try {
      const payload: any = { name: category, slug };
      if (parentId) {
        payload.parentId = parentId;
      }

      const resultAction = await dispatch(createCategory(payload));

      if (createCategory.fulfilled.match(resultAction)) {
        toast.success("Successfully added");
        if (onSave) {
          onSave(true);
        }
        onClose();
      } else {
        if (resultAction.payload) {
          toast.error(resultAction.payload as string);
        } else {
          toast.error("Failed to add category");
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
        {parentId ? "Add Sub Category" : "Add New Category"}
      </h2>

      <div className="space-y-3">
        <label className="font-medium">Category</label>
        <input
          className="border p-2 rounded w-full"
          placeholder="Enter category"
          value={category}
          required
          onChange={(e) => setCategory(e.target.value)}
        />
      </div>

      <div className="space-y-3">
        <label className="font-medium">Slug</label>
        <input
          className="border p-2 rounded w-full"
          placeholder="Add a slug"
          value={slug}
          required
          onChange={(e) => setSlug(e.target.value)}
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
