import "server-only";

/**
 * Markdown 渲染工具 / Markdown rendering utilities
 *
 * 将 Markdown 安全转换为 HTML，并为代码块补充高亮与复制能力。 / Convert Markdown to safe HTML and add highlighting plus copy support for code blocks
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
 * remark 安全插件：将 HTML 节点降级为纯文本节点。 / remark safety plugin: Downgrades HTML nodes to plain text nodes.
 *
 * 避免 Markdown 原生 HTML 直接渲染成真实 DOM。 / Prevent raw Markdown HTML from being rendered as real DOM
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
 * rehype 代码块插件：添加语言标签和复制按钮。 / rehype code block plugin: Adds language labels and copy buttons.
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
 * 将 Markdown 字符串编译为经过清理的 HTML。 / Compile a Markdown string into sanitized HTML
 *
 * 安全处理流程 / Security pipeline:
 * 1. remarkHtmlToText：把 Markdown 原生 HTML 转为纯文本 / Converts raw Markdown HTML into plain text.
 * 2. remark-rehype：保持 allowDangerousHtml 关闭 / Keeps allowDangerousHtml disabled.
 * 3. rehype-prism-plus：在服务端完成代码高亮 / Applies code highlighting on the server.
 * 4. rehypeCodeBlock：注入代码块工具栏与复制按钮 / Injects the code block toolbar and copy button.
 * 5. rehype-sanitize：只保留允许的标签和属性 / Keeps only allowed tags and attributes.
 *
 * @param markdown 待渲染的 Markdown 原文 / Markdown source to render
 * @returns 清理后的 HTML 字符串 / Sanitized HTML string
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
