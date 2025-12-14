import { MOCK_POSTS } from "@/data/mock-posts";
import { SilvaConfig } from "@/lib/config-loader";
import { markdownToHtml } from "@/lib/markdown";
import * as m from "@/paraglide/messages";
import { getLocale } from "@/paraglide/runtime";
import {
  $,
  component$,
  useOnWindow,
  useSignal,
  useVisibleTask$,
} from "@builder.io/qwik";
import { Link, routeLoader$ } from "@builder.io/qwik-city";
import Modules from "../posts.module.scss";
import styles from "./posts.module.scss";

/**
 * 目录项类型定义 / Table of contents item type
 */
interface TocItem {
  id: string;
  text: string;
  level: number;
}

/**
 * 服务端 Loader：获取文章并编译 Markdown / Server-side Loader: Fetch post and compile Markdown
 */
export const usePost = routeLoader$(async ({ params, status, url }) => {
  const { id } = params;

  // 从 MOCK_POSTS 中查找文章 / Find post from MOCK_POSTS
  const post = MOCK_POSTS.find((p) => p.id === id);

  if (!post) {
    status(404);
    return null;
  }

  // 在服务端编译 Markdown 为 HTML / Compile Markdown to HTML on server
  const htmlContent = await markdownToHtml(post.content);

  // 生成完整的文章链接 / Generate full post URL
  const fullUrl = `${url.origin}/posts/${id}`;

  // 从 HTML 中提取标题生成目录 / Extract headings from HTML to build TOC
  const tocItems: TocItem[] = [];
  const headingRegex = /<h([1-4])>(.*?)<\/h\1>/g;
  let match;
  let index = 0;

  while ((match = headingRegex.exec(htmlContent)) !== null) {
    const level = parseInt(match[1]);
    // 移除 HTML 标签，只保留文本 / Strip HTML tags, keep text only
    const text = match[2].replace(/<[^>]*>/g, "").trim();
    const id = `heading-${index}`;
    tocItems.push({ id, text, level });
    index++;
  }

  return {
    ...post,
    htmlContent,
    fullUrl,
    tocItems,
  };
});

