/**
 * 评论类型定义 / Comment type definition
 */
export type Comment = {
  id: string; // 评论主键（唯一标识） / Comment primary key (unique identifier)
  post_id: string; // 所属帖子/文章 ID（外键 posts.id） / Post/article ID (foreign key posts.id)
  parent_id: string | null; // 父评论 ID（自引用 comments.id） / Parent comment ID (self-reference comments.id)
  author: string; // 作者显示名（快照字段） / Author display name (snapshot field)
  floor: string; // 楼层号（如 1、1.2） / Floor number (e.g., 1, 1.2)
  email: string; // 作者邮箱 / Author email
  content: string; // 评论内容正文 / Comment content text
  location: string; // 评论地区（必填，建议粗粒度） / Comment location (required, coarse-grained)
  created_at: string; // 创建时间（带时区） / Creation time (with timezone)
  updated_at: string | null; // 更新时间 / Update time
  deleted_at: string | null; // 软删除时间 / Soft delete time
};

/**
 * 模拟评论数据 / Mock comments data
 */
export const MOCK_COMMENTS: Comment[] = [
  // 顶级评论 1 / Top-level comment 1
  {
    id: "1",
    post_id: "message",
    parent_id: null,
    author: "TechExplorer",
    floor: "1",
    email: "techexplorer@example.com",
    content:
      "这篇文章写得太好了！特别是关于多租户架构的部分，解决了我最近项目中遇到的痛点。请问作者有没有考虑过在微服务架构下如何实现租户隔离？",
    location: "北京市海淀区",
    created_at: "2025-12-16T14:30:25+08:00",
    updated_at: null,
    deleted_at: null,
  },
  // 评论 1 的回复 1.1 / Reply 1.1 to comment 1
  {
    id: "1-1",
    post_id: "message",
    parent_id: "1",
    author: "博主",
    floor: "1.1",
    email: "author@example.com",
    content:
      "感谢支持！微服务架构下的租户隔离确实是个有趣的话题，我会在后续文章中详细探讨。简单来说，可以通过 API Gateway 层面的路由策略和服务网格来实现。",
    location: "中国",
    created_at: "2025-12-16T15:45:10+08:00",
    updated_at: null,
    deleted_at: null,
  },
  // 评论 1 的回复 1.2 / Reply 1.2 to comment 1
  {
    id: "1-2",
    post_id: "message",
    parent_id: "1",
    author: "TechExplorer",
    floor: "1.2",
    email: "techexplorer@example.com",
    content: "期待你的后续文章！已经关注了你的博客 RSS。",
    location: "北京市海淀区",
    created_at: "2025-12-16T16:05:33+08:00",
    updated_at: null,
    deleted_at: null,
  },
  // 顶级评论 2 / Top-level comment 2
  {
    id: "2",
    post_id: "message",
    parent_id: null,
    author: "CodeNinja",
    floor: "2",
    email: "codeninja@example.com",
    content:
      "文章中提到的 Better Auth 看起来很强大，但是文档好像还不够完善。有没有推荐的学习资源或者实战项目可以参考？",
    location: "上海市浦东新区",
    created_at: "2025-12-16T11:20:15+08:00",
    updated_at: null,
    deleted_at: null,
  },
  // 顶级评论 3 / Top-level comment 3
  {
    id: "3",
    post_id: "message",
    parent_id: null,
    author: "DevMaster",
    floor: "3",
    email: "devmaster@example.com",
    content:
      "代码示例非常清晰！不过我注意到在生产环境中，租户 ID 的验证可能还需要考虑性能问题。如果租户数量很大，每次请求都查询数据库会不会成为瓶颈？",
    location: "中国",
    created_at: "2025-12-15T16:30:42+08:00",
    updated_at: null,
    deleted_at: null,
  },
  // 评论 3 的回复 3.1 / Reply 3.1 to comment 3
  {
    id: "3-1",
    post_id: "message",
    parent_id: "3",
    author: "博主",
    floor: "3.1",
    email: "author@example.com",
    content:
      "好问题！确实需要考虑性能优化。通常的做法是在 JWT token 中包含租户信息，或者使用 Redis 缓存租户权限数据，避免每次都查询数据库。",
    location: "中国",
    created_at: "2025-12-15T17:15:20+08:00",
    updated_at: null,
    deleted_at: null,
  },
  // 顶级评论 4 / Top-level comment 4
  {
    id: "4",
    post_id: "message",
    parent_id: null,
    author: "FrontendGuru",
    floor: "4",
    email: "frontendguru@example.com",
    content:
      "View Transitions API 真的太酷了！我在自己的项目中也尝试使用了，但是在 Safari 上的兼容性还是有点问题。期待浏览器厂商能尽快完善支持。",
    location: "广东省深圳市",
    created_at: "2025-12-14T09:45:18+08:00",
    updated_at: null,
    deleted_at: null,
  },
  // 顶级评论 5 / Top-level comment 5
  {
    id: "5",
    post_id: "message",
    parent_id: null,
    author: "学习中的小白",
    floor: "5",
    email: "newbie@example.com",
    content:
      "作为一个刚入门的开发者，这篇文章对我来说有点难度，但是我还是努力看完了。请问有没有更基础的教程推荐？特别是关于认证和授权的部分。",
    location: "中国",
    created_at: "2025-12-13T20:10:55+08:00",
    updated_at: null,
    deleted_at: null,
  },
  // 评论 5 的回复 5.1 / Reply 5.1 to comment 5
  {
    id: "5-1",
    post_id: "message",
    parent_id: "5",
    author: "热心网友",
    floor: "5.1",
    email: "helper@example.com",
    content:
      "推荐你先看看 MDN 上关于 Web Authentication 的文档，然后再回来看这篇文章会更容易理解。加油！",
    location: "中国",
    created_at: "2025-12-13T21:30:40+08:00",
    updated_at: null,
    deleted_at: null,
  },
  // 顶级评论 6 / Top-level comment 6
  {
    id: "6",
    post_id: "message",
    parent_id: null,
    author: "FullStackDev",
    floor: "6",
    email: "fullstackdev@example.com",
    content:
      "Paraglide JS 的性能确实比 i18next 好很多，我在项目中切换后，首屏加载时间减少了 30%。强烈推荐给需要国际化的项目！",
    location: "浙江省杭州市",
    created_at: "2025-12-12T14:25:30+08:00",
    updated_at: null,
    deleted_at: null,
  },
  // 顶级评论 7 / Top-level comment 7
  {
    id: "7",
    post_id: "message",
    parent_id: null,
    author: "SecurityExpert",
    floor: "7",
    email: "securityexpert@example.com",
    content:
      "文章中的 XSS 防护测试很有意思。建议在实际项目中还要考虑 CSRF、SQL 注入等其他安全问题。安全无小事！",
    location: "中国",
    created_at: "2025-12-11T10:15:22+08:00",
    updated_at: null,
    deleted_at: null,
  },
  // 评论 7 的回复 7.1 / Reply 7.1 to comment 7
  {
    id: "7-1",
    post_id: "message",
    parent_id: "7",
    author: "博主",
    floor: "7.1",
    email: "author@example.com",
    content:
      "非常感谢提醒！安全确实是一个系统工程，我会在后续文章中专门讨论 Web 安全最佳实践。",
    location: "中国",
    created_at: "2025-12-11T11:20:45+08:00",
    updated_at: null,
    deleted_at: null,
  },
  // 顶级评论 8 / Top-level comment 8
  {
    id: "8",
    post_id: "message",
    parent_id: null,
    author: "OpenSourceFan",
    floor: "8",
    email: "opensourcefan@example.com",
    content:
      "看到你的博客是开源的，已经 star 了！代码质量很高，学到了很多。希望能有机会为项目贡献代码。",
    location: "四川省成都市",
    created_at: "2025-12-09T16:40:12+08:00",
    updated_at: null,
    deleted_at: null,
  },
  // 顶级评论 9 / Top-level comment 9
  {
    id: "9",
    post_id: "message",
    parent_id: null,
    author: "DesignLover",
    floor: "9",
    email: "designlover@example.com",
    content:
      "博客的设计很漂亮！特别喜欢这个深色主题和粒子背景效果。请问是用什么技术栈实现的？",
    location: "中国",
    created_at: "2025-12-09T13:25:50+08:00",
    updated_at: null,
    deleted_at: null,
  },
  // 评论 9 的回复 9.1 / Reply 9.1 to comment 9
  {
    id: "9-1",
    post_id: "message",
    parent_id: "9",
    author: "博主",
    floor: "9.1",
    email: "author@example.com",
    content:
      "谢谢！博客使用 Qwik + TypeScript 构建，粒子效果是自己封装的组件。代码都在 GitHub 上，欢迎查看。",
    location: "中国",
    created_at: "2025-12-09T14:10:35+08:00",
    updated_at: null,
    deleted_at: null,
  },
  // 顶级评论 10 / Top-level comment 10
  {
    id: "10",
    post_id: "message",
    parent_id: null,
    author: "路过的访客",
    floor: "10",
    email: "visitor@example.com",
    content:
      "偶然搜索到这篇文章，内容很实用。已经收藏了，准备在下个项目中尝试这些技术方案。",
    location: "中国",
    created_at: "2025-12-02T18:30:25+08:00",
    updated_at: null,
    deleted_at: null,
  },
  // 顶级评论 11 / Top-level comment 11
  {
    id: "11",
    post_id: "message",
    parent_id: null,
    author: "PerformanceGeek",
    floor: "11",
    email: "performancegeek@example.com",
    content:
      "注意到你的博客加载速度非常快，Lighthouse 评分应该很高吧？能分享一下性能优化的经验吗？",
    location: "江苏省南京市",
    created_at: "2025-12-02T15:20:40+08:00",
    updated_at: null,
    deleted_at: null,
  },
  // 顶级评论 12 / Top-level comment 12
  {
    id: "12",
    post_id: "message",
    parent_id: null,
    author: "BackendEngineer",
    floor: "12",
    email: "backendengineer@example.com",
    content:
      "多租户架构的数据库设计部分讲得很透彻。我们公司正在做 SaaS 平台改造，这篇文章给了我很多启发。感谢分享！",
    location: "中国",
    created_at: "2025-11-25T09:15:30+08:00",
    updated_at: null,
    deleted_at: null,
  },
  // 评论 12 的回复 12.1 / Reply 12.1 to comment 12
  {
    id: "12-1",
    post_id: "message",
    parent_id: "12",
    author: "博主",
    floor: "12.1",
    email: "author@example.com",
    content: "很高兴能帮到你！如果在实施过程中遇到问题，欢迎随时交流。",
    location: "中国",
    created_at: "2025-11-25T10:30:15+08:00",
    updated_at: null,
    deleted_at: null,
  },
];
