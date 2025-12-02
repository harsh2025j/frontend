import { createAsyncThunk } from "@reduxjs/toolkit";
import { articleApi } from "@/data/services/article-service/article-service";
import { CreateArticleResponse, ArticleListResponse, CreateArticleRequest } from "./article.types";
import { MESSAGES } from "@/lib/constants/messageConstants";
import { ApiError } from "@/lib/utils/errorHandler";

export const createArticle = createAsyncThunk<CreateArticleResponse, CreateArticleRequest>(
  "article/createArticle",
  async (formData, thunkAPI) => {
    try {
      let res = await articleApi.createArticle(formData);
      // console.log("at articlthunk", formData);
      // console.log("hiiiiiiiiiiii")
      // console.log("res.data", res.data)
      return res.data;
    } catch (err: unknown) {
      const apiError = err as ApiError;
      return thunkAPI.rejectWithValue(apiError.message || MESSAGES.ARTICLE_CREATE_FAIL);
    }
  }
);

export const fetchArticles = createAsyncThunk<ArticleListResponse, any | void>(
  "article/fetchArticles",
  async (params, thunkAPI) => {
    try {
      const res = await articleApi.fetchArticles(params);
      // console.log("Article Thunk Success - Raw Data received:", res.data);
      return res.data;
    } catch (err: unknown) {
      const apiError = err as ApiError;
      return thunkAPI.rejectWithValue(apiError.message || MESSAGES.ARTICLE_FETCH_FAIL);
    }
  }
);
