"use client";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/data/redux/hooks";
// import { createArticle, fetchArticles } from ".";
import { MESSAGES } from "@/lib/constants/messageConstants";
import toast from "react-hot-toast";
import { CreateArticleRequest } from "./article.types";
import { resetArticleState } from "./articleSlice";
import { fetchArticles, createArticle } from "./articleThunks";

const selectArticleLoading = (state: any) => state.article.loading;
const selectArticleError = (state: any) => state.article.error;
const selectArticleMessage = (state: any) => state.article.message;
const selectArticles = (state: any) => state.article.articles;


export const useCreateArticleActions = () => {
  const dispatch = useAppDispatch();
  const loading = useAppSelector(selectArticleLoading);
  const error = useAppSelector(selectArticleError);
  const message = useAppSelector(selectArticleMessage);
  const [formData, setFormData] = useState<CreateArticleRequest>({
  title: "",
  location:"",
  subHeadline:"",
  category: "",
  slug: "",
  advocateName: "",
  language: "English/हिन्दी",
  author: "",
  content: "",
  tags: ["Legal", "Constitution", "Constitution"],
  thumbnail: null,
 });


const handleChange = (
  e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
) => {
  const { name, value } = e.target;

  setFormData((prev) => ({
    ...prev,
    [name]: value,
  }));
};

const handleFileUpload = async(e: React.ChangeEvent<HTMLInputElement>) => {
  if (e.target.files && e.target.files[0]) {
    setFormData((prev) => ({
      ...prev,
      thumbnail: e.target.files![0],
    }));
  }
};

const updateTags = (newTags: string[]) => {
  setFormData((prev) => ({
    ...prev,
    tags: newTags,
  }));
};

 

  const handleContentChange = (content: string) => {
    setFormData((prev) => ({
      ...prev,
      content,
    }));
  };

  const handleCreateArticle = () => {
  if (!formData.title || !formData.content) {
    toast.error("Please fill in the Title and Main Content.");
    return;
  }

  if (!formData.thumbnail) {
    toast.error("Please upload a thumbnail image.");
    return;
  }
  
  dispatch(createArticle(formData));
};

useEffect(() => {
  if (!!message) {
    setFormData({
      title: "",
      category: "",
      location:"",
      slug: "",
      subHeadline:"",
      advocateName: "",
      language: "English/हिन्दी",
      author: "",
      content: "",
      tags: ["Legal", "Constitution", "Constitution"],
      thumbnail: null,
    });

    toast.success(message);
    dispatch(resetArticleState());
  }
}, [message, dispatch]);

return {
  formData,
  handleChange,
  handleContentChange,
  handleFileUpload,
  handleCreateArticle,
  loading,
  error,
  message,
}
}

export const useArticleListActions = () => {
  const dispatch = useAppDispatch();

  const articles = useAppSelector(selectArticles);
  const loading = useAppSelector(selectArticleLoading);
  const error = useAppSelector(selectArticleError);

  useEffect(() => {
    // console.log("data fetching ");
    dispatch(fetchArticles({}));
    
  },[]);

  // useEffect(() => {
  //   // MODIFIED: Log the articles array unconditionally to console
  //   console.log("Fetched Articles (useArticleListActions hook):", articles);
  // }, [articles]);

  return {
    articles,
    loading,
    error,
  };
};

