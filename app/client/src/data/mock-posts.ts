/**
 * 文章记录类型 / Post record type.
 */
export type Post = {
  id: number;
  title: string;
  category: string | null;
  storage_path: string;
  views: number;
  created_at: number;
  updated_at: number | null;
  deleted_at: number | null;
};

type PostSeed = {
  title: string;
  category: NonNullable<Post["category"]>;
  views: number;
  createdAt: string;
  updatedAt?: string;
};

const POST_SEEDS: PostSeed[] = [
  {
    title: "Building a Mock API Layer with alova",
    category: "tech",
    views: 1248,
    createdAt: "2026-05-18T09:30:00+08:00",
    updatedAt: "2026-05-19T14:20:00+08:00",
  },
  {
    title: "Infinite Scroll without Duplicate Requests",
    category: "advanced",
    views: 1182,
    createdAt: "2026-05-14T16:15:00+08:00",
  },
  {
    title: "Markdown Compatibility Checklist",
    category: "tech",
    views: 936,
    createdAt: "2026-05-09T11:00:00+08:00",
  },
  {
    title: "Designing Comment Pagination",
    category: "advanced",
    views: 862,
    createdAt: "2026-05-04T20:10:00+08:00",
  },
  {
    title: "International Routes in Next.js",
    category: "i18n",
    views: 754,
    createdAt: "2026-04-28T08:45:00+08:00",
  },
  {
    title: "Server-rendered Article Content",
    category: "tech",
    views: 690,
    createdAt: "2026-04-20T18:30:00+08:00",
  },
  {
    title: "Testing Tables and Task Lists",
    category: "advanced",
    views: 646,
    createdAt: "2026-04-12T10:25:00+08:00",
  },
  {
    title: "Sanitizing User Markdown",
    category: "tech",
    views: 588,
    createdAt: "2026-04-02T22:05:00+08:00",
  },
  {
    title: "Timeline Grouping by Year",
    category: "advanced",
    views: 533,
    createdAt: "2026-03-24T15:50:00+08:00",
  },
  {
    title: "Locale-aware Date Labels",
    category: "i18n",
    views: 488,
    createdAt: "2026-03-10T12:40:00+08:00",
  },
  {
    title: "Client Hooks for Mocked Data",
    category: "tech",
    views: 447,
    createdAt: "2026-02-22T09:15:00+08:00",
  },
  {
    title: "Reply Threads That Stay Fast",
    category: "advanced",
    views: 420,
    createdAt: "2026-02-06T17:05:00+08:00",
  },
  {
    title: "Fallback States for Empty Lists",
    category: "tech",
    views: 396,
    createdAt: "2026-01-21T13:30:00+08:00",
  },
  {
    title: "Code Blocks, Copy Buttons, and Prism",
    category: "advanced",
    views: 371,
    createdAt: "2026-01-04T19:55:00+08:00",
  },
  {
    title: "Translation Keys for Categories",
    category: "i18n",
    views: 342,
    createdAt: "2025-12-18T21:45:00+08:00",
  },
  {
    title: "Request Guards for Scroll Sentinels",
    category: "advanced",
    views: 319,
    createdAt: "2025-12-02T07:30:00+08:00",
  },
  {
    title: "Rendering Safe HTML from Markdown",
    category: "tech",
    views: 287,
    createdAt: "2025-11-17T10:10:00+08:00",
  },
  {
    title: "Long-form Content Layout Notes",
    category: "advanced",
    views: 251,
    createdAt: "2025-10-29T16:35:00+08:00",
  },
  {
    title: "Multilingual Article Metadata",
    category: "i18n",
    views: 238,
    createdAt: "2025-09-11T14:00:00+08:00",
  },
  {
    title: "Final Mock Dataset Verification",
    category: "tech",
    views: 220,
    createdAt: "2025-08-26T23:20:00+08:00",
  },
];

/**
 * 本地模拟文章列表 / Local mock post list.
 */
export const MOCK_POSTS: Post[] = POST_SEEDS.map((post, index) => {
  const id = index + 1;

  return {
    id,
    title: post.title,
    category: post.category,
    storage_path: `article/${id}.md`,
    views: post.views,
    created_at: new Date(post.createdAt).getTime(),
    updated_at: post.updatedAt ? new Date(post.updatedAt).getTime() : null,
    deleted_at: null,
  };
});
