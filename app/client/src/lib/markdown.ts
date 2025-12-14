import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import rehypePrismPlus from "rehype-prism-plus";
import rehypeStringify from "rehype-stringify";
import { visit } from "unist-util-visit";
import type { Root, HTML } from "mdast";
import type { Element } from "hast";

/**
 * 自定义 remark 插件：将所有 HTML 节点转换为纯文本节点
 * 这样可以防止 Markdown 中的原生 HTML 被渲染为真实 DOM
 * 例如：<script>alert(1)</script> 会被转义显示为文本
 */
function remarkHtmlToText() {
  return (tree: Root) => {
    visit(tree, "html", (node, index, parent) => {
      if (parent && typeof index === "number") {
        // 将 html 节点替换为 text 节点
        parent.children[index] = {
          type: "text",
          value: node.value,
        } as any;
      }
    });
  };
}

/**
 * 自定义 rehype 插件：为代码块添加复制按钮和语言标签
 */
function rehypeCodeBlock() {
  return (tree: any) => {
    visit(tree, "element", (node: Element, index, parent) => {
      if (node.tagName === "pre" && node.children[0]?.type === "element") {
        const codeNode = node.children[0] as Element;
        if (codeNode.tagName === "code") {
          // 提取语言
          const className = codeNode.properties?.className as string[] | undefined;
          const languageClass = className?.find((c) => c.startsWith("language-"));
          const language = languageClass?.replace("language-", "") || "text";

          // 提取代码内容
          const getTextContent = (node: any): string => {
            if (node.type === "text") return node.value;
            if (node.children) {
              return node.children.map(getTextContent).join("");
            }
            return "";
          };
          const code = getTextContent(codeNode);

          // 创建包装容器
          const wrapper: Element = {
            type: "element",
            tagName: "div",
            properties: { className: ["code-block-wrapper"] },
            children: [
              // 顶部工具栏
              {
                type: "element",
                tagName: "div",
                properties: { className: ["code-block-header"] },
                children: [
                  // 语言标签
                  {
                    type: "element",
                    tagName: "span",
                    properties: { className: ["code-block-language"] },
                    children: [{ type: "text", value: language }],
                  },
                  // 复制按钮
                  {
                    type: "element",
                    tagName: "button",
                    properties: {
                      className: ["code-block-copy"],
                      "data-code": code,
                      type: "button",
                      "aria-label": "复制代码",
                    },
                    children: [
                      {
                        type: "element",
                        tagName: "span",
                        properties: { className: ["icon-[mynaui--copy]"] },
                        children: [],
                      },
                    ],
                  },
                ],
              },
              // 原始 pre 代码块
              node,
            ],
          };

          // 替换原节点
          if (parent && typeof index === "number") {
            parent.children[index] = wrapper;
          }
        }
      }
    });
  };
}

/**
 * 将 Markdown 字符串编译为安全的 HTML
 *
 * 安全措施：
 * 1. remarkHtmlToText: 将 Markdown 中的原生 HTML 转为纯文本（不会执行）
 * 2. remark-rehype: 不启用 allowDangerousHtml（默认 false）
 * 3. rehype-sanitize: 自定义 schema，只允许安全的标签和属性
 * 4. rehype-prism-plus: 代码高亮（服务端编译）
 *
 * @param markdown - 原始 Markdown 字符串
 * @returns 编译后的 HTML 字符串
 */
export async function markdownToHtml(markdown: string): Promise<string> {
  const processor = unified()
    // 1. 解析 Markdown
    .use(remarkParse)

    // 2. 支持 GFM（表格、删除线、任务列表等）
    .use(remarkGfm)

    // 3. 将 HTML 节点转为文本节点（安全措施）
    .use(remarkHtmlToText)

    // 4. 转换为 rehype AST（不允许危险 HTML）
    .use(remarkRehype, { allowDangerousHtml: false })

    // 5. Prism 代码高亮（服务端编译）
    .use(rehypePrismPlus, {
      ignoreMissing: true, // 忽略未知语言
      showLineNumbers: false, // 可选：开启行号需要额外 CSS
    })

    // 6. 添加代码块复制按钮和语言标签
    .use(rehypeCodeBlock)

    // 7. 清理 HTML（自定义 schema）
    // 注意：必须允许 Prism 生成的所有 class，包括 token.*
    .use(rehypeSanitize, {
      ...defaultSchema,
      attributes: {
        ...defaultSchema.attributes,
        // 允许 code 标签的所有 class（Prism 需要）
        code: [
          ...(defaultSchema.attributes?.code || []),
          ["className", /.*/], // 允许所有 class
        ],
        // 允许 pre 标签的所有 class
        pre: [
          ...(defaultSchema.attributes?.pre || []),
          ["className", /.*/], // 允许所有 class
        ],
        // 允许 span 标签的所有 class（Prism token 需要）
        span: [
          ...(defaultSchema.attributes?.span || []),
          ["className", /.*/], // 允许所有 class
        ],
        // 允许 div 标签的 class（代码块包装器）
        div: [
          ...(defaultSchema.attributes?.div || []),
          ["className", /.*/],
        ],
        // 允许 button 标签的属性（复制按钮）
        button: [
          ["className", /.*/],
          ["dataCode", /.*/],
          ["type", /^button$/],
          ["ariaLabel", /.*/],
        ],
      },
      // 允许 button 标签
      tagNames: [
        ...(defaultSchema.tagNames || []),
        "button",
      ].filter((tag) => !["script", "style", "iframe"].includes(tag)),
    })

    // 8. 转换为 HTML 字符串
    .use(rehypeStringify);

  const result = await processor.process(markdown);
  return String(result);
}
