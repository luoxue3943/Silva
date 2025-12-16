/**
 * 评论区组件 / Comments Component
 *
 * 提供评论展示、社交登录和评论提交功能 / Provides comment display, social login, and comment submission
 */
import { $, component$, useSignal } from "@builder.io/qwik";
import type { Comment } from "@/data/mock-comments";
import Modules from "./comments.module.scss";

interface CommentsProps {
  comments: Comment[];
  postId?: string;
}

/**
 * 单条评论组件 / Single comment component
 */
const CommentItem = component$<{ comment: Comment; isReply?: boolean }>(
  ({ comment, isReply = false }) => {
    // 回复表单状态 / Reply form state
    const showReplyForm = useSignal(false);
    const replyContent = useSignal("");
    const replyAuthorName = useSignal("");
    const replyAuthorEmail = useSignal("");

    /**
     * 切换回复表单 / Toggle reply form
     */
    const toggleReplyForm = $(() => {
      showReplyForm.value = !showReplyForm.value;
      // 关闭时清空表单 / Clear form when closing
      if (!showReplyForm.value) {
        replyContent.value = "";
        replyAuthorName.value = "";
        replyAuthorEmail.value = "";
      }
    });

    /**
     * 提交回复 / Submit reply
     */
    const handleReplySubmit = $(() => {
      const replyData = {
        parentCommentId: comment.id,
        parentFloor: comment.floor,
        content: replyContent.value,
        author: replyAuthorName.value || "匿名用户",
        email: replyAuthorEmail.value,
        timestamp: new Date().toISOString(),
      };

      console.log("回复表单数据:", replyData);

      // 重置表单 / Reset form
      replyContent.value = "";
      replyAuthorName.value = "";
      replyAuthorEmail.value = "";
      showReplyForm.value = false;
    });

    return (
      <div class={isReply ? Modules.reply : Modules.comment}>
        <div class={Modules["comment-header"]}>
          <img
            src={comment.avatar}
            alt={comment.author}
            class={Modules.avatar}
            width={40}
            height={40}
          />
          <div class={Modules["comment-info"]}>
            <div class={Modules["author-line"]}>
              <span class={Modules.author}>{comment.author}</span>
              {comment.loginType === "github" && (
                <span
                  class={`${Modules["login-badge"]} icon-[mdi--github]`}
                  title="GitHub登录"
                />
              )}
              {comment.loginType === "google" && (
                <span
                  class={`${Modules["login-badge"]} icon-[mdi--google]`}
                  title="Google登录"
                />
              )}
            </div>
            <div class={Modules.meta}>
              <span class={Modules.time}>{comment.time}</span>
              <span class={Modules.floor}>#{comment.floor}</span>
              {comment.location && (
                <span class={Modules.location}>来自: {comment.location}</span>
              )}
            </div>
          </div>
        </div>
        <div class={Modules["comment-content"]}>{comment.content}</div>

        {/* 回复按钮 - 只在基础评论显示 / Reply button - only show for base comments */}
        {!isReply && (
          <div class={Modules["comment-actions"]}>
            <button
              class={Modules["reply-button"]}
              onClick$={toggleReplyForm}
              type="button"
            >
              {showReplyForm.value ? "取消回复" : "回复"}
            </button>
          </div>
        )}

        {/* 回复表单 / Reply form */}
        {!isReply && showReplyForm.value && (
          <div class={Modules["reply-form"]}>
            <div class={Modules["form-row"]}>
              <input
                type="text"
                placeholder="昵称 *"
                class={Modules.input}
                value={replyAuthorName.value}
                onInput$={(e) =>
                  (replyAuthorName.value = (e.target as HTMLInputElement).value)
                }
                required
              />
              <input
                type="email"
                placeholder="邮箱 *"
                class={Modules.input}
                value={replyAuthorEmail.value}
                onInput$={(e) =>
                  (replyAuthorEmail.value = (
                    e.target as HTMLInputElement
                  ).value)
                }
                required
              />
            </div>
            <textarea
              placeholder="写下你的回复... *"
              class={Modules.textarea}
              value={replyContent.value}
              onInput$={(e) =>
                (replyContent.value = (e.target as HTMLTextAreaElement).value)
              }
              rows={3}
              required
            />
            <div class={Modules["form-actions"]}>
              <button
                class={Modules["submit-button"]}
                onClick$={handleReplySubmit}
                type="button"
                disabled={
                  !replyContent.value.trim() ||
                  !replyAuthorName.value.trim() ||
                  !replyAuthorEmail.value.trim()
                }
              >
                提交回复
              </button>
              <button
                class={Modules["cancel-button"]}
                onClick$={toggleReplyForm}
                type="button"
              >
                取消
              </button>
            </div>
          </div>
        )}

        {/* 回复列表 / Replies list */}
        {comment.replies && comment.replies.length > 0 && (
          <div class={Modules.replies}>
            {comment.replies.map((reply) => (
              <CommentItem key={reply.id} comment={reply} isReply={true} />
            ))}
          </div>
        )}
      </div>
    );
  },
);

