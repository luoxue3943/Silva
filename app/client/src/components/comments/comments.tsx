/**
 * 评论区组件 / Comments Component
 *
 * 提供评论展示、社交登录和评论提交功能 / Provides comment display, social login, and comment submission
 */
import type { Comment } from "@/data/mock-comments";
import {
  $,
  component$,
  useSignal,
  type PropFunction,
  type Signal,
} from "@builder.io/qwik";
import Modules from "./comments.module.scss";

/** 评论组件属性 / Comments component props */
interface CommentsProps {
  comments: Comment[];
  postId?: string;
}

/**
 * 可复用的评论表单组件 / Reusable comment form component
 */
const CommentForm = component$<{
  authorName: Signal<string>;
  authorEmail: Signal<string>;
  content: Signal<string>;
  onSubmit: PropFunction<() => void>;
  onCancel?: PropFunction<() => void>;
  placeholder?: string;
}>(({ authorName, authorEmail, content, onSubmit, onCancel, placeholder }) => {
  return (
    <>
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
      <div class={Modules["textarea-wrapper"]}>
        <textarea
          placeholder={placeholder || "写下你的评论... *"}
          class={Modules.textarea}
          value={content.value}
          onInput$={(e) =>
            (content.value = (e.target as HTMLTextAreaElement).value)
          }
          rows={4}
          required
        />
        {content.value.trim() &&
          authorName.value.trim() &&
          authorEmail.value.trim() && (
            <button
              class={Modules["submit-button"]}
              onClick$={onSubmit}
              type="button"
            >
              <span class="icon-[mynaui--send-solid]" />
              发送留言
            </button>
          )}
      </div>
      {onCancel && (
        <div class={Modules["form-actions"]}>
          <button
            class={Modules["cancel-button"]}
            onClick$={onCancel}
            type="button"
          >
            取消
          </button>
        </div>
      )}
    </>
  );
});

/**
 * 格式化时间戳为显示格式 / Format timestamp for display
 */
const formatTime = (timestamp: number): string => {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
};

/**
 * 获取用户名首字母 / Get first letter of username
 */
const getFirstLetter = (name: string): string => {
  if (!name) return "?";
  return name.charAt(0).toUpperCase();
};

/**
 * 根据字符串生成稳定的随机颜色 / Generate stable random color from string
 */
const getColorFromString = (str: string): string => {
  // 预定义的颜色数组 / Predefined color array
  const colors = [
    "#FF6B6B", // 红色 / Red
    "#4ECDC4", // 青色 / Cyan
    "#45B7D1", // 蓝色 / Blue
    "#FFA07A", // 橙色 / Orange
    "#98D8C8", // 薄荷绿 / Mint
    "#F7DC6F", // 黄色 / Yellow
    "#BB8FCE", // 紫色 / Purple
    "#85C1E2", // 天蓝 / Sky Blue
    "#F8B739", // 金色 / Gold
    "#52B788", // 绿色 / Green
    "#E63946", // 深红 / Deep Red
    "#457B9D", // 钢蓝 / Steel Blue
  ];

  // 使用字符串生成哈希值 / Generate hash from string
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash; // 转换为32位整数 / Convert to 32bit integer
  }

  // 使用哈希值选择颜色 / Use hash to select color
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

/**
 * 单条评论组件 / Single comment component
 */
const CommentItem = component$<{
  comment: Comment;
  allComments: Comment[];
  isReply?: boolean;
}>(({ comment, allComments, isReply = false }) => {
  // 回复表单状态 / Reply form state
  const showReplyForm = useSignal(false);
  const replyContent = useSignal("");
  const replyAuthorName = useSignal("");
  const replyAuthorEmail = useSignal("");

  // 筛选出当前评论的子评论 / Filter child comments
  const replies = allComments.filter((c) => c.parent_id === comment.id);

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
      parent_id: comment.id,
      parentFloor: comment.floor,
      content: replyContent.value,
      author: replyAuthorName.value || "匿名用户",
      email: replyAuthorEmail.value,
      created_at: Date.now(),
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
      <div class={Modules["comment-main"]}>
        <div
          class={Modules.avatar}
          style={{
            backgroundColor: getColorFromString(comment.author),
          }}
        >
          {getFirstLetter(comment.author)}
        </div>
        <div class={Modules["comment-bubble-wrapper"]}>
          <div class={Modules["author-line"]}>
            <span class={Modules.author}>{comment.author}</span>
            <span class={Modules.time}>{formatTime(comment.created_at)}</span>
            <span class={Modules.floor}>#{comment.floor}</span>
            <span class={Modules.location}>来自：{comment.location}</span>
          </div>
          <div class={Modules["comment-bubble"]}>
            <div class={Modules["comment-content"]}>{comment.content}</div>
          </div>

          {/* 回复按钮 - 只在基础评论显示 / Reply button - only show for base comments */}
          {!isReply && (
            <button
              class={Modules["reply-button"]}
              onClick$={toggleReplyForm}
              type="button"
              aria-label={showReplyForm.value ? "取消回复" : "回复"}
            >
              <span class="icon-[mynaui--chat-messages-solid]" />
            </button>
          )}
        </div>
      </div>

      {/* 回复表单 / Reply form */}
      {!isReply && showReplyForm.value && (
        <div class={Modules["reply-form"]}>
          <CommentForm
            authorName={replyAuthorName}
            authorEmail={replyAuthorEmail}
            content={replyContent}
            onSubmit={handleReplySubmit}
            onCancel={toggleReplyForm}
            placeholder="写下你的回复... *"
          />
        </div>
      )}

      {/* 回复列表 / Replies list */}
      {replies.length > 0 && (
        <div class={Modules.replies}>
          {replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              allComments={allComments}
              isReply={true}
            />
          ))}
        </div>
      )}
    </div>
  );
});

export default component$<CommentsProps>(({ comments, postId }) => {
  // 评论表单状态 / Comment form state
  const commentContent = useSignal("");
  const authorName = useSignal("");
  const authorEmail = useSignal("");

  /**
   * 提交评论 / Submit comment
   */
  const handleSubmit = $(() => {
    const formData = {
      post_id: postId ? Number(postId) : 1,
      content: commentContent.value,
      author: authorName.value || "匿名用户",
      email: authorEmail.value,
      created_at: Date.now(),
    };

    console.log("评论表单数据:", formData);

    // 重置表单 / Reset form
    commentContent.value = "";
    authorName.value = "";
    authorEmail.value = "";
  });

  return (
    <div class={Modules.container}>
      {/* 评论表单 / Comment form */}
      <div class={Modules["comment-form"]}>
        <CommentForm
          authorName={authorName}
          authorEmail={authorEmail}
          content={commentContent}
          onSubmit={handleSubmit}
          placeholder="写下你的评论... *"
        />
      </div>

      {/* 评论列表 / Comments list */}
      <div class={Modules["comments-list"]}>
        {comments.length === 0 ? (
          <div class={Modules["empty-state"]}>暂无评论，快来抢沙发吧！</div>
        ) : (
          comments
            .filter((comment) => comment.parent_id === null)
            .map((comment) => (
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
});
