import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";

/**
 * 本地文章读取工具 / Local article reading utilities
 *
 * 从项目 article 目录读取 Markdown，并为缺失文件提供回退内容。
 * Read Markdown from the project article directory and provide fallback content when missing
 */

const ARTICLE_ROOT = path.join(process.cwd(), "article");

/**
 * 读取指定文章的 Markdown 内容 / Read Markdown content for the given post
 */
export async function readArticleMarkdown(postId: number) {
  const articlePath = path.join(ARTICLE_ROOT, `${postId}.md`);

  try {
    return await readFile(articlePath, "utf8");
  } catch {
    // 本地文章缺失时仍返回可渲染内容 / Keep rendering possible when the local article file is missing
    return `# Article ${postId}\n\nThis article file is missing.`;
  }
}