export default component$<CommentsProps>(({ comments, postId }) => {
  // 评论表单状态 / Comment form state
  const commentContent = useSignal("");
  const authorName = useSignal("");
  const authorEmail = useSignal("");
  const showAnonymousForm = useSignal(false);

  /**
   * 处理社交登录 / Handle social login
   */
  const handleSocialLogin = $((provider: "github" | "google") => {
    console.log(`社交登录: ${provider}`);
    // TODO: 实现真实的社交登录逻辑
  });

  /**
   * 切换免登录评论表单 / Toggle anonymous comment form
   */
  const toggleAnonymousForm = $(() => {
    showAnonymousForm.value = !showAnonymousForm.value;
  });

  /**
   * 提交评论 / Submit comment
   */
  const handleSubmit = $(() => {
    const formData = {
      postId: postId || "message",
      content: commentContent.value,
      author: authorName.value || "匿名用户",
      email: authorEmail.value,
      timestamp: new Date().toISOString(),
    };

    console.log("评论表单数据:", formData);

    // 重置表单 / Reset form
    commentContent.value = "";
    authorName.value = "";
    authorEmail.value = "";
    showAnonymousForm.value = false;
  });

  return (
    <div class={Modules.container}>
      {/* 登录区域 / Login section */}
      <div class={Modules["login-section"]}>
        <h3 class={Modules["login-title"]}>使用社交账号登录</h3>
        <div class={Modules["social-buttons"]}>
          <button
            class={Modules["social-button"]}
            onClick$={() => handleSocialLogin("github")}
            type="button"
            aria-label="使用GitHub登录"
          >
            <span class="icon-[mdi--github]" />
          </button>
          <button
            class={Modules["social-button"]}
            onClick$={() => handleSocialLogin("google")}
            type="button"
            aria-label="使用Google登录"
          >
            <span class="icon-[mdi--google]" />
          </button>
        </div>
        <button
          class={Modules["anonymous-button"]}
          onClick$={toggleAnonymousForm}
          type="button"
        >
          免登录评论
        </button>
      </div>

      {/* 免登录评论表单 / Anonymous comment form */}
      {showAnonymousForm.value && (
        <div class={Modules["comment-form"]}>
          <div class={Modules["form-row"]}>
            <input
              type="text"
              placeholder="昵称 *"
              class={Modules.input}
              value={authorName.value}
              onInput$={(e) =>
                (authorName.value = (e.target as HTMLInputElement).value)
              }
              required
            />
            <input
              type="email"
              placeholder="邮箱 *"
              class={Modules.input}
              value={authorEmail.value}
              onInput$={(e) =>
                (authorEmail.value = (e.target as HTMLInputElement).value)
              }
              required
            />
          </div>
          <textarea
            placeholder="写下你的评论... *"
            class={Modules.textarea}
            value={commentContent.value}
            onInput$={(e) =>
              (commentContent.value = (e.target as HTMLTextAreaElement).value)
            }
            rows={4}
            required
          />
          <div class={Modules["form-actions"]}>
            <button
              class={Modules["submit-button"]}
              onClick$={handleSubmit}
              type="button"
              disabled={
                !commentContent.value.trim() ||
                !authorName.value.trim() ||
                !authorEmail.value.trim()
              }
            >
              提交评论
            </button>
            <button
              class={Modules["cancel-button"]}
              onClick$={toggleAnonymousForm}
              type="button"
            >
              取消
            </button>
          </div>
        </div>
      )}

      {/* 评论列表 / Comments list */}
      <div class={Modules["comments-list"]}>
        {comments.length === 0 ? (
          <div class={Modules["empty-state"]}>暂无评论，快来抢沙发吧！</div>
        ) : (
          comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))
        )}
      </div>
    </div>
  );
});
