/**
 * 预览模式入口
 * Preview entry point
 *
 * 用于本地或预发环境的 Node 适配器启动，复用 SSR 渲染逻辑
 * Starts the Node adapter for local/preview builds while reusing SSR render logic
 */
import { createQwikCity } from "@builder.io/qwik-city/middleware/node";
import qwikCityPlan from "@qwik-city-plan";
import render from "./entry.ssr";

// 创建 Qwik City 中间件实例 / Create Qwik City middleware instance
export default createQwikCity({ render: render, qwikCityPlan });
