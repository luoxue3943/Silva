/**
 * 评论记录类型 / Comment record type.
 */
export type Comment = {
  id: number;
  post_id: number;
  parent_id: number | null;
  author: string;
  floor: number;
  email: string;
  content: string;
  location: string;
  created_at: number;
  updated_at: number | null;
  deleted_at: number | null;
};

const AUTHORS = [
  "Ada",
  "Linus",
  "Grace",
  "Ken",
  "Mira",
  "Nolan",
  "Rhea",
  "Tao",
  "Vera",
  "Yuki",
] as const;

const LOCATIONS = [
  "Shanghai",
  "Beijing",
  "Shenzhen",
  "Hangzhou",
  "Chengdu",
  "Nanjing",
  "Guangzhou",
  "Suzhou",
] as const;

let nextCommentId = 1;

function makeComment(options: {
  postId: number;
  parentId: number | null;
  floor: number;
  content: string;
  offsetHours: number;
}): Comment {
  const id = nextCommentId;
  const author = AUTHORS[id % AUTHORS.length] ?? AUTHORS[0];

  nextCommentId += 1;

  return {
    id,
    post_id: options.postId,
    parent_id: options.parentId,
    author,
    floor: options.floor,
    email: `${author.toLowerCase()}${id}@example.com`,
    content: options.content,
    location: LOCATIONS[id % LOCATIONS.length] ?? LOCATIONS[0],
    created_at:
      new Date("2026-05-23T12:00:00+08:00").getTime() -
      options.offsetHours * 60 * 60 * 1000,
    updated_at: null,
    deleted_at: null,
  };
}

function appendThread(
  target: Comment[],
  options: {
    postId: number;
    floor: number;
    replyCount: number;
    sourceLabel: string;
  },
) {
  const root = makeComment({
    postId: options.postId,
    parentId: null,
    floor: options.floor,
    offsetHours: options.floor * 7,
    content: `${options.sourceLabel} comment ${options.floor}: this entry is part of the pagination dataset and should remain stable across reloads.`,
  });

  target.push(root);

  for (let index = 1; index <= options.replyCount; index += 1) {
    target.push(
      makeComment({
        postId: options.postId,
        parentId: root.id,
        floor: Number(`${options.floor}.${index}`),
        offsetHours: options.floor * 7 + index,
        content: `Reply ${index} for comment ${options.floor}: loaded in groups of five to exercise the child pagination button.`,
      }),
    );
  }
}

function buildSiteComments() {
  const comments: Comment[] = [];

  for (let floor = 1; floor <= 16; floor += 1) {
    appendThread(comments, {
      postId: 0,
      floor,
      replyCount: floor <= 4 ? 7 : floor % 3,
      sourceLabel: "Site",
    });
  }

  return comments;
}

function buildArticleComments() {
  const comments: Comment[] = [];

  for (let floor = 1; floor <= 18; floor += 1) {
    appendThread(comments, {
      postId: 1,
      floor,
      replyCount: floor <= 5 ? 8 : floor % 4,
      sourceLabel: "Article 1",
    });
  }

  for (let postId = 2; postId <= 20; postId += 1) {
    for (let floor = 1; floor <= 6; floor += 1) {
      appendThread(comments, {
        postId,
        floor,
        replyCount: floor <= 2 ? 6 : floor % 2,
        sourceLabel: `Article ${postId}`,
      });
    }
  }

  return comments;
}

/**
 * 本地模拟站点级评论 / Local mock site-level comments.
 */
export const MOCK_SITE_COMMENTS: Comment[] = buildSiteComments();

/**
 * 本地模拟文章级评论 / Local mock article-level comments.
 */
export const MOCK_ARTICLE_COMMENTS: Comment[] = buildArticleComments();

/**
 * 兼容仍需完整模拟评论列表的调用方 / Compatibility export for callers that still need the full mock list.
 */
export const MOCK_COMMENTS: Comment[] = [
  ...MOCK_SITE_COMMENTS,
  ...MOCK_ARTICLE_COMMENTS,
];
