/**
 * 评论类型定义 / Comment type definition
 */
export type Comment = {
  id: string; // 评论唯一标识 / Unique comment identifier
  author: string; // 作者名称 / Author name
  avatar: string; // 头像 URL / Avatar URL
  content: string; // 评论内容 / Comment content
  time: string; // 时间字符串 (YYYY/MM/DD HH:MM:SS) / Time string (YYYY/MM/DD HH:MM:SS)
  floor: number; // 楼层号 / Floor number
  location?: string; // 地理位置 / Geographic location
  loginType?: "github" | "google" | "anonymous"; // 登录方式 / Login type
  replies?: Comment[]; // 回复列表 / Replies list
};

/**
 * 模拟评论数据 / Mock comments data
 */
export const MOCK_COMMENTS: Comment[] = [
  {
    id: "1",
    author: "TechExplorer",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=TechExplorer",
    content:
      "这篇文章写得太好了！特别是关于多租户架构的部分，解决了我最近项目中遇到的痛点。请问作者有没有考虑过在微服务架构下如何实现租户隔离？",
    time: "2025/12/16 14:30:25",
    floor: 1,
    location: "北京市海淀区",
    loginType: "github",
    replies: [
      {
        id: "1-1",
        author: "博主",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Author",
        content:
          "感谢支持！微服务架构下的租户隔离确实是个有趣的话题，我会在后续文章中详细探讨。简单来说，可以通过 API Gateway 层面的路由策略和服务网格来实现。",
        time: "2025/12/16 15:45:10",
        floor: 1.1,
        loginType: "github",
      },
      {
        id: "1-2",
        author: "TechExplorer",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=TechExplorer",
        content: "期待你的后续文章！已经关注了你的博客 RSS。",
        time: "2025/12/16 16:05:33",
        floor: 1.2,
        loginType: "github",
      },
    ],
  },
  {
    id: "2",
    author: "CodeNinja",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=CodeNinja",
    content:
      "文章中提到的 Better Auth 看起来很强大，但是文档好像还不够完善。有没有推荐的学习资源或者实战项目可以参考？",
    time: "2025/12/16 11:20:15",
    floor: 2,
    location: "上海市浦东新区",
    loginType: "github",
  },
  {
    id: "3",
    author: "DevMaster",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=DevMaster",
    content:
      "代码示例非常清晰！不过我注意到在生产环境中，租户 ID 的验证可能还需要考虑性能问题。如果租户数量很大，每次请求都查询数据库会不会成为瓶颈？",
    time: "2025/12/15 16:30:42",
    floor: 3,
    loginType: "google",
    replies: [
      {
        id: "3-1",
        author: "博主",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Author",
        content:
          "好问题！确实需要考虑性能优化。通常的做法是在 JWT token 中包含租户信息，或者使用 Redis 缓存租户权限数据，避免每次都查询数据库。",
        time: "2025/12/15 17:15:20",
        floor: 3.1,
        loginType: "github",
      },
    ],
  },
  {
    id: "4",
    author: "FrontendGuru",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=FrontendGuru",
    content:
      "View Transitions API 真的太酷了！我在自己的项目中也尝试使用了，但是在 Safari 上的兼容性还是有点问题。期待浏览器厂商能尽快完善支持。",
    time: "2025/12/14 09:45:18",
    floor: 4,
    location: "广东省深圳市",
    loginType: "github",
  },
  {
    id: "5",
    author: "学习中的小白",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Newbie",
    content:
      "作为一个刚入门的开发者，这篇文章对我来说有点难度，但是我还是努力看完了。请问有没有更基础的教程推荐？特别是关于认证和授权的部分。",
    time: "2025/12/13 20:10:55",
    floor: 5,
    loginType: "anonymous",
    replies: [
      {
        id: "5-1",
        author: "热心网友",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Helper",
        content:
          "推荐你先看看 MDN 上关于 Web Authentication 的文档，然后再回来看这篇文章会更容易理解。加油！",
        time: "2025/12/13 21:30:40",
        floor: 5.1,
        loginType: "google",
      },
    ],
  },
  {
    id: "6",
    author: "FullStackDev",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=FullStack",
    content:
      "Paraglide JS 的性能确实比 i18next 好很多，我在项目中切换后，首屏加载时间减少了 30%。强烈推荐给需要国际化的项目！",
    time: "2025/12/12 14:25:30",
    floor: 6,
    location: "浙江省杭州市",
    loginType: "github",
  },
  {
    id: "7",
    author: "SecurityExpert",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Security",
    content:
      "文章中的 XSS 防护测试很有意思。建议在实际项目中还要考虑 CSRF、SQL 注入等其他安全问题。安全无小事！",
    time: "2025/12/11 10:15:22",
    floor: 7,
    loginType: "github",
    replies: [
      {
        id: "7-1",
        author: "博主",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Author",
        content:
          "非常感谢提醒！安全确实是一个系统工程，我会在后续文章中专门讨论 Web 安全最佳实践。",
        time: "2025/12/11 11:20:45",
        floor: 7.1,
        loginType: "github",
      },
    ],
  },
  {
    id: "8",
    author: "OpenSourceFan",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=OpenSource",
    content:
      "看到你的博客是开源的，已经 star 了！代码质量很高，学到了很多。希望能有机会为项目贡献代码。",
    time: "2025/12/9 16:40:12",
    floor: 8,
    location: "四川省成都市",
    loginType: "github",
  },
  {
    id: "9",
    author: "DesignLover",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Design",
    content:
      "博客的设计很漂亮！特别喜欢这个深色主题和粒子背景效果。请问是用什么技术栈实现的？",
    time: "2025/12/9 13:25:50",
    floor: 9,
    loginType: "google",
    replies: [
      {
        id: "9-1",
        author: "博主",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Author",
        content:
          "谢谢！博客使用 Qwik + TypeScript 构建，粒子效果是自己封装的组件。代码都在 GitHub 上，欢迎查看。",
        time: "2025/12/9 14:10:35",
        floor: 9.1,
        loginType: "github",
      },
    ],
  },
  {
    id: "10",
    author: "路过的访客",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Visitor",
    content:
      "偶然搜索到这篇文章，内容很实用。已经收藏了，准备在下个项目中尝试这些技术方案。",
    time: "2025/12/2 18:30:25",
    floor: 10,
    loginType: "anonymous",
  },
  {
    id: "11",
    author: "PerformanceGeek",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Performance",
    content:
      "注意到你的博客加载速度非常快，Lighthouse 评分应该很高吧？能分享一下性能优化的经验吗？",
    time: "2025/12/2 15:20:40",
    floor: 11,
    location: "江苏省南京市",
    loginType: "github",
  },
  {
    id: "12",
    author: "BackendEngineer",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Backend",
    content:
      "多租户架构的数据库设计部分讲得很透彻。我们公司正在做 SaaS 平台改造，这篇文章给了我很多启发。感谢分享！",
    time: "2025/11/25 09:15:30",
    floor: 12,
    loginType: "github",
    replies: [
      {
        id: "12-1",
        author: "博主",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Author",
        content:
          "很高兴能帮到你！如果在实施过程中遇到问题，欢迎随时交流。",
        time: "2025/11/25 10:30:15",
        floor: 12.1,
        loginType: "github",
      },
    ],
  },
];
