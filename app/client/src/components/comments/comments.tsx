"use client";

/**
 * 评论组件 / Comments component.
 *
 * 渲染评论表单、分页顶级评论和分页回复列表。
 * Renders the comment form, paginated top-level comments, and paginated replies.
 */

import PulsatingDots from "@/components/loading/pulsating-dots";
import type { Comment } from "@/data/mock-comments";
import {
  useInfinitePagination,
  useLoadMoreSentinel,
} from "@/hooks/use-infinite-pagination";
import {
  COMMENT_PAGE_SIZE,
  COMMENT_REPLY_PAGE_SIZE,
  getArticleComments,
  getSiteComments,
} from "@/services/comments";
import { useTranslations } from "next-intl";
import { useCallback, useState } from "react";
import Modules from "./comments.module.scss";

type CommentsSource = "site" | "article";

interface CommentsProps {
  source: CommentsSource;
  postId?: number;
}

interface CommentFormProps {
  authorName: string;
  authorEmail: string;
  content: string;
  onAuthorNameChange: (value: string) => void;
  onAuthorEmailChange: (value: string) => void;
  onContentChange: (value: string) => void;
  onSubmit: () => void;
  onCancel?: () => void;
  placeholder?: string;
}

function CommentForm({
  authorName,
  authorEmail,
  content,
  onAuthorNameChange,
  onAuthorEmailChange,
  onContentChange,
  onSubmit,
  onCancel,
  placeholder,
}: CommentFormProps) {
  const t = useTranslations("Comments");

  const canSubmit =
    content.trim() !== "" &&
    authorName.trim() !== "" &&
    authorEmail.trim() !== "";

  return (
    <>
      <div className={Modules["form-row"]}>
        <input
          type="text"
          placeholder={t("nicknamePlaceholder")}
          className={Modules.input}
          value={authorName}
          onChange={(event) => onAuthorNameChange(event.target.value)}
          required
        />

        <input
          type="email"
          placeholder={t("emailPlaceholder")}
          className={Modules.input}
          value={authorEmail}
          onChange={(event) => onAuthorEmailChange(event.target.value)}
          required
        />
      </div>

      <div className={Modules["textarea-wrapper"]}>
        <textarea
          placeholder={placeholder ?? t("commentPlaceholder")}
          className={Modules.textarea}
          value={content}
          onChange={(event) => onContentChange(event.target.value)}
          rows={4}
          required
        />

        {canSubmit && (
          <button
            className={Modules["submit-button"]}
            onClick={onSubmit}
            type="button"
          >
            <span className="icon-[mynaui--send-solid]" />
            {t("sendMessage")}
          </button>
        )}
      </div>

      {onCancel && (
        <div className={Modules["form-actions"]}>
          <button
            className={Modules["cancel-button"]}
            onClick={onCancel}
            type="button"
          >
            {t("cancel")}
          </button>
        </div>
      )}
    </>
  );
}

function formatTime(timestamp: number): string {
  const date = new Date(timestamp);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
}

function getFirstLetter(name: string): string {
  if (!name) {
    return "?";
  }

  return name.charAt(0).toUpperCase();
}

function getColorFromString(str: string): string {
  const colors = [
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#FFA07A",
    "#98D8C8",
    "#F7DC6F",
    "#BB8FCE",
    "#85C1E2",
    "#F8B739",
    "#52B788",
    "#E63946",
    "#457B9D",
  ] as const;

  let hash = 0;

  for (let index = 0; index < str.length; index += 1) {
    hash = str.charCodeAt(index) + ((hash << 5) - hash);
    hash &= hash;
  }

  const colorIndex = Math.abs(hash) % colors.length;

  return colors[colorIndex] ?? colors[0];
}

function useCommentsPageGetter(
  source: CommentsSource,
  postId: number | undefined,
  parentId?: number,
) {
  return useCallback(
    (page: number, pageSize: number) => {
      if (source === "article") {
        return getArticleComments({
          postId: postId ?? 0,
          page,
          pageSize,
          parentId,
        });
      }

      return getSiteComments({
        page,
        pageSize,
        parentId,
      });
    },
    [parentId, postId, source],
  );
}

interface CommentBubbleProps {
  comment: Comment;
  isReply?: boolean;
  onReplyClick?: () => void;
  showReplyForm?: boolean;
}

