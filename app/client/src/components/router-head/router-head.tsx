/**
 * 路由头部组件 / Router Head Component
 *
 * 置于文档 <head> 内，负责注入页面标题、SEO 元数据和资源链接
 * Lives inside the document <head> to inject page titles, SEO meta, and resource links
 */
import { component$ } from "@builder.io/qwik";
import { useDocumentHead, useLocation } from "@builder.io/qwik-city";

export const RouterHead = component$(() => {
  // 获取文档头部配置 / Retrieve document head configuration
  const head = useDocumentHead();
  // 获取当前路由位置 / Get current route location
  const loc = useLocation();

  return (
    <>
      {/* 页面标题 / Page title */}
      <title>{head.title}</title>

      {/* 基础文档元信息 / Base document meta */}
      <link rel="canonical" href={loc.url.href} />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <link rel="icon" type="image/svg+xml" href="/favicon.svg" />

      {head.meta.map((m) => (
        <meta key={m.key} {...m} />
      ))}

      {head.links.map((l) => (
        <link key={l.key} {...l} />
      ))}

      {head.styles.map((s) => (
        <style
          key={s.key}
          {...s.props}
          {...(s.props?.dangerouslySetInnerHTML
            ? {}
            : { dangerouslySetInnerHTML: s.style })}
        />
      ))}

      {head.scripts.map((s) => (
        <script
          key={s.key}
          {...s.props}
          {...(s.props?.dangerouslySetInnerHTML
            ? {}
            : { dangerouslySetInnerHTML: s.script })}
        />
      ))}
    </>
  );
});
