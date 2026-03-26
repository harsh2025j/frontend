import { createSlice } from "@reduxjs/toolkit";
import { fetchCategories, createCategory, updateCategory, deleteCategory } from "./categoryThunks";
import { CategoryState } from "./category.types";

const getInitialCategories = () => {
    if (typeof window !== 'undefined') {
        const cached = localStorage.getItem("categories");
        if (cached) {
            try {
                return JSON.parse(cached);
            } catch (e) {
                console.error("Failed to parse categories from localStorage", e);
                return [];
            }
        }
    }
    return [];
};

const initialState: CategoryState = {
    categories: getInitialCategories(),
    loading: false,
    error: null,
    message: null,
};


const categorySlice = createSlice({
    name: "category",
    initialState,
    reducers: {
        resetCategoryState: (state) => {
            state.error = null;
            state.message = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Categories
            .addCase(fetchCategories.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCategories.fulfilled, (state, action) => {
                state.loading = false;
                const categories = action.payload?.data || [];
                state.categories = categories;
                if (typeof window !== 'undefined') {
                    localStorage.setItem("categories", JSON.stringify(categories));
                }
            })

            .addCase(fetchCategories.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Create Category
            .addCase(createCategory.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createCategory.fulfilled, (state, action) => {
                state.loading = false;
                state.message = "Category created successfully";
                // Optimistic update or re-fetch can be handled here or in component
            })
            .addCase(createCategory.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Update Category
            .addCase(updateCategory.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateCategory.fulfilled, (state, action) => {
                state.loading = false;
                state.message = "Category updated successfully";
            })
            .addCase(updateCategory.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Delete Category
            .addCase(deleteCategory.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteCategory.fulfilled, (state, action) => {
                state.loading = false;
                state.message = "Category deleted successfully";
            })
            .addCase(deleteCategory.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { resetCategoryState } = categorySlice.actions;
export default categorySlice.reducer;
