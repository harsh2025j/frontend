"use client";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useProfileActions } from "@/data/features/profile/useProfileActions";
import { articleApi } from "@/data/services/article-service/article-service";
import { profileApi } from "@/data/services/profile-service/profile-service";
import { Link } from "@/i18n/routing";
import toast from "react-hot-toast";
import {
  Loader2,
  Trash2,
  Reply,
  Edit2,
  Check,
  X,
  MessageSquare,
  ChevronDown,
} from "lucide-react";

interface Comment {
  id: string;
  userId: string;
  content: string;
  parentId: string | null;
  createdAt: string;
  isEdited: boolean;
  replies?: Comment[];
  replyCount?: number;
  repliesPage?: number;
  loadingReplies?: boolean;
}

interface CommentSectionProps {
  articleId: string;
}

export default function CommentSection({ articleId }: CommentSectionProps) {
  const { user } = useProfileActions();

  // ---- Accordion / lazy-load state ----
  // Comments stay collapsed by default so they never push article content
  // around or make people scroll through a wall of replies just to keep
  // reading. Nothing is fetched until the person actually opens the panel.
  const [isExpanded, setIsExpanded] = useState(false);
  const [commentCount, setCommentCount] = useState<number | null>(null);
  const hasFetchedRef = useRef(false);

  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Cache for user details
  const [usersCache, setUsersCache] = useState<Record<string, any>>({});
  const usersCacheRef = useRef<Record<string, any>>({});

  const [inputContent, setInputContent] = useState("");
  const [replyingTo, setReplyingTo] = useState<{ id: string; name: string } | null>(null);
  const [mentionedUserIds, setMentionedUserIds] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [authModalMounted, setAuthModalMounted] = useState(false);
  const [authModalVisible, setAuthModalVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  const openAuthModal = () => {
    setAuthModalMounted(true);
    setTimeout(() => setAuthModalVisible(true), 10);
  };

  const closeAuthModal = () => {
    setAuthModalVisible(false);
    setTimeout(() => setAuthModalMounted(false), 300);
  };

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const observerTarget = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;
    const strTime = hours + ":" + minutes + " " + ampm;
    return `${strTime} ${day}/${month}/${year}`;
  };

  const extractCount = (meta: any, fallbackLen: number) => {
    // Different pagination shapes exist across our services; try the
    // common keys and fall back gracefully instead of guessing wrong.
    return (
      meta?.total_comments ??
      meta?.total_items ??
      meta?.totalItems ??
      meta?.total ??
      meta?.total_count ??
      meta?.totalCount ??
      (meta?.total_pages === 1 ? fallbackLen : null)
    );
  };

  const fetchComments = async (pageNumber: number, isInitial = false) => {
    try {
      if (isInitial) setLoading(true);
      else setLoadingMore(true);

      const res = await articleApi.getComments(articleId, pageNumber, 10);
      const { data, meta } = res.data;

      const uniqueUserIds = new Set<string>();
      data.forEach((c: Comment) => {
        uniqueUserIds.add(c.userId);
        if (c.replies) c.replies.forEach((r) => uniqueUserIds.add(r.userId));
      });

      const newIdsToFetch = Array.from(uniqueUserIds).filter((id) => !usersCacheRef.current[id]);

      if (newIdsToFetch.length > 0) {
        try {
          const profilesRes = await Promise.all(
            newIdsToFetch.map((id) => profileApi.fetchPublicProfile(id).catch(() => null))
          );

          const newUsersData: Record<string, any> = {};
          profilesRes.forEach((p, idx) => {
            if (p?.data?.data) {
              newUsersData[newIdsToFetch[idx]] = p.data.data;
            } else if (p?.data) {
              newUsersData[newIdsToFetch[idx]] = p.data;
            }
          });

          usersCacheRef.current = { ...usersCacheRef.current, ...newUsersData };
          setUsersCache(usersCacheRef.current);
        } catch (e) {
          console.error("Failed to fetch some user profiles");
        }
      }

      if (isInitial) {
        setComments(data);
      } else {
        setComments((prev) => [...prev, ...data]);
      }
      setTotalPages(meta.total_pages);

      const count = extractCount(meta, data.length);
      if (count !== null && count !== undefined) setCommentCount(count);
    } catch (error) {
      toast.error("Failed to load comments");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadReplies = async (commentId: string) => {
    const comment = comments.find((c) => c.id === commentId);
    if (!comment) return;

    const pageToLoad = (comment.repliesPage || 0) + 1;

    setComments((prev) => prev.map((c) => (c.id === commentId ? { ...c, loadingReplies: true } : c)));

    try {
      const response = await articleApi.getReplies(commentId, pageToLoad, 10);
      const newReplies = response.data?.data || [];

      const uniqueUserIds = new Set<string>();
      newReplies.forEach((r: Comment) => uniqueUserIds.add(r.userId));

      const newIdsToFetch = Array.from(uniqueUserIds).filter((id) => !usersCacheRef.current[id]);

      if (newIdsToFetch.length > 0) {
        try {
          const profilesRes = await Promise.all(
            newIdsToFetch.map((id) => profileApi.fetchPublicProfile(id).catch(() => null))
          );

          const newUsersData: Record<string, any> = {};
          profilesRes.forEach((p, idx) => {
            if (p?.data?.data) {
              newUsersData[newIdsToFetch[idx]] = p.data.data;
            } else if (p?.data) {
              newUsersData[newIdsToFetch[idx]] = p.data;
            }
          });

          usersCacheRef.current = { ...usersCacheRef.current, ...newUsersData };
          setUsersCache(usersCacheRef.current);
        } catch (e) {
          console.error("Failed to fetch some user profiles");
        }
      }

      setComments((prev) =>
        prev.map((c) => {
          if (c.id === commentId) {
            const existingReplies = c.replies || [];
            const existingIds = new Set(existingReplies.map((r) => r.id));
            const filteredNew = newReplies.filter((r: Comment) => !existingIds.has(r.id));

            return {
              ...c,
              replies: [...existingReplies, ...filteredNew],
              repliesPage: pageToLoad,
              loadingReplies: false,
            };
          }
          return c;
        })
      );
    } catch (error) {
      toast.error("Failed to load replies");
      setComments((prev) => prev.map((c) => (c.id === commentId ? { ...c, loadingReplies: false } : c)));
    }
  };

  const hideReplies = (commentId: string) => {
    setComments((prev) => prev.map((c) => (c.id === commentId ? { ...c, replies: [], repliesPage: 0 } : c)));
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset everything if the article changes and fetch initial count
  useEffect(() => {
    const shouldExpand = typeof window !== 'undefined' && window.location.hash === '#comments';
    setIsExpanded(shouldExpand);
    setComments([]);
    setCommentCount(null);
    setPage(1);
    setTotalPages(1);

    if (shouldExpand) {
      hasFetchedRef.current = true;
      fetchComments(1, true);

      // Clear the hash from the URL after a short delay (so the browser can still scroll to it)
      // This prevents the '#comments' hash from "sticking" in the URL and accidentally 
      // opening the comment section on OTHER articles when you navigate around.
      setTimeout(() => {
        if (window.location.hash === '#comments') {
          window.history.replaceState(null, '', window.location.pathname + window.location.search);
        }
      }, 1000);
    } else {
      hasFetchedRef.current = false;
    }

    // Fetch comment count eagerly so the accordion shows it when closed
    articleApi.getComments(articleId, 1, 1).then(res => {
      if (res?.data?.meta) {
        const count = extractCount(res.data.meta, 0);
        if (count !== null && count !== undefined) {
          setCommentCount(count);
        }
      }
    }).catch(() => {
      // fail silently for background count fetch
    });
  }, [articleId]);

  // Listen for hash changes if the user clicks a notification while already on the page
  useEffect(() => {
    const handleHashChange = () => {
      if (typeof window !== 'undefined' && window.location.hash === '#comments') {
        setIsExpanded(true);
        if (!hasFetchedRef.current) {
          hasFetchedRef.current = true;
          fetchComments(1, true);
        }
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [articleId]); // Added articleId to prevent stale closures (showing wrong comments)

  const toggleExpand = () => {
    const next = !isExpanded;
    setIsExpanded(next);
    if (next && !hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchComments(1, true);
    }
  };

  // Clear reply state if the input becomes empty
  useEffect(() => {
    if (inputContent.trim() === '' && replyingTo) {
      setReplyingTo(null);
      setMentionedUserIds([]);
    }
  }, [inputContent, replyingTo]);

  // Handle backspace for mention tags
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Backspace') {
      const target = e.target as HTMLTextAreaElement;

      // Only trigger custom deletion if no text is currently selected
      if (target.selectionStart === target.selectionEnd) {
        const cursorPosition = target.selectionStart;
        const textBeforeCursor = inputContent.substring(0, cursorPosition);

        // Match a mention tag right before the cursor (e.g. "@super-admin")
        const match = textBeforeCursor.match(/(@[\w.-]+)$/);

        if (match) {
          e.preventDefault();
          const wordLength = match[1].length;
          const newText = inputContent.substring(0, cursorPosition - wordLength) + inputContent.substring(cursorPosition);

          setInputContent(newText);

          // Reset cursor position to where the tag started
          setTimeout(() => {
            if (inputRef.current) {
              inputRef.current.selectionStart = cursorPosition - wordLength;
              inputRef.current.selectionEnd = cursorPosition - wordLength;
            }
          }, 0);
        }
      }
    }
  };

  // Infinite Scroll Observer (only active once the panel is open)
  useEffect(() => {
    if (!isExpanded) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && page < totalPages && !loading && !loadingMore) {
          const nextPage = page + 1;
          setPage(nextPage);
          fetchComments(nextPage);
        }
      },
      { threshold: 1.0, root: panelRef.current }
    );

    const target = observerTarget.current;
    if (target) observer.observe(target);

    return () => {
      if (target) observer.unobserve(target);
    };
  }, [isExpanded, page, totalPages, loading, loadingMore]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please login to comment");
      return;
    }
    if (!inputContent.trim()) return;

    setSubmitting(true);
    try {
      const response = await articleApi.createComment(articleId, {
        content: inputContent,
        parentId: replyingTo ? replyingTo.id : undefined,
        mentionedUserIds: mentionedUserIds,
      });

      const createdCommentData = response.data?.data || response.data;

      const newComment = {
        ...createdCommentData,
        createdAt: createdCommentData.createdAt || new Date().toISOString(),
      };

      toast.success("Comment posted");
      setInputContent("");
      const wasReplyingTo = replyingTo;
      setReplyingTo(null);
      setMentionedUserIds([]);

      if (wasReplyingTo) {
        setComments((prev) =>
          prev.map((c) => {
            if (c.id === wasReplyingTo.id) {
              return {
                ...c,
                replies: [...(c.replies || []), newComment],
                replyCount: (c.replyCount || 0) + 1,
              };
            }
            return c;
          })
        );
        setCommentCount((prev) => (prev !== null ? prev + 1 : prev));
      } else {
        setComments((prev) => [newComment, ...prev]);
        setCommentCount((prev) => (prev !== null ? prev + 1 : prev));
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to post comment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (commentId: string) => {
    setDeleteConfirmId(commentId);
  };

  const confirmDelete = async () => {
    if (!deleteConfirmId) return;
    setIsDeleting(true);
    try {
      await articleApi.deleteComment(deleteConfirmId);
      toast.success("Comment deleted");

      setComments((prev) => {
        let deletedCount = 0;
        const newComments = prev
          .map((c) => {
            if (c.id === deleteConfirmId) {
              deletedCount = 1 + (c.replyCount || 0);
              return null;
            }
            if (c.replies) {
              const originalLen = c.replies.length;
              c.replies = c.replies.filter((r) => r.id !== deleteConfirmId);
              if (c.replies.length < originalLen) {
                deletedCount = 1;
                c.replyCount = Math.max(0, (c.replyCount || 1) - 1);
              }
            }
            return c;
          })
          .filter(Boolean) as Comment[];

        if (deletedCount > 0) {
          setCommentCount((count) => (count !== null ? Math.max(0, count - deletedCount) : count));
        }
        return newComments;
      });
    } catch (error) {
      toast.error("Failed to delete comment");
    } finally {
      setIsDeleting(false);
      setDeleteConfirmId(null);
    }
  };

  const handleEditSubmit = async (commentId: string) => {
    if (!editContent.trim()) return;
    try {
      await articleApi.updateComment(commentId, { content: editContent });
      toast.success("Comment updated");
      setEditingId(null);

      const updateList = (list: Comment[]): Comment[] => {
        return list.map((c: Comment): Comment => {
          if (c.id === commentId) return { ...c, content: editContent, isEdited: true };
          if (c.replies) return { ...c, replies: updateList(c.replies) };
          return c;
        });
      };
      setComments((prev) => updateList(prev));
    } catch (error) {
      toast.error("Failed to update comment");
    }
  };

  const startEdit = (comment: Comment) => {
    setEditingId(comment.id);
    setEditContent(comment.content);
  };

  const startReply = (
    commentId: string,
    authorName: string,
    authorUsername: string,
    authorId: string,
    topLevelId: string
  ) => {
    if (mounted && !user) {
      openAuthModal();
      return;
    }
    setReplyingTo({ id: topLevelId, name: authorName });
    const tag = authorUsername ? `@${authorUsername}` : `@${authorName.replace(/\s+/g, "")}`;
    setInputContent(`${tag} `);
    setMentionedUserIds((prev) => (prev.includes(authorId) ? prev : [...prev, authorId]));
    inputRef.current?.focus();
  };

  const renderComment = (comment: Comment, isReply = false) => {
    const isOwner = (user?.id || user?._id) === comment.userId;
    const isEditing = editingId === comment.id;

    const authorProfile = usersCache[comment.userId] || usersCacheRef.current[comment.userId] || (isOwner ? user : null);
    const authorName = authorProfile?.name || authorProfile?.email?.split("@")[0] || "User";
    const authorUsername = authorProfile?.username || "";
    const authorAvatar = authorProfile?.profilePicture || authorProfile?.profilePhoto || authorProfile?.avatar || null;

    return (
      <div key={comment.id} className={`flex gap-2.5 sm:gap-3 mb-4 ${isReply ? "ml-8 sm:ml-12 mt-3" : ""}`}>
        <div
          className={`relative flex-shrink-0 flex items-center justify-center text-gray-500 font-bold overflow-hidden border border-gray-200 bg-gray-100 rounded-full ${isReply ? "w-7 h-7 sm:w-8 sm:h-8 text-[11px]" : "w-9 h-9 sm:w-10 sm:h-10 text-xs"
            }`}
        >
          {authorAvatar ? (
            <Image
              src={authorAvatar.startsWith("http") || authorAvatar.startsWith("/") ? authorAvatar : `/${authorAvatar}`}
              alt={authorName}
              fill
              sizes="80px"
              className="object-cover"
              quality={85}
            />
          ) : (
            authorName.substring(0, 1).toUpperCase()
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="font-semibold text-gray-900 text-sm">{authorName}</span>
              {authorUsername && <span className="text-xs text-gray-500 font-medium">@{authorUsername}</span>}
              <span className="text-xs text-gray-400 ml-auto whitespace-nowrap">{formatDate(comment.createdAt)}</span>
            </div>

            {isEditing ? (
              <div className="mt-2">
                <textarea
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={2}
                  autoFocus
                />
                <div className="flex justify-end gap-3 mt-2">
                  <button
                    onClick={() => setEditingId(null)}
                    className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1 py-1.5 px-1"
                  >
                    <X size={14} /> Cancel
                  </button>
                  <button
                    onClick={() => handleEditSubmit(comment.id)}
                    className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 font-semibold py-1.5 px-1"
                  >
                    <Check size={14} /> Save
                  </button>
                </div>
              </div>
            ) : (
              <p className={`text-gray-700 text-sm leading-relaxed whitespace-pre-wrap break-words ${isReply ? "mt-1" : ""}`}>
                {(comment.content || "").split(/(@\[.*?\]\(.*?\)|\B@[a-zA-Z0-9_-]+)/g).map((part, i) => {
                  const legacyMatch = part.match(/@\[(.*?)\]\((.*?)\)/);
                  if (legacyMatch) {
                    return (
                      <span key={i} className="text-blue-600 font-medium">
                        @{legacyMatch[1]}
                      </span>
                    );
                  } else if (part.startsWith("@")) {
                    return (
                      <span key={i} className="text-blue-600 font-medium">
                        {part}
                      </span>
                    );
                  }
                  return part;
                })}
                {comment.isEdited && <span className="text-xs text-gray-400 ml-2">(edited)</span>}
              </p>
            )}
          </div>

          {!isEditing && (
            <div className="flex items-center gap-1 mt-1.5 -ml-1">
              <button
                onClick={() => startReply(comment.id, authorName, authorUsername, comment.userId, comment.parentId || comment.id)}
                className="text-xs text-gray-500 font-medium flex items-center gap-1 hover:text-blue-600 active:text-blue-700 transition-colors py-1.5 px-2 rounded-md"
              >
                <Reply size={13} /> Reply
              </button>

              {isOwner && (
                <>
                  <button
                    onClick={() => startEdit(comment)}
                    className="text-xs text-gray-500 font-medium flex items-center gap-1 hover:text-yellow-600 active:text-yellow-700 transition-colors py-1.5 px-2 rounded-md"
                  >
                    <Edit2 size={13} /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(comment.id)}
                    className="text-xs text-gray-500 font-medium flex items-center gap-1 hover:text-red-600 active:text-red-700 transition-colors py-1.5 px-2 rounded-md"
                  >
                    <Trash2 size={13} /> Delete
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const displayCount = commentCount;

  return (
    <div className="pt-1" id="comments">
      <div className="border border-gray-200 rounded-2xl bg-white overflow-hidden shadow-sm">
        {/* Collapsed toggle bar */}
        <button
          type="button"
          onClick={toggleExpand}
          aria-expanded={isExpanded}
          aria-controls="comments-panel"
          className={`w-full flex items-center justify-between gap-3 px-4 py-3 sm:py-4 transition-colors hover:bg-gray-50 active:bg-gray-100 ${isExpanded ? "border-b border-gray-100 bg-gray-50/50" : "bg-white"
            }`}
        >
          <span className="flex items-center gap-2 font-semibold text-gray-900 text-sm sm:text-base">
            <MessageSquare size={18} className="text-blue-600 flex-shrink-0" />
            {displayCount !== null ? `Comments (${displayCount})` : "Comments"}
          </span>
          <ChevronDown
            size={18}
            className={`text-gray-500 flex-shrink-0 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
          />
        </button>

        {/* Accordion body */}
        <div
          className="grid transition-[grid-template-rows] duration-300 ease-in-out bg-gray-50/30"
          style={{ gridTemplateRows: isExpanded ? "1fr" : "0fr" }}
        >
          <div className="overflow-hidden">
            <div className="flex flex-col max-h-[500px] sm:max-h-[600px]">
              {/* Sticky Form at Top */}
              <div className="p-4 sm:p-5 pb-0 shrink-0 z-10">
                <div className="mb-4">
                  {replyingTo && (
                    <div className="flex items-center justify-between bg-blue-50 text-blue-800 px-3 sm:px-4 py-2 rounded-t-xl text-xs sm:text-sm border border-blue-100 border-b-0">
                      <span className="truncate">
                        Replying to <strong>{replyingTo.name}</strong>
                      </span>
                      <button
                        onClick={() => {
                          setReplyingTo(null);
                          setInputContent("");
                          setMentionedUserIds([]);
                        }}
                        className="hover:text-blue-900 flex-shrink-0 p-1 -mr-1"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}
                  <form
                    onSubmit={handleSubmit}
                    className={`relative ${replyingTo ? "rounded-b-xl" : "rounded-xl"
                      } border border-gray-200 focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-400 transition-all overflow-hidden bg-white shadow-sm`}
                  >
                    <textarea
                      ref={inputRef}
                      placeholder={mounted && user ? "Write a comment..." : "Please log in to comment..."}
                      className={`w-full p-3 sm:p-4 resize-none outline-none text-sm min-h-[80px] sm:min-h-[100px] ${(!mounted || !user) ? 'cursor-text' : ''}`}
                      value={inputContent}
                      onChange={(e) => setInputContent(e.target.value)}
                      onKeyDown={handleKeyDown}
                      disabled={submitting}
                      readOnly={!mounted || !user}
                      onFocus={(e) => {
                        if (mounted && !user) {
                          e.target.blur();
                          openAuthModal();
                        }
                      }}
                    />
                    <div className="bg-gray-50 p-2.5 sm:p-3 border-t border-gray-100 flex justify-end">
                      <button
                        type="submit"
                        disabled={!mounted || !user || submitting || !inputContent.trim()}
                        className="bg-blue-600 text-white px-4 sm:px-5 py-2 sm:py-1.5 rounded-full text-sm font-medium hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                      >
                        {submitting ? <Loader2 size={16} className="animate-spin" /> : null}
                        Post Comment
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              {/* Scrollable Comments List */}
              <div id="comments-panel" ref={panelRef} className="p-4 sm:p-5 pt-2 overflow-y-auto flex-1">
                <div className="space-y-2">
                  {loading ? (
                    <div className="space-y-4 animate-pulse">
                      {[0, 1, 2].map((i) => (
                        <div key={i} className="flex gap-3">
                          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gray-200 flex-shrink-0" />
                          <div className="flex-1 bg-gray-100 rounded-2xl h-16 sm:h-20" />
                        </div>
                      ))}
                    </div>
                  ) : comments.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-xl border border-gray-100">
                      <MessageSquare className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-gray-300 mb-2" />
                      <p className="text-sm sm:text-base px-4">No comments yet. Be the first to share your thoughts!</p>
                    </div>
                  ) : (
                    comments.map((comment) => (
                      <div key={comment.id}>
                        {renderComment(comment, false)}
                        {comment.replyCount && comment.replyCount > 0 ? (
                          <div className="mt-2 space-y-2">
                            {comment.replies && comment.replies.map((reply) => renderComment(reply, true))}

                            <div className="ml-8 sm:ml-12 mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
                              {(!comment.replies || comment.replies.length < comment.replyCount) && (
                                <button
                                  onClick={() => loadReplies(comment.id)}
                                  disabled={comment.loadingReplies}
                                  className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-2 py-1"
                                >
                                  {comment.loadingReplies && <Loader2 size={14} className="animate-spin" />}
                                  {comment.replies && comment.replies.length > 0
                                    ? `View more replies (${comment.replyCount - comment.replies.length})`
                                    : `View ${comment.replyCount} ${comment.replyCount === 1 ? "reply" : "replies"}`}
                                </button>
                              )}
                              {comment.replies && comment.replies.length > 0 && (
                                <button
                                  onClick={() => hideReplies(comment.id)}
                                  className="text-xs sm:text-sm text-gray-500 hover:text-gray-700 font-medium flex items-center gap-2 py-1"
                                >
                                  Hide replies
                                </button>
                              )}
                            </div>
                          </div>
                        ) : null}
                      </div>
                    ))
                  )}

                  <div ref={observerTarget} className="h-4 w-full" />

                  {loadingMore && (
                    <div className="flex justify-center py-4">
                      <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-t-2xl sm:rounded-xl shadow-xl max-w-md w-full p-5 sm:p-6 border border-gray-100">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Delete Comment</h3>
            <p className="text-sm sm:text-base text-gray-600 mb-6">
              Are you sure you want to delete this comment? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      {authModalMounted && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{
            backgroundColor: authModalVisible ? 'rgba(0, 0, 0, 0.6)' : 'rgba(0, 0, 0, 0)',
            backdropFilter: authModalVisible ? 'blur(4px)' : 'blur(0px)',
            transition: 'background-color 500ms ease-in-out, backdrop-filter 500ms ease-in-out',
          }}
        >
          <div
            className="bg-[#0A2342] rounded-2xl shadow-2xl max-w-sm w-full p-6 sm:p-8 border border-[#C9A227]/20 relative text-center"
            style={{
              opacity: authModalVisible ? 1 : 0,
              transform: authModalVisible ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(10px)',
              transition: 'all 500ms cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            <button
              onClick={closeAuthModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-[#C9A227] transition-colors"
            >
              <X size={20} />
            </button>
            <div className="w-16 h-16 bg-[#C9A227]/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#C9A227]/20">
              <MessageSquare className="w-8 h-8 text-[#C9A227]" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 font-georgia">Join the Conversation</h3>
            <p className="text-sm text-gray-300 mb-6">
              You need to be logged in to share your thoughts and interact with other comments.
            </p>
            <div className="flex flex-col gap-3">
              <Link
                href="/login"
                className="w-full py-2.5 bg-[#C9A227] text-[#0A2342] rounded-xl font-bold hover:bg-[#b08d22] transition-colors shadow-sm"
              >
                Log In
              </Link>
              <Link
                href="/register"
                className="w-full py-2.5 bg-transparent text-[#C9A227] rounded-xl font-bold border border-[#C9A227] hover:bg-[#C9A227]/10 transition-colors"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}