export default component$(() => {
  const post = usePost();
  const locale = getLocale();
  const langCode = locale.split("-")[0];
  const siteOwnerName =
    SilvaConfig.site[`name_${langCode}`] ?? SilvaConfig.site.name;
  const activeId = useSignal<string>("");
  const scrollProgress = useSignal<number>(0);
  const isProgrammaticScroll = useSignal<boolean>(false);

  // 为标题添加 id 和设置复制按钮事件 / Add IDs to headings and setup copy button handlers
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    if (!post.value?.tocItems) return;

    const article = document.querySelector("article");
    if (!article) return;

    // 为标题添加 id（只处理 markdown 内容中的标题）/ Add IDs to headings (only in markdown content)
    const markdownSection = article.querySelector(`.${styles.markdown}`);
    if (markdownSection) {
      const headings = markdownSection.querySelectorAll("h1, h2, h3, h4");
      headings.forEach((heading, index) => {
        if (!heading.id && post.value?.tocItems[index]) {
          heading.id = post.value.tocItems[index].id;
        }
      });
    }

    // 初始化时设置默认高亮第一个标题 / Highlight first heading by default on init
    if (post.value.tocItems.length > 0) {
      activeId.value = post.value.tocItems[0].id;
    }

    // 为复制按钮添加点击事件 / Add click handlers to copy buttons
    const copyButtons = article.querySelectorAll(".code-block-copy");
    copyButtons.forEach((button) => {
      button.addEventListener("click", async () => {
        // 尝试多种方式获取代码内容 / Try multiple ways to get code content
        let code =
          button.getAttribute("data-code") || button.getAttribute("datacode");

        // 如果属性被过滤了，直接从 pre 元素获取代码 / Fallback to pre element if attributes are filtered
        if (!code) {
          const wrapper = button.closest(".code-block-wrapper");
          const pre = wrapper?.querySelector("pre");
          code = pre?.textContent || "";
        }

        if (!code) {
          console.error("无法获取代码内容");
          return;
        }

        try {
          await navigator.clipboard.writeText(code);

          // 获取图标元素并切换为对勾 / Switch icon to checkmark
          const icon = button.querySelector("span");
          if (icon) {
            icon.className = "icon-[mynaui--check-solid]";
          }
          button.classList.add("copied");

          // 2秒后恢复为复制图标 / Restore copy icon after 2 seconds
          setTimeout(() => {
            if (icon) {
              icon.className = "icon-[mynaui--copy-solid]";
            }
            button.classList.remove("copied");
          }, 2000);
        } catch (err) {
          console.error("复制失败:", err);
        }
      });
    });
  });

  // 监听滚动事件 / Listen to scroll events
  useOnWindow(
    "scroll",
    $(() => {
      if (!post.value?.tocItems || isProgrammaticScroll.value) return;

      // 计算滚动进度 / Calculate scroll progress
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      const progress = (scrollTop / (documentHeight - windowHeight)) * 100;
      scrollProgress.value = Math.min(100, Math.max(0, progress));

      // 找到当前可见的标题 / Find currently visible heading
      const headings = post.value.tocItems.map((item) => ({
        id: item.id,
        element: document.getElementById(item.id),
      }));

      let currentId = "";
      // 从后往前遍历，找到第一个在视口上方或刚进入视口的标题 / Iterate backwards to find first heading above or entering viewport
      for (let i = headings.length - 1; i >= 0; i--) {
        const heading = headings[i];
        if (heading.element) {
          const rect = heading.element.getBoundingClientRect();
          // 标题在视口顶部 150px 以上（已经滚过）/ Heading is 150px above viewport top (scrolled past)
          if (rect.top <= 150) {
            currentId = heading.id;
            break;
          }
        }
      }

      // 如果没有找到任何标题（还没滚动到第一个标题），默认高亮第一个 / Default to first heading if none found
      if (!currentId && headings.length > 0) {
        currentId = headings[0].id;
      }

      activeId.value = currentId;
    }),
  );

  const handleTocClick = $((id: string) => {
    const element = document.getElementById(id);
    if (element) {
      // 设置标志，暂停滚动事件处理 / Set flag to pause scroll event handling
      isProgrammaticScroll.value = true;

      const top = element.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top, behavior: "smooth" });

      // 滚动结束后重置标志 / Reset flag after scroll completes
      setTimeout(() => {
        isProgrammaticScroll.value = false;
      }, 150);
    }
  });

  // 404 处理 / Handle 404
  if (!post.value) {
    return (
      <div class="mx-auto max-w-3xl px-4 py-10 text-center">
        <h1 class="mb-4 text-3xl font-bold">404 - {m["PostDetail.notFound"]()}</h1>
        <Link href="/posts" class="text-blue-500 hover:underline">
          ← {m["PostDetail.backToList"]()}
        </Link>
      </div>
    );
  }

  return (
    <div class="mx-auto max-w-7xl px-4 py-10">
      <div class="flex gap-8">
        <article class="mx-auto max-w-4xl flex-1 space-y-4">
          <div class="mb-6 text-center">
            <h1 class="mb-4 font-bold" style="font-size: 2.25rem">
              {post.value.title}
            </h1>
            <div class="flex items-center justify-center gap-2 text-sm text-gray-400">
              <span class={Modules.label}>
                <span class="icon-[mynaui--clock-four]" />
                <span>{post.value.lastModified || post.value.date}</span>
              </span>
              <span class={Modules.label}>
                <span class="icon-[mynaui--hash-circle] h-4 w-3" />
                <span>{post.value.category}</span>
              </span>
              <span class={Modules.label}>
                <span class="icon-[mynaui--eye]" />
                <span>{post.value.views}</span>
              </span>
            </div>
          </div>

          <hr class="border-gray-800" />

          {/*
          使用 dangerouslySetInnerHTML 渲染编译后的 HTML
        */}
          <section
            class={styles.markdown}
            dangerouslySetInnerHTML={post.value.htmlContent}
          />
        </article>

        {/* 目录组件 */}
        <aside class={styles.toc}>
          <div class={styles.progress}>
            <div
              class={styles["progress-bar"]}
              style={`height: ${scrollProgress.value}%`}
            />
          </div>

          <nav class={styles.nav}>
            {post.value.tocItems?.map((item) => (
              <button
                key={item.id}
                class={[
                  styles.item,
                  styles[`level-${item.level}`],
                  activeId.value === item.id ? styles.active : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick$={() => handleTocClick(item.id)}
              >
                {item.text}
              </button>
            ))}
          </nav>
        </aside>
      </div>

      {/* 文章元数据信息 */}
      <div class="mt-12 w-full border-t border-gray-800 pt-8 text-center">
        <div class="mb-4 text-sm text-gray-400">
          <p>{m["PostDetail.author"]()}：{siteOwnerName}</p>
          <p>
            {m["PostDetail.link"]()}：
            <a
              href={post.value.fullUrl}
              style="color: rgb(122.77 241.32 167.54)"
              class="hover:underline"
            >
              {post.value.fullUrl}
            </a>
          </p>
        </div>

        <div class="text-xs leading-relaxed text-gray-500">
          <p>
            {m["PostDetail.commercialLicense"]()}
          </p>
          <p class="mt-2">
            {m["PostDetail.licenseText"]()}{" "}
            <a
              href="https://creativecommons.org/licenses/by-nc-sa/4.0/"
              target="_blank"
              rel="noopener noreferrer"
              style="color: rgb(122.77 241.32 167.54)"
              class="hover:underline"
            >
              CC BY-NC-SA 4.0
            </a>{" "}
            - {m["PostDetail.licenseName"]()}
          </p>
        </div>
      </div>
    </div>
  );
});
