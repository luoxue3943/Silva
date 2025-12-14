/**
 * 文章类型定义 / Post type definition
 */
export type Post = {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  category: string;
  views: number;
  author?: string;
  link?: string;
  lastModified?: string;
};

/**
 * 模拟文章数据 / Mock posts data
 */
export const MOCK_POSTS: Post[] = [
  {
    id: "1",
    title: "Better Auth 的多租户用户鉴权的构想",
    excerpt: "探讨 Better Auth 在多租户场景下的用户鉴权实现方案。",
    lastModified: "2025 年 12 月 14 日 0:47",
    content: `

## 什么是多租户？

多租户（Multi-tenancy）是一种软件架构，允许单个应用实例为多个独立的客户（租户）提供服务。每个租户的数据和配置都是隔离的，但共享同一套代码和基础设施。

### 核心挑战

- **数据隔离**：确保租户之间的数据完全隔离
- **权限管理**：不同租户可能有不同的权限模型
- **性能优化**：在多租户环境下保持高性能

## Better Auth 的优势

Better Auth 提供了灵活的鉴权机制，非常适合构建多租户系统：

\`\`\`ts
import { betterAuth } from "better-auth";

const auth = betterAuth({
  database: {
    provider: "postgres",
    url: process.env.DATABASE_URL,
  },
  tenancy: {
    enabled: true,
    tenantIdField: "tenant_id",
  },
});
\`\`\`

## 实现方案

### 1. 租户识别

通过子域名或路径参数识别租户：

\`\`\`ts
function getTenantId(request: Request): string {
  const hostname = new URL(request.url).hostname;
  const subdomain = hostname.split('.')[0];
  return subdomain;
}
\`\`\`

### 2. 权限隔离

确保用户只能访问所属租户的资源：

\`\`\`ts
async function checkTenantAccess(userId: string, tenantId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: { tenants: true },
  });

  return user?.tenants.some(t => t.id === tenantId);
}
\`\`\`

> **重要**：始终在服务端验证租户权限，不要依赖客户端传递的租户 ID。

## 总结

Better Auth 为多租户鉴权提供了坚实的基础，通过合理的架构设计，我们可以构建出安全、高效的多租户系统。
`,
    date: "2025/12/14",
    category: "技术",
    views: 0,
  },
  {
    id: "2",
    title: "View Transitions in Qwik",
    excerpt: "如何在 Qwik 中使用视图过渡（View Transitions）。",
    content: `
# View Transitions in Qwik

视图过渡 API 让页面切换更加流畅自然。

## 基础用法

在 Qwik City 中使用 View Transitions 非常简单：

\`\`\`ts
// src/routes/layout.tsx
import { component$ } from "@builder.io/qwik";
import { useDocumentHead, useLocation } from "@builder.io/qwik-city";

export default component$(() => {
  const loc = useLocation();

  return (
    <html>
      <head>
        <meta name="view-transition" content="same-origin" />
      </head>
      <body>
        <main>
          <Slot />
        </main>
      </body>
    </html>
  );
});
\`\`\`

## CSS 配置

\`\`\`css
::view-transition-old(root),
::view-transition-new(root) {
  animation-duration: 0.3s;
}
\`\`\`

### 浏览器支持

| 浏览器 | 版本 | 支持状态 |
|--------|------|----------|
| Chrome | 111+ | ✅ 完全支持 |
| Edge | 111+ | ✅ 完全支持 |
| Safari | 18+ | ✅ 完全支持 |
| Firefox | - | ⏳ 开发中 |

## 注意事项

- [x] 确保浏览器支持
- [x] 添加降级方案
- [ ] 测试性能影响
`,
    date: "2024/02/20",
    category: "进阶",
    views: 856,
  },
  {
    id: "3",
    title: "Paraglide JS + Qwik",
    excerpt: "在 Qwik 项目中集成 Paraglide JS 实现 i18n。",
    content: `
# Paraglide JS + Qwik 国际化方案

完整的 i18n 集成指南。

## 安装依赖

\`\`\`bash
pnpm add @inlang/paraglide-js
pnpm add -D @inlang/paraglide-js-adapter-vite
\`\`\`

## 配置文件

\`\`\`ts
// vite.config.ts
import { paraglide } from "@inlang/paraglide-js-adapter-vite";

export default defineConfig({
  plugins: [
    paraglide({
      project: "./project.inlang",
      outdir: "./src/paraglide",
    }),
  ],
});
\`\`\`

## 使用示例

\`\`\`ts
import * as m from "@/paraglide/messages";

export default component$(() => {
  return <h1>{m.hello()}</h1>;
});
\`\`\`

**重要**：~~不要使用旧的 i18next 方案~~，Paraglide 性能更好。

## XSS 防护测试

下面的代码**不会执行**，会被安全转义：

<script>alert("XSS Test")</script>

<div onclick="alert('Click')">危险的点击</div>

<img src=x onerror=alert('Error')>

如果你能看到上面的尖括号，说明 XSS 防护成功！
`,
    date: "2024/03/10",
    category: "国际化",
    views: 567,
  },
];
