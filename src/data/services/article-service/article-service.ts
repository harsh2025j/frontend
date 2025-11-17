import apiClient from "../config/apiClient";
import { API_ENDPOINTS } from "../config/apiContants";
import { CreateArticleRequest, CreateArticleResponse, ArticleListResponse } from "@/data/features/article/article.types";

export const articleApi = {
  createArticle: async (data: CreateArticleRequest) => {
   
  
    console.log("Create Article Request URLgjgfghfhgghf:", `${API_ENDPOINTS.ARTICLE.CREATE}`);
     console.log("During sending to endpoijnt",data);
    const response = await apiClient.post<CreateArticleResponse>(
      API_ENDPOINTS.ARTICLE.CREATE,
      // data
          { 
            
  "title":data.title,
  "slug": data.slug,
  "content": data.content,
  "subHeadline":data.subHeadline,
  "isPaywalled": false,
  "language": data.language,
  "location":data.location,
  "authors":data.author,
  "thumbnail":"https://logo.com/abc.jpeg",  //img to the pass url
  "advocateName":data.advocateName,
}
    );
    console.log("Create Article API Response:", response.data);
    return response;
  },
  

        fetchArticles: async () => {
          console.log("Fetch Articles Request URL:", `${API_ENDPOINTS.ARTICLE.FETCH_ALL}`);
          const response = await apiClient.get<ArticleListResponse>(
            API_ENDPOINTS.ARTICLE.FETCH_ALL
          );
          console.log("Fetch Articles API Response:", response.data);
          return response;
        },

//         fetchArticles: async () => {
//   try {
//     const response = await apiClient.get<ArticleListResponse>(
//       "https://supersphenoidal-enrico-consolitorily.ngrok-free.dev/articles",
//       {
//         headers: {
//           "ngrok-skip-browser-warning": "true",
//           Accept: "application/json",
//         },
//       }
//     );

//     console.log("Fetch Articles API Response:", response.data);
//     return response;
//   } catch (e) {
//     console.log("Error fetching articles:", e);
//   }
// },

};