import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";

const ARTICLE_ROOT = path.join(process.cwd(), "article");

export async function readArticleMarkdown(postId: number) {
  const articlePath = path.join(ARTICLE_ROOT, `${postId}.md`);

  try {
    return await readFile(articlePath, "utf8");
  } catch {
    return `# Article ${postId}\n\nThis article file is missing.`;
  }
}
