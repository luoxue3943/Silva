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
  type RenderToStreamResult,
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
  // 从 serverData 中取出 Request / Retrieve Request from serverData
  const request = opts.serverData?.qwikcity?.ev?.request as Request | undefined;

  // 如果没有 request（极少数环境 / 测试场景），退化为普通 Qwik SSR / Fallback to standard Qwik SSR when request is missing
  if (!request) {
    return renderToStream(<Root />, {
      ...opts,
      containerAttributes: {
        lang: "en-us",
        class: "transition",
        ...opts.containerAttributes,
      },
      serverData: { ...opts.serverData },
    });
  }

  // 用来接收 renderToStream 的结果，最终真正返回给 QwikCity / Stores render result to hand back to QwikCity
  let result: RenderToStreamResult | undefined;

  return paraglideMiddleware<RenderToStreamResult>(
    request,
    async ({ locale }) => {
      // 在 Paraglide 的请求上下文里执行 Qwik 的 SSR / Run Qwik SSR within Paraglide request context
      result = await renderToStream(<Root />, {
        ...opts,
        containerAttributes: {
          lang: locale === "zh" ? "zh-cn" : "en-us",
          class: "transition",
          ...opts.containerAttributes,
        },
        serverData: { ...opts.serverData },
      });

      // 返回值只用来满足 paraglideMiddleware<T> 的泛型 / Return value only satisfies paraglideMiddleware<T> type
      return result;
    },
  ).then(() => {
    if (!result) {
      // 理论上只会在发生 redirect 等、resolve 没被调用时出现 / Should only occur on redirect-like flows where resolve is skipped
      throw new Error("paraglideMiddleware did not produce a render result");
    }

    // 注意：传给 QwikCity 的是 RenderToStreamResult，而不是 Response / Return RenderToStreamResult (not a Response) to QwikCity
    return result;
  });
}
