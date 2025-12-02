/**
 * 服务器端渲染入口
 * Server-side rendering entry point
 *
 * 将应用渲染为可流式传输的 HTML，便于首屏性能优化
 * Renders the app as a streamable HTML response for better initial load performance
 */
import {
  renderToStream,
  type RenderToStreamOptions,
} from "@builder.io/qwik/server";
import Root from "./root";

/**
 * 执行 SSR 渲染并附加全局 HTML 属性
 * Perform SSR rendering and attach global HTML attributes
 *
 * @param opts 渲染配置 / Rendering options
 * @returns 流式渲染结果 / Stream rendering result
 */
export default function (opts: RenderToStreamOptions) {
  return renderToStream(<Root />, {
    ...opts,
    // 使用容器属性为 html 标签设置语言与类名 / Use container attributes to set html lang and classes
    containerAttributes: {
      lang: "zh-cn",
      class: "transition",
      ...opts.containerAttributes,
    },
    // 透传服务器数据，支持上层自定义扩展 / Pass through server data for upstream extensions
    serverData: {
      ...opts.serverData,
    },
  });
}
