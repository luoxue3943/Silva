/**
 * 应用根组件 / Application Root Component
 *
 * 提供 Qwik City 上下文和基础 HTML 结构，作为所有页面的宿主
 * Provides Qwik City context and the base HTML scaffold as the host for every page
 */
import { component$, isDev } from "@builder.io/qwik";
import { QwikCityProvider, RouterOutlet } from "@builder.io/qwik-city";
import { RouterHead } from "./components/router-head/router-head";

// 导入全局样式 / Import global styles
import "./global.css";
import "./global.scss";

export default component$(() => {
  return (
    <QwikCityProvider>
      <head>
        {/* 字符编码 / Character encoding */}
        <meta charset="utf-8" />

        {/* PWA manifest（仅在生产环境）/ PWA manifest (production only) */}
        {!isDev && (
          <link
            rel="manifest"
            href={`${import.meta.env.BASE_URL}manifest.json`}
          />
        )}

        {/* 路由头部组件（动态元数据）/ Router head component (dynamic metadata) */}
        <RouterHead />
      </head>
      <body>
        {/* 路由出口（渲染当前路由的页面）/ Router outlet (renders the current route page) */}
        <RouterOutlet />
      </body>
    </QwikCityProvider>
  );
});
