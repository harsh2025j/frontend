"use client";
import { useEffect, useState, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/data/redux/hooks";
import { MESSAGES } from "@/lib/constants/messageConstants";
import toast from "react-hot-toast";
import { CreateArticleRequest } from "./article.types";
import { resetArticleState } from "./articleSlice";
import { fetchArticles, createArticle } from "./articleThunks";

// Selectors
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
    location: "",
    subHeadline: "",
    category: "",
    slug: "",
    advocateName: "",
    language: "English/हिन्दी",
    author: "",
    content: "",
    tags: [],
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({
        ...prev,
        thumbnail: e.target.files![0],
      }));
    }
  };

  const handleContentChange = (content: string) => {
    setFormData((prev) => ({
      ...prev,
      content,
    }));
  };

  const handleAddTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !formData.tags.includes(trimmedTag)) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, trimmedTag],
      }));
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleCreateArticle = (status: "draft" | "pending") => {
    if (!formData.title || !formData.content) {
      toast.error("Please fill in the Title and Main Content.");
      return;
    }

    if (!formData.thumbnail) {
      toast.error("Please upload a thumbnail image.");
      return;
    }

    // Generate unique slug from title
    const baseSlug = formData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
    const uniqueSuffix = Date.now().toString().slice(-6);
    const generatedSlug = `${baseSlug}-${uniqueSuffix}`;

    dispatch(createArticle({ ...formData, slug: generatedSlug, status }));
  };

  useEffect(() => {
    if (!!message) {
      // setFormData({
      //   title: "",
      //   category: "",
      //   location: "",
      //   slug: "",
      //   subHeadline: "",
      //   advocateName: "",
      //   language: "English/हिन्दी",
      //   author: "",
      //   content: "",
      //   tags: [],
      //   thumbnail: null,
      // });

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
    handleAddTag,
    handleRemoveTag,
    loading,
    error,
    message,
    setFormData,
  };
};

// Global flag to prevent multiple simultaneous fetches
let isFetching = false;
let lastFetchTime = 0;
const FETCH_COOLDOWN = 5000; // 5 seconds cooldown between fetches

export const useArticleListActions = () => {
  const dispatch = useAppDispatch();

  const articles = useAppSelector(selectArticles);
  const loading = useAppSelector(selectArticleLoading);
  const error = useAppSelector(selectArticleError);
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    const now = Date.now();
    const timeSinceLastFetch = now - lastFetchTime;

    // Only fetch if:
    // 1. We haven't fetched yet in this component instance
    // 2. Articles array is empty
    // 3. Not currently loading
    // 4. Not currently fetching globally
    // 5. Cooldown period has passed
    if (
      !hasFetchedRef.current &&
      articles.length === 0 &&
      !loading &&
      !isFetching &&
      timeSinceLastFetch > FETCH_COOLDOWN
    ) {
      isFetching = true;
      hasFetchedRef.current = true;
      lastFetchTime = now;

      dispatch(fetchArticles({}))
        .finally(() => {
          isFetching = false;
        });
    }
  }, [dispatch, articles.length, loading]);

  return {
    articles,
    loading,
    error,
    // Expose a method to force refresh manually if needed (e.g. Pull to Refresh)
    refetch: () => {
      const now = Date.now();
      if (!isFetching && (now - lastFetchTime) > FETCH_COOLDOWN) {
        isFetching = true;
        lastFetchTime = now;
        return dispatch(fetchArticles({}))
          .finally(() => {
            isFetching = false;
          });
      }
      return Promise.resolve();
    },
  };
};