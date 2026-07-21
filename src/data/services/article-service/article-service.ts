import apiClient from "../apiConfig/apiClient";
import { API_ENDPOINTS } from "../apiConfig/apiContants";
import { CreateArticleRequest, CreateArticleResponse, ArticleListResponse } from "@/data/features/article/article.types";

export const articleApi = {

  createArticle: async (data: CreateArticleRequest) => {
    // console.log("Create Article Request URLgjgfghfhgghf:", `${API_ENDPOINTS.ARTICLE.CREATE}`);
    // console.log("During sending to endpoijnt", data);
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("slug", data.slug);
    formData.append("content", data.content);
    formData.append("subHeadline", data.subHeadline);
    formData.append("isPaywalled", String(data.isPaywalled));
    formData.append("isCommentsEnabled", String(data.isCommentsEnabled ?? true));
    formData.append("language", data.language);
    if (data.location) formData.append("location", data.location);
    formData.append("authors", data.author);
    if (data.thumbnail) formData.append("file", data.thumbnail);
    if (data.documents && data.documents.length > 0) {
      data.documents.forEach((doc) => {
        formData.append("documents", doc);
      });
    }
    formData.append("advocateName", data.advocateName);
    if (data.advocates && data.advocates.length > 0) {
      formData.append("advocates", JSON.stringify(data.advocates));
    }
    formData.append("categoryId", data.category);
    formData.append("status", data.status || "draft");
    if (Array.isArray(data.tags)) {
      formData.append("tags", data.tags.join(", "));
    }
    if (data.updates && data.updates.length > 0) {
      formData.append("updates", JSON.stringify(data.updates));
    }

    // console.log(formData.get("tags"));
    // console.log("form data send to backed ",formData)
    const response = await apiClient.post<CreateArticleResponse>(
      API_ENDPOINTS.ARTICLE.CREATE,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    // console.log("Create Article API Response:", response.data);
    return response;
  },


  fetchArticleById: async (id: string) => {
    const response = await apiClient.get<any>(`${API_ENDPOINTS.ARTICLE.FETCH_ALL}/${id}`);
    return response;
  },

  fetchArticles: async (params?: any) => {
    // console.log("Fetch Articles Request URL:", ` ${API_ENDPOINTS.ARTICLE.FETCH_ALL}`);
    const response = await apiClient.get<ArticleListResponse>(

      API_ENDPOINTS.ARTICLE.FETCH_ALL,
      {
        params,
        // headers: {
        //    "ngrok-skip-browser-warning": "true",
        // },
      }

    );
    // console.log("Fetch Articles API Response:", response.data);
    return response;
  },

  fetchMultipleArticles: async (ids: string[]) => {
    const response = await apiClient.post<any>(
      API_ENDPOINTS.ARTICLE.FETCH_MULTI,
      { ids }
    );
    return response;
  },

  approveArticle: async (articleId: string) => {
    const response = await apiClient.patch(
      API_ENDPOINTS.ARTICLE.APPROVE.replace(":id", articleId)
    );
    return response;
  },

  rejectArticle: async (articleId: string, reason?: string) => {
    const response = await apiClient.patch(
      API_ENDPOINTS.ARTICLE.REJECT.replace(":id", articleId),
      { rejectionReason: reason }
    );
    return response;
  },

  // Delete an article
  deleteArticle: async (articleId: string) => {
    const response = await apiClient.delete(
      `${API_ENDPOINTS.ARTICLE.CREATE}/${articleId}` // DELETE /articles/{id}
    );
    return response;
  },

  // Update an article
  updateArticle: async (articleId: string, data: CreateArticleRequest) => {
    // console.log("data", data)

    const formData = new FormData();

    // Append standard fields
    formData.append("categoryId", data.category);
    formData.append("title", data.title);
    formData.append("slug", data.slug);
    formData.append("content", data.content);
    formData.append("subHeadline", data.subHeadline);
    formData.append("advocateName", data.advocateName);
    if (data.location) formData.append("location", data.location);
    formData.append("language", data.language);
    formData.append("authors", data.author);
    formData.append("isPaywalled", String(data.isPaywalled));
    formData.append("isCommentsEnabled", String(data.isCommentsEnabled ?? true));

    formData.append("status", data.status || "pending");

    if (Array.isArray(data.tags)) {
      formData.append("tags", data.tags.join(", "));
    }
    if (data.thumbnail && data.thumbnail instanceof File) {
      formData.append("file", data.thumbnail);
    }
    if (data.updates && data.updates.length > 0) {
      formData.append("updates", JSON.stringify(data.updates));
    }
    if (data.documents && data.documents.length > 0) {
      data.documents.forEach((doc) => {
        formData.append("documents", doc);
      });
    }

    if (data.removedDocumentIds && data.removedDocumentIds.length > 0) {
      formData.append("removedDocumentIds", data.removedDocumentIds.join(","));
    }

    if (data.advocates && data.advocates.length > 0) {
      formData.append("advocates", JSON.stringify(data.advocates));
    }

    // console.log(formData.get("tags"));
    // console.log(formData.get("isPaywalled"));

    const response = await apiClient.patch<CreateArticleResponse>(
      `${API_ENDPOINTS.ARTICLE.CREATE}/${articleId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response;
  },

  triggerDailyNews: async (max?: number, authorName?: string) => {
    const response = await apiClient.post<any>("/tasks/trigger-daily-news", { max, authorName });
    return response;
  },

  searchAdvocates: async (query: string, page: number = 1, limit: number = 12) => {
    const response = await apiClient.get<any>(`${API_ENDPOINTS.PROFILE.ADVOCATES}`, {
      params: {
        name: query,
        page,
        limit
      }
    });
    return response;
  },

  trackView: async (articleId: string, userIdentifier: string) => {
    const response = await apiClient.post<any>(
      API_ENDPOINTS.ARTICLE.TRACK_VIEW.replace(":id", articleId),
      { userIdentifier }
    );
    return response;
  },

  toggleLike: async (articleId: string) => {
    const response = await apiClient.post<{ liked: boolean; totalLikes: number }>(
      API_ENDPOINTS.ARTICLE.TOGGLE_LIKE.replace(":id", articleId)
    );
    return response;
  },

  getLikeStatus: async (articleId: string) => {
    const response = await apiClient.get<{ hasLiked: boolean }>(
      `/articles/${articleId}/like-status`
    );
    return response;
  },

  getComments: async (articleId: string, page: number = 1, limit: number = 10) => {
    return await apiClient.get<any>(`/articles/${articleId}/comments`, { params: { page, limit } });
  },

  getReplies: async (commentId: string, page: number = 1, limit: number = 10) => {
    return await apiClient.get<any>(`/comments/${commentId}/replies`, { params: { page, limit } });
  },

  createComment: async (articleId: string, data: { content: string; parentId?: string; mentionedUserIds?: string[] }) => {
    return await apiClient.post<any>(`/articles/${articleId}/comments`, data);
  },

  updateComment: async (commentId: string, data: { content: string }) => {
    return await apiClient.patch<any>(`/comments/${commentId}`, data);
  },

  deleteComment: async (commentId: string) => {
    return await apiClient.delete<any>(`/comments/${commentId}`);
  },

  toggleComments: async (articleId: string) => {
    return await apiClient.patch<any>(`/articles/${articleId}/toggle-comments`);
  },
};
