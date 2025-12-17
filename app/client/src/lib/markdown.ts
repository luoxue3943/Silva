/**
 * Markdown 处理工具 / Markdown Processing Utilities
 *
 * 提供安全的 Markdown 到 HTML 转换功能，包含代码高亮和复制功能
 * Provides safe Markdown to HTML conversion with code highlighting and copy functionality
 */
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import rehypePrismPlus from "rehype-prism-plus";
import rehypeStringify from "rehype-stringify";
import { visit } from "unist-util-visit";
import type { Root } from "mdast";

/** HTML 元素节点类型 / HTML element node type */
type Element = {
  type: "element";
  tagName: string;
  properties?: Record<string, any>;
  children?: any[];
};

/**
 * 自定义 remark 插件：将所有 HTML 节点转换为纯文本节点 / Custom remark plugin: Convert all HTML nodes to plain text nodes
 *
 * 防止 Markdown 中的原生 HTML 被渲染为真实 DOM / Prevents native HTML in Markdown from being rendered as real DOM
 * 例如 / For example: <script>alert(1)</script> 会被转义显示为文本 / will be escaped and displayed as text
 */
function remarkHtmlToText() {
  return (tree: Root) => {
    visit(tree, "html", (node, index, parent) => {
      if (parent && typeof index === "number") {
        // 将 html 节点替换为 text 节点 / Replace html node with text node
        parent.children[index] = {
          type: "text",
          value: node.value,
        } as any;
      }
    });
  };
}

/**
 * 自定义 rehype 插件：为代码块添加复制按钮和语言标签 / Custom rehype plugin: Add copy button and language label to code blocks
 */
function rehypeCodeBlock() {
  return (tree: any) => {
    visit(tree, "element", (node: Element, index, parent) => {
      if (node.tagName === "pre" && node.children?.[0]?.type === "element") {
        const codeNode = node.children[0] as Element;
        if (codeNode.tagName === "code") {
          // 提取语言 / Extract language
          const className = codeNode.properties?.className as string[] | undefined;
          const languageClass = className?.find((c) => c.startsWith("language-"));
          const language = languageClass?.replace("language-", "") || "text";

          // 提取代码内容 / Extract code content
          const getTextContent = (node: any): string => {
            if (node.type === "text") return node.value;
            if (node.children) {
              return node.children.map(getTextContent).join("");
            }
            return "";
          };
          const code = getTextContent(codeNode);

          // 创建包装容器 / Create wrapper container
          const wrapper: Element = {
            type: "element",
            tagName: "div",
            properties: { className: ["code-block-wrapper"] },
            children: [
              // 顶部工具栏 / Top toolbar
              {
                type: "element",
                tagName: "div",
                properties: { className: ["code-block-header"] },
                children: [
                  // 语言标签 / Language label
                  {
                    type: "element",
                    tagName: "span",
                    properties: { className: ["code-block-language"] },
                    children: [{ type: "text", value: language }],
                  },
                  // 复制按钮 / Copy button
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
                        properties: { className: ["icon-[mynaui--copy-solid]"] },
                        children: [],
                      },
                    ],
                  },
                ],
              },
              // 原始 pre 代码块 / Original pre code block
              node,
            ],
          };

          // 替换原节点 / Replace original node
          if (parent && typeof index === "number") {
            parent.children[index] = wrapper;
          }
        }
      }
    });
  };
}

/**
 * 将 Markdown 字符串编译为安全的 HTML / Compile Markdown string to safe HTML
 *
 * 安全措施 / Security measures:
 * 1. remarkHtmlToText: 将 Markdown 中的原生 HTML 转为纯文本（不会执行） / Convert native HTML in Markdown to plain text (won't execute)
 * 2. remark-rehype: 不启用 allowDangerousHtml（默认 false） / Don't enable allowDangerousHtml (default false)
 * 3. rehype-sanitize: 自定义 schema，只允许安全的标签和属性 / Custom schema, only allow safe tags and attributes
 * 4. rehype-prism-plus: 代码高亮（服务端编译） / Code highlighting (server-side compilation)
 *
 * @param markdown 原始 Markdown 字符串 / Raw Markdown string
 * @returns 编译后的 HTML 字符串 / Compiled HTML string
 */
export async function markdownToHtml(markdown: string): Promise<string> {
  const processor = unified()
    // 1. 解析 Markdown / Parse Markdown
    .use(remarkParse)

    // 2. 支持 GFM（表格、删除线、任务列表等） / Support GFM (tables, strikethrough, task lists, etc.)
    .use(remarkGfm)

    // 3. 将 HTML 节点转为文本节点（安全措施） / Convert HTML nodes to text nodes (security measure)
    .use(remarkHtmlToText)

    // 4. 转换为 rehype AST（不允许危险 HTML） / Convert to rehype AST (disallow dangerous HTML)
    .use(remarkRehype, { allowDangerousHtml: false })

    // 5. Prism 代码高亮（服务端编译） / Prism code highlighting (server-side compilation)
    .use(rehypePrismPlus, {
      ignoreMissing: true, // 忽略未知语言 / Ignore unknown languages
      showLineNumbers: false, // 可选：开启行号需要额外 CSS / Optional: enabling line numbers requires additional CSS
    })

    // 6. 添加代码块复制按钮和语言标签 / Add copy button and language label to code blocks
    .use(rehypeCodeBlock)

    // 7. 清理 HTML（自定义 schema） / Sanitize HTML (custom schema)
    // 注意：必须允许 Prism 生成的所有 class，包括 token.* / Note: Must allow all Prism-generated classes, including token.*
    .use(rehypeSanitize, {
      ...defaultSchema,
      attributes: {
        ...defaultSchema.attributes,
        // 允许 code 标签的所有 class（Prism 需要） / Allow all classes for code tag (required by Prism)
        code: [
          ...(defaultSchema.attributes?.code || []),
          ["className", /.*/], // 允许所有 class / Allow all classes
        ],
        // 允许 pre 标签的所有 class / Allow all classes for pre tag
        pre: [
          ...(defaultSchema.attributes?.pre || []),
          ["className", /.*/], // 允许所有 class / Allow all classes
        ],
        // 允许 span 标签的所有 class（Prism token 需要） / Allow all classes for span tag (required by Prism tokens)
        span: [
          ...(defaultSchema.attributes?.span || []),
          ["className", /.*/], // 允许所有 class / Allow all classes
        ],
        // 允许 div 标签的 class（代码块包装器） / Allow classes for div tag (code block wrapper)
        div: [
          ...(defaultSchema.attributes?.div || []),
          ["className", /.*/],
        ],
        // 允许 button 标签的属性（复制按钮） / Allow attributes for button tag (copy button)
        button: [
          ["className", /.*/],
          ["dataCode", /.*/],
          ["type", /^button$/],
          ["ariaLabel", /.*/],
        ],
      },
      // 允许 button 标签 / Allow button tag
      tagNames: [
        ...(defaultSchema.tagNames || []),
        "button",
      ].filter((tag) => !["script", "style", "iframe"].includes(tag)),
    })

    // 8. 转换为 HTML 字符串 / Convert to HTML string
    .use(rehypeStringify);

  const result = await processor.process(markdown);
  return String(result);
}
