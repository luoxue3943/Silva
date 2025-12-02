/**
 * 开发模式入口
 * Dev entry point
 *
 * 在浏览器环境挂载 Qwik 根组件，提供热更新与调试体验
 * Mounts the Qwik root component in the browser to enable HMR and debugging
 */
import { render, type RenderOptions } from "@builder.io/qwik";
import Root from "./root";

/**
 * 初始化客户端渲染
 * Initialize client rendering
 *
 * @param opts 渲染配置 / Render options
 * @returns 渲染结果 / Render result
 */
export default function (opts: RenderOptions) {
  return render(document, <Root />, opts);
}