function CommentBubble({
  comment,
  isReply = false,
  onReplyClick,
  showReplyForm = false,
}: CommentBubbleProps) {
  const t = useTranslations("Comments");

  return (
    <div className={isReply ? Modules.reply : Modules.comment}>
      <div className={Modules["comment-main"]}>
        <div
          className={Modules.avatar}
          style={{
            backgroundColor: getColorFromString(comment.author),
          }}
        >
          {getFirstLetter(comment.author)}
        </div>

        <div className={Modules["comment-bubble-wrapper"]}>
          <div className={Modules["author-line"]}>
            <span className={Modules.author}>{comment.author}</span>
            <span className={Modules.time}>
              {formatTime(comment.created_at)}
            </span>
            <span className={Modules.floor}>#{comment.floor}</span>
            <span className={Modules.location}>
              {t("from")}
              {comment.location}
            </span>
          </div>

          <div className={Modules["comment-bubble"]}>
            <div className={Modules["comment-content"]}>{comment.content}</div>
          </div>

          {!isReply && onReplyClick && (
            <button
              className={Modules["reply-button"]}
              onClick={onReplyClick}
              type="button"
              aria-label={showReplyForm ? t("cancelReply") : t("reply")}
            >
              <span className="icon-[mynaui--chat-messages-solid]" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

interface CommentItemProps {
  comment: Comment;
  source: CommentsSource;
  postId?: number;
}

function CommentItem({ comment, source, postId }: CommentItemProps) {
  const t = useTranslations("Comments");

  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [replyAuthorName, setReplyAuthorName] = useState("");
  const [replyAuthorEmail, setReplyAuthorEmail] = useState("");

  const getRepliesPage = useCommentsPageGetter(source, postId, comment.id);
  const {
    items: replies,
    hasMore,
    loading,
    initialLoading,
    loadMore,
  } = useInfinitePagination<Comment>({
    pageSize: COMMENT_REPLY_PAGE_SIZE,
    getPage: getRepliesPage,
  });

  const toggleReplyForm = () => {
    setShowReplyForm((current) => {
      const next = !current;

      if (!next) {
        setReplyContent("");
        setReplyAuthorName("");
        setReplyAuthorEmail("");
      }

      return next;
    });
  };

  const handleReplySubmit = () => {
    const replyData = {
      parent_id: comment.id,
      parentFloor: comment.floor,
      content: replyContent,
      author: replyAuthorName,
      email: replyAuthorEmail,
      created_at: Date.now(),
    };

    console.log("Reply form data:", replyData);

    setReplyContent("");
    setReplyAuthorName("");
    setReplyAuthorEmail("");
    setShowReplyForm(false);
  };

  return (
    <div>
      <CommentBubble
        comment={comment}
        onReplyClick={toggleReplyForm}
        showReplyForm={showReplyForm}
      />

      {showReplyForm && (
        <div className={Modules["reply-form"]}>
          <CommentForm
            authorName={replyAuthorName}
            authorEmail={replyAuthorEmail}
            content={replyContent}
            onAuthorNameChange={setReplyAuthorName}
            onAuthorEmailChange={setReplyAuthorEmail}
            onContentChange={setReplyContent}
            onSubmit={handleReplySubmit}
            onCancel={toggleReplyForm}
            placeholder={t("replyPlaceholder")}
          />
        </div>
      )}

      {(initialLoading || replies.length > 0) && (
        <div className={Modules.replies}>
          {replies.map((reply) => (
            <CommentBubble key={reply.id} comment={reply} isReply />
          ))}

          {initialLoading && (
            <div className={Modules["reply-loading"]}>
              <PulsatingDots />
            </div>
          )}

          {hasMore && !loading && (
            <button
              type="button"
              className={Modules["load-more-replies"]}
              onClick={loadMore}
            >
              {t("loadMoreReplies")}
            </button>
          )}

          {loading && !initialLoading && (
            <div className={Modules["reply-loading"]}>
              <PulsatingDots />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Comments({ source, postId }: CommentsProps) {
  const t = useTranslations("Comments");

  const [commentContent, setCommentContent] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [authorEmail, setAuthorEmail] = useState("");

  const getRootCommentsPage = useCommentsPageGetter(source, postId);
  const {
    items: rootComments,
    hasMore,
    loading,
    initialLoading,
    error,
    loadMore,
  } = useInfinitePagination<Comment>({
    pageSize: COMMENT_PAGE_SIZE,
    getPage: getRootCommentsPage,
    enabled: source === "site" || typeof postId === "number",
  });

  const sentinelRef = useLoadMoreSentinel(hasMore && !loading, loadMore);

  const handleSubmit = () => {
    const formData = {
      post_id: source === "article" ? (postId ?? 1) : 0,
      content: commentContent,
      author: authorName,
      email: authorEmail,
      created_at: Date.now(),
    };

    console.log("Comment form data:", formData);

    setCommentContent("");
    setAuthorName("");
    setAuthorEmail("");
  };

  return (
    <div className={Modules.container}>
      <div className={Modules["comment-form"]}>
        <CommentForm
          authorName={authorName}
          authorEmail={authorEmail}
          content={commentContent}
          onAuthorNameChange={setAuthorName}
          onAuthorEmailChange={setAuthorEmail}
          onContentChange={setCommentContent}
          onSubmit={handleSubmit}
          placeholder={t("commentPlaceholder")}
        />
      </div>

      <div className={Modules["comments-list"]}>
        {rootComments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            source={source}
            postId={postId}
          />
        ))}

        {!initialLoading && rootComments.length === 0 && (
          <div className={Modules["empty-state"]}>
            {error ? error.message : t("emptyState")}
          </div>
        )}

        <div ref={sentinelRef} className={Modules.sentinel} />

        {loading && (
          <div className={Modules.loading}>
            <PulsatingDots />
          </div>
        )}
      </div>
    </div>
  );
}
