"use client";

/**
 * 评论组件 / Comments component.
 *
 * 渲染评论表单、分页顶级评论和分页回复列表。
 * Renders the comment form, paginated top-level comments, and paginated replies.
 */

import PulsatingDots from "@/components/loading/pulsating-dots";
import {
  useInfinitePagination,
  useLoadMoreSentinel,
} from "@/hooks/use-infinite-pagination";
import {
  COMMENT_PAGE_SIZE,
  COMMENT_REPLY_PAGE_SIZE,
  createArticleComment,
  createSiteComment,
  getArticleComments,
  getSiteComments,
} from "@/services/comments";
import type { Comment } from "@/types/comment";
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
  onSubmit: () => void | Promise<void>;
  onCancel?: () => void;
  placeholder?: string;
  submitting?: boolean;
}

type CommentValidationErrorKey =
  | "authorInvalid"
  | "emailInvalid"
  | "contentInvalid";

type CommentApiErrorKey =
  | CommentValidationErrorKey
  | "parentMissing"
  | "postMissing";

const COMMENT_ERROR_TRANSLATION_KEYS = {
  "author must be between 1 and 80 characters": "authorInvalid",
  "email is invalid": "emailInvalid",
  "content must be between 1 and 5000 characters": "contentInvalid",
  "parentId does not exist": "parentMissing",
  "postId does not exist": "postMissing",
} as const satisfies Record<string, CommentApiErrorKey>;

function getCommentValidationError(
  authorName: string,
  authorEmail: string,
  content: string,
): CommentValidationErrorKey | null {
  const trimmedAuthorName = authorName.trim();
  const trimmedAuthorEmail = authorEmail.trim();
  const trimmedContent = content.trim();

  if (trimmedAuthorName.length < 1 || trimmedAuthorName.length > 80) {
    return "authorInvalid";
  }

  if (
    trimmedAuthorEmail.length < 1 ||
    trimmedAuthorEmail.length > 255 ||
    !trimmedAuthorEmail.includes("@")
  ) {
    return "emailInvalid";
  }

  if (trimmedContent.length < 1 || trimmedContent.length > 5000) {
    return "contentInvalid";
  }

  return null;
}

function getCommentApiErrorKey(error: unknown): CommentApiErrorKey | null {
  if (!(error instanceof Error)) {
    return null;
  }

  return (
    COMMENT_ERROR_TRANSLATION_KEYS[
      error.message as keyof typeof COMMENT_ERROR_TRANSLATION_KEYS
    ] ?? null
  );
}

function getErrorMessage(error: unknown): string | null {
  return error instanceof Error ? error.message : null;
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
  submitting = false,
}: CommentFormProps) {
  const t = useTranslations("Comments");

  const canSubmit =
    content.trim() !== "" &&
    authorName.trim() !== "" &&
    authorEmail.trim() !== "" &&
    !submitting;

  return (
    <>
      <div className={Modules["form-row"]}>
        <input
          type="text"
          placeholder={t("nicknamePlaceholder")}
          className={Modules.input}
          value={authorName}
          onChange={(event) => onAuthorNameChange(event.target.value)}
          disabled={submitting}
          maxLength={80}
          required
        />

        <input
          type="email"
          placeholder={t("emailPlaceholder")}
          className={Modules.input}
          value={authorEmail}
          onChange={(event) => onAuthorEmailChange(event.target.value)}
          disabled={submitting}
          maxLength={255}
          required
        />
      </div>

      <div className={Modules["textarea-wrapper"]}>
        <textarea
          placeholder={placeholder ?? t("commentPlaceholder")}
          className={Modules.textarea}
          value={content}
          onChange={(event) => onContentChange(event.target.value)}
          disabled={submitting}
          maxLength={5000}
          rows={4}
          required
        />

        {canSubmit && (
          <button
            className={Modules["submit-button"]}
            onClick={() => void onSubmit()}
            type="button"
            disabled={submitting}
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
  const [replySubmitting, setReplySubmitting] = useState(false);
  const [replySubmitError, setReplySubmitError] = useState<string | null>(null);

  const getRepliesPage = useCommentsPageGetter(source, postId, comment.id);
  const {
    items: replies,
    hasMore,
    loading,
    initialLoading,
    error: repliesError,
    loadMore,
    reload,
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

  const handleReplySubmit = async () => {
    setReplySubmitError(null);

    const validationErrorKey = getCommentValidationError(
      replyAuthorName,
      replyAuthorEmail,
      replyContent,
    );

    if (validationErrorKey) {
      setReplySubmitError(t(validationErrorKey));
      return;
    }

    setReplySubmitting(true);

    try {
      const payload = {
        parentId: comment.id,
        content: replyContent,
        author: replyAuthorName,
        email: replyAuthorEmail,
      };

      if (source === "article") {
        await createArticleComment({
          ...payload,
          postId: postId ?? 0,
        }).send(true);
      } else {
        await createSiteComment(payload).send(true);
      }

      setReplyContent("");
      setReplyAuthorName("");
      setReplyAuthorEmail("");
      setShowReplyForm(false);
      reload();
    } catch (error) {
      const errorKey = getCommentApiErrorKey(error);

      setReplySubmitError(
        errorKey
          ? t(errorKey)
          : (getErrorMessage(error) ?? t("replySubmitFailed")),
      );
    } finally {
      setReplySubmitting(false);
    }
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
            submitting={replySubmitting}
          />

          {replySubmitError && (
            <div className={Modules["empty-state"]}>{replySubmitError}</div>
          )}
        </div>
      )}

      {(initialLoading || replies.length > 0 || repliesError) && (
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

          {repliesError && (
            <div className={Modules["empty-state"]}>{repliesError.message}</div>
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
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const getRootCommentsPage = useCommentsPageGetter(source, postId);
  const {
    items: rootComments,
    hasMore,
    loading,
    initialLoading,
    error,
    loadMore,
    reload,
  } = useInfinitePagination<Comment>({
    pageSize: COMMENT_PAGE_SIZE,
    getPage: getRootCommentsPage,
    enabled: source === "site" || typeof postId === "number",
  });

  const sentinelRef = useLoadMoreSentinel(hasMore && !loading, loadMore);

  const handleSubmit = async () => {
    setSubmitError(null);

    const validationErrorKey = getCommentValidationError(
      authorName,
      authorEmail,
      commentContent,
    );

    if (validationErrorKey) {
      setSubmitError(t(validationErrorKey));
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        content: commentContent,
        author: authorName,
        email: authorEmail,
      };

      if (source === "article") {
        await createArticleComment({
          ...payload,
          postId: postId ?? 0,
        }).send(true);
      } else {
        await createSiteComment(payload).send(true);
      }

      setCommentContent("");
      setAuthorName("");
      setAuthorEmail("");
      reload();
    } catch (error) {
      const errorKey = getCommentApiErrorKey(error);

      setSubmitError(
        errorKey
          ? t(errorKey)
          : (getErrorMessage(error) ?? t("commentSubmitFailed")),
      );
    } finally {
      setSubmitting(false);
    }
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
          submitting={submitting}
        />

        {submitError && (
          <div className={Modules["empty-state"]}>{submitError}</div>
        )}
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
