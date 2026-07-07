"use client";
import { useEffect, useState, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/data/redux/hooks";
import { MESSAGES } from "@/lib/constants/messageConstants";
import toast from "react-hot-toast";
import { CreateArticleRequest, Advocate } from "./article.types";
import { resetArticleState } from "./articleSlice";
import { fetchArticles, createArticle } from "./articleThunks";
// test
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
    updates: [],
    category: "",
    slug: "",
    advocateName: "",
    advocates: [],
    language: "English/हिन्दी",
    author: "",
    content: "",
    isPaywalled: false,
    isCommentsEnabled: true,
    tags: [],
    thumbnail: null,
    documents: [],
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

  // const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  //   if (e.target.files && e.target.files[0]) {
  //     setFormData((prev) => ({
  //       ...prev,
  //       thumbnail: e.target.files![0],
  //     }));
  //   }
  // };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      const maxSize = 5 * 1024 * 1024;

      if (file.size > maxSize) {
        toast.error("Thumbnail must be less than 5MB");
        e.target.value = "";
        return;
      }

      setFormData((prev) => ({
        ...prev,
        thumbnail: file,
      }));
    }
  };

  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>, additionalExistingNames: string[] = []) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      const maxSize = 10 * 1024 * 1024; // 10MB

      const validFiles = newFiles.filter(file => {
        if (file.size > maxSize) {
          toast.error(`Document ${file.name} is too large (max 10MB)`);
          return false;
        }
        return true;
      });

      if (validFiles.length > 0) {
        const existingNames = [...(formData.documents || []).map((f: any) => f.name || ''), ...additionalExistingNames];
        const uniqueNewFiles = validFiles.filter(f => !existingNames.includes(f.name));
        
        if (uniqueNewFiles.length !== validFiles.length) {
          toast.error("Some files were skipped because they are already added.", { id: 'duplicate-file-toast' });
        }
        
        if (uniqueNewFiles.length > 0) {
          setFormData((prev: CreateArticleRequest) => {
            const currentExistingNames = [...(prev.documents || []).map((f: any) => f.name || ''), ...additionalExistingNames];
            const trulyUnique = uniqueNewFiles.filter(f => !currentExistingNames.includes(f.name));
            return {
              ...prev,
              documents: [...(prev.documents || []), ...trulyUnique],
            };
          });
        }
      }

      // Reset input value to allow selecting same file again if needed
      e.target.value = "";
    }
  };

  const handleRemoveDocument = (index: number) => {
    setFormData((prev: CreateArticleRequest) => ({
      ...prev,
      documents: (prev.documents || []).filter((_, i) => i !== index),
    }));
  };


  const handleContentChange = (content: string) => {
    setFormData((prev: CreateArticleRequest) => ({
      ...prev,
      content,
    }));
  };

  const handleAddTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !formData.tags.includes(trimmedTag)) {
      setFormData((prev: CreateArticleRequest) => ({
        ...prev,
        tags: [...(prev.tags || []), trimmedTag],
      }));
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev: CreateArticleRequest) => ({
      ...prev,
      tags: (prev.tags || []).filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleAddTimelineUpdate = () => {
    const newId = Math.random().toString(36).substr(2, 9);
    setFormData((prev: CreateArticleRequest) => ({
      ...prev,
      updates: [
        ...(prev.updates || []),
        { _localId: newId, updateDate: new Date().toISOString().split('T')[0], title: "", content: "" }
      ],
    }));
    return newId;
  };

  const handleUpdateTimelineUpdate = (id: string, field: "updateDate" | "title" | "content", value: string | Date) => {
    setFormData((prev: CreateArticleRequest) => {
      const idx = (prev.updates || []).findIndex(u => u._localId === id);
      if (idx === -1) return prev;

      const newUpdates = [...(prev.updates || [])];
      newUpdates[idx] = { ...newUpdates[idx], [field]: value };

      return { ...prev, updates: newUpdates };
    });
  };

  const handleRemoveTimelineUpdate = (id: string) => {
    setFormData((prev: CreateArticleRequest) => ({
      ...prev,
      updates: (prev.updates || []).filter((u) => u._localId !== id),
    }));
  };

  const handleCreateArticle = async (status: "draft" | "pending") => {
    if (status !== 'draft' && (!formData.title || !formData.content)) {
      toast.error("Please fill in the Title and Main Content.");
      return Promise.reject(new Error("Please fill in the Title and Main Content."));
    }

    // The backend now completely handles slug generation
    // upon submission (pending/published status).
    return dispatch(createArticle({ ...formData, status })).unwrap();
  };

  // Form reset and toast logic has been moved to the UI component 
  // to prevent auto-save from accidentally wiping the form.

  return {
    formData,
    handleChange,
    handleContentChange,
    handleFileUpload,
    handleDocumentUpload,
    handleRemoveDocument,
    handleCreateArticle,
    handleAddTag,
    handleRemoveTag,
    handleAddTimelineUpdate,
    handleUpdateTimelineUpdate,
    handleRemoveTimelineUpdate,
    setAdvocates: (advocates: Advocate[]) => {
      setFormData((prev: CreateArticleRequest) => ({
        ...prev,
        advocates,
      }));
    },
    handleRemoveExistingDocument: (id: string) => {
      setFormData((prev: CreateArticleRequest) => ({
        ...prev,
        removedDocumentIds: [...(prev.removedDocumentIds || []), id],
      }));
    },
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
    // Expose a method to force refresh manually if needed (e.g. Pull to Refresh)
    refetch: (force: boolean = false) => {
      const now = Date.now();
      if ((force || (!isFetching && (now - lastFetchTime) > FETCH_COOLDOWN))) {
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