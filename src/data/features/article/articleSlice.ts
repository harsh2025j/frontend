import { createSlice } from "@reduxjs/toolkit";
import { createArticle, fetchArticles } from "./articleThunks";
import { ArticleState } from "./article.types";
import { MESSAGES } from "@/lib/constants/messageConstants";

const initialState: ArticleState = {
  loading: false,
  error: null,
  message: null,
  articles: [],
};

const articleSlice = createSlice({
  name: "article",
  initialState,
  reducers: {
    resetArticleState: (state) => {
      state.error = null;
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createArticle.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(createArticle.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message || MESSAGES.ARTICLE_CREATE_SUCCESS;

      })
      .addCase(createArticle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })


      .addCase(fetchArticles.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(fetchArticles.fulfilled, (state, action) => {
        state.loading = false;
        // FIX: Correctly access the articles array from the 'data' property
        const payload: any = action.payload as any;
        state.articles = payload.data || [];
      })
      .addCase(fetchArticles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetArticleState } = articleSlice.actions;
export default articleSlice.reducer;