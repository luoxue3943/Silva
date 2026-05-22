import "server-only";

/**
 * Markdown 处理工具 / Markdown Processing Utilities
 *
 * 提供安全的 Markdown 到 HTML 转换功能，包含代码高亮和复制功能。
 * Provides safe Markdown to HTML conversion with code highlighting and copy functionality.
 */

import type { Root as MdastRoot } from "mdast";
import type { Element, Root as HastRoot, Text } from "hast";
import rehypePrismPlus from "rehype-prism-plus";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import { visit } from "unist-util-visit";

type HtmlNode = {
  type: "html";
  value: string;
};

function isElement(node: unknown): node is Element {
  return (
    typeof node === "object" &&
    node !== null &&
    "type" in node &&
    (node as { type?: unknown }).type === "element"
  );
}

function isText(node: unknown): node is Text {
  return (
    typeof node === "object" &&
    node !== null &&
    "type" in node &&
    (node as { type?: unknown }).type === "text"
  );
}

/**
 * 自定义 remark 插件：将所有 HTML 节点转换为纯文本节点。
 * Custom remark plugin: Convert all HTML nodes to plain text nodes.
 *
 * 防止 Markdown 中的原生 HTML 被渲染为真实 DOM。
 * Prevents native HTML in Markdown from being rendered as real DOM.
 */
function remarkHtmlToText() {
  return (tree: MdastRoot) => {
    visit(tree, "html", (node, index, parent) => {
      if (!parent || typeof index !== "number") {
        return;
      }

      const htmlNode = node as HtmlNode;

      parent.children[index] = {
        type: "text",
        value: htmlNode.value,
      };
    });
  };
}

function getTextContent(node: unknown): string {
  if (isText(node)) {
    return node.value;
  }

  if (isElement(node) && Array.isArray(node.children)) {
    return node.children.map(getTextContent).join("");
  }

  return "";
}

function getCodeLanguage(codeNode: Element): string {
  const className = codeNode.properties?.className;

  if (!Array.isArray(className)) {
    return "text";
  }

  const languageClass = className.find(
    (classItem): classItem is string =>
      typeof classItem === "string" && classItem.startsWith("language-"),
  );

  return languageClass?.replace("language-", "") || "text";
}

/**
 * 自定义 rehype 插件：为代码块添加复制按钮和语言标签。
 * Custom rehype plugin: Add copy button and language label to code blocks.
 */
function rehypeCodeBlock() {
  return (tree: HastRoot) => {
    visit(tree, "element", (node: Element, index, parent) => {
      if (
        node.tagName !== "pre" ||
        !Array.isArray(node.children) ||
        !isElement(node.children[0])
      ) {
        return;
      }

      const codeNode = node.children[0];

      if (codeNode.tagName !== "code") {
        return;
      }

      const language = getCodeLanguage(codeNode);
      const code = getTextContent(codeNode);

      const wrapper: Element = {
        type: "element",
        tagName: "div",
        properties: {
          className: ["code-block-wrapper"],
        },
        children: [
          {
            type: "element",
            tagName: "div",
            properties: {
              className: ["code-block-header"],
            },
            children: [
              {
                type: "element",
                tagName: "span",
                properties: {
                  className: ["code-block-language"],
                },
                children: [
                  {
                    type: "text",
                    value: language,
                  },
                ],
              },
              {
                type: "element",
                tagName: "button",
                properties: {
                  className: ["code-block-copy"],
                  type: "button",
                  ariaLabel: "复制代码",
                  dataCode: code,
                },
                children: [
                  {
                    type: "element",
                    tagName: "span",
                    properties: {
                      className: ["icon-[mynaui--copy-solid]"],
                    },
                    children: [],
                  },
                ],
              },
            ],
          },
          node,
        ],
      };

      if (parent && typeof index === "number") {
        parent.children[index] = wrapper;
      }
    });
  };
}

/**
 * 将 Markdown 字符串编译为安全的 HTML。
 * Compile Markdown string to safe HTML.
 *
 * 安全措施 / Security measures:
 * 1. remarkHtmlToText：将 Markdown 原生 HTML 转为纯文本。
 * 2. remark-rehype：不启用 allowDangerousHtml。
 * 3. rehype-prism-plus：服务端代码高亮。
 * 4. rehypeCodeBlock：添加代码块工具栏和复制按钮。
 * 5. rehype-sanitize：只允许安全标签和属性。
 *
 * @param markdown 原始 Markdown 字符串 / Raw Markdown string
 * @returns 编译后的 HTML 字符串 / Compiled HTML string
 */
export async function markdownToHtml(markdown: string): Promise<string> {
  const processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkHtmlToText)
    .use(remarkRehype, {
      allowDangerousHtml: false,
    })
    .use(rehypePrismPlus, {
      ignoreMissing: true,
      showLineNumbers: false,
    })
    .use(rehypeCodeBlock)
    .use(rehypeSanitize, {
      ...defaultSchema,
      attributes: {
        ...defaultSchema.attributes,

        code: [...(defaultSchema.attributes?.code ?? []), ["className", /.*/]],

        pre: [...(defaultSchema.attributes?.pre ?? []), ["className", /.*/]],

        span: [...(defaultSchema.attributes?.span ?? []), ["className", /.*/]],

        div: [...(defaultSchema.attributes?.div ?? []), ["className", /.*/]],

        button: [
          ["className", /.*/],
          ["dataCode", /.*/],
          ["data-code", /.*/],
          ["type", /^button$/],
          ["ariaLabel", /.*/],
          ["aria-label", /.*/],
        ],
      },
      tagNames: [...(defaultSchema.tagNames ?? []), "button"].filter(
        (tagName) => !["script", "style", "iframe"].includes(tagName),
      ),
    })
    .use(rehypeStringify);

  const result = await processor.process(markdown);

  return String(result);
}
