"use client";

/**
 * 评论区组件 / Comments component
 *
 * 渲染评论列表、评论表单和回复交互。
 * Renders the comment list, comment form, and reply interactions.
 */

import type { Comment } from "@/data/mock-comments";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import Modules from "./comments.module.scss";

/** 评论区入口参数 / Comments entry props */
interface CommentsProps {
  comments: Comment[];
  postId?: string;
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

/**
 * 可复用评论表单 / Reusable comment form
 */
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

/**
 * 将时间戳格式化为页面展示文本 / Formats timestamp for page display
 */
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

/**
 * 获取作者名称的首字母 / Gets the first letter of the author name
 */
function getFirstLetter(name: string): string {
  if (!name) {
    return "?";
  }

  return name.charAt(0).toUpperCase();
}

/**
 * 根据字符串生成稳定头像颜色 / Generates a stable avatar color from a string
 */
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

interface CommentItemProps {
  comment: Comment;
  allComments: Comment[];
  isReply?: boolean;
}

/**
 * 单条评论及其回复列表 / Single comment with its reply list
 */
function CommentItem({
  comment,
  allComments,
  isReply = false,
}: CommentItemProps) {
  const t = useTranslations("Comments");

  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [replyAuthorName, setReplyAuthorName] = useState("");
  const [replyAuthorEmail, setReplyAuthorEmail] = useState("");

  const replies = useMemo(
    () => allComments.filter((item) => item.parent_id === comment.id),
    [allComments, comment.id],
  );

  /**
   * 打开或关闭回复表单 / Opens or closes the reply form
   */
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

  /**
   * 组装并提交回复数据 / Builds and submits reply data
   */
  const handleReplySubmit = () => {
    const replyData = {
      parent_id: comment.id,
      parentFloor: comment.floor,
      content: replyContent,
      author: replyAuthorName,
      email: replyAuthorEmail,
      created_at: Date.now(),
    };

    console.log("回复表单数据:", replyData);

    setReplyContent("");
    setReplyAuthorName("");
    setReplyAuthorEmail("");
    setShowReplyForm(false);
  };

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

          {!isReply && (
            <button
              className={Modules["reply-button"]}
              onClick={toggleReplyForm}
              type="button"
              aria-label={showReplyForm ? t("cancelReply") : t("reply")}
            >
              <span className="icon-[mynaui--chat-messages-solid]" />
            </button>
          )}
        </div>
      </div>

      {!isReply && showReplyForm && (
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

      {replies.length > 0 && (
        <div className={Modules.replies}>
          {replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              allComments={allComments}
              isReply
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Comments({ comments, postId }: CommentsProps) {
  const t = useTranslations("Comments");

  const [commentContent, setCommentContent] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [authorEmail, setAuthorEmail] = useState("");

  const rootComments = useMemo(
    () => comments.filter((comment) => comment.parent_id == null),
    [comments],
  );

  /**
   * 组装并提交顶级评论数据 / Builds and submits top-level comment data
   */
  const handleSubmit = () => {
    const formData = {
      post_id: postId ? Number(postId) : 1,
      content: commentContent,
      author: authorName,
      email: authorEmail,
      created_at: Date.now(),
    };

    console.log("评论表单数据:", formData);

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
        {comments.length === 0 ? (
          <div className={Modules["empty-state"]}>{t("emptyState")}</div>
        ) : (
          rootComments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              allComments={comments}
            />
          ))
        )}
      </div>
    </div>
  );
}
