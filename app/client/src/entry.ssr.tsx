/**
 * 服务器端渲染入口
 * Server-side rendering entry point
 *
 * 将应用渲染为可流式传输的 HTML，便于首屏性能优化
 * Renders the app as a streamable HTML response for better initial load performance
 */
import { paraglideMiddleware } from "@/paraglide/server";
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
  // Qwik 将 Request 对象放在 qwikcity.ev.request 中
  const request = opts.serverData?.qwikcity?.ev?.request;

  if (request) {
    return paraglideMiddleware(request, ({ locale }) => {
      return renderToStream(<Root />, {
        ...opts,
        containerAttributes: {
          lang: locale === "zh" ? "zh-cn" : "en-us",
          class: "transition",
          ...opts.containerAttributes,
        },
        serverData: { ...opts.serverData },
      });
    });
  }

  // 回退：没有请求对象时使用默认配置
  return renderToStream(<Root />, opts);
}
