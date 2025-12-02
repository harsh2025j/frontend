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
    formData.append("isPaywalled", "false");
    formData.append("language", data.language);
    if (data.location) formData.append("location", data.location);
    formData.append("authors", data.author);
    if (data.thumbnail) formData.append("file", data.thumbnail);
    formData.append("advocateName", data.advocateName);
    formData.append("categoryId", data.category);
    // formData.append("status", data.status || "draft");
    // formData.append("tags", data.tags.join(","));
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


  fetchArticles: async (params?: any) => {
    // console.log("Fetch Articles Request URL:", ` ${API_ENDPOINTS.ARTICLE.FETCH_ALL}`);
    const response = await apiClient.get<ArticleListResponse>(

      API_ENDPOINTS.ARTICLE.FETCH_ALL,
      {
        params,
        headers: {
          // "ngrok-skip-browser-warning": "true",
        },
      }

    );
    // console.log("Fetch Articles API Response:", response.data);
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
  updateArticle: async (articleId: string, data: any) => {
    const payload = {
      title: data.title,
      slug: data.slug,
      content: data.content,
      subHeadline: data.subHeadline,
      advocateName: data.advocateName,
      location: data.location,
      language: data.language,
      authors: data.authors || data.author,
      thumbnail: typeof data.thumbnail === "string" ? data.thumbnail : undefined,
      isPaywalled: data.isPaywalled,
    };

    const response = await apiClient.patch<CreateArticleResponse>(
      `${API_ENDPOINTS.ARTICLE.CREATE}/${articleId}`,
      payload
    );
    return response;
  },
};
