import { createAsyncThunk } from "@reduxjs/toolkit";
import { categoryApi } from "@/data/services/category-service/category-service";
import { CategoryResponse, CreateCategoryRequest, UpdateCategoryRequest } from "./category.types";
import { ApiError } from "@/lib/utils/errorHandler";

export const fetchCategories = createAsyncThunk<CategoryResponse, void>(
    "category/fetchCategories",
    async (_, thunkAPI) => {
        try {
            const res = await categoryApi.fetchCategories();
            // console.log("fetchCategories", res.data);
            // console.log(res.data);
            return res.data;
        } catch (err: unknown) {
            const apiError = err as ApiError;
            return thunkAPI.rejectWithValue(apiError.message || "Failed to fetch categories");
        }
    }
);

export const createCategory = createAsyncThunk<CategoryResponse, CreateCategoryRequest>(
    "category/createCategory",
    async (data, thunkAPI) => {
        try {
            const res = await categoryApi.createCategory(data);
            return res.data;
        } catch (err: unknown) {
            const apiError = err as ApiError;
            return thunkAPI.rejectWithValue(apiError.message || "Failed to create category");
        }
    }
);

export const updateCategory = createAsyncThunk<CategoryResponse, UpdateCategoryRequest>(
    "category/updateCategory",
    async (data, thunkAPI) => {
        try {
            const res = await categoryApi.updateCategory(data);
            return res.data;
        } catch (err: unknown) {
            const apiError = err as ApiError;
            return thunkAPI.rejectWithValue(apiError.message || "Failed to update category");
        }
    }
);

export const deleteCategory = createAsyncThunk<CategoryResponse, string>(
    "category/deleteCategory",
    async (id, thunkAPI) => {
        try {
            const res = await categoryApi.deleteCategory(id);
            return res.data;
        } catch (err: unknown) {
            const apiError = err as ApiError;
            return thunkAPI.rejectWithValue(apiError.message || "Failed to delete category");
        }
    }
);
