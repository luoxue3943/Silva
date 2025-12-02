import { paraglideVitePlugin } from "@inlang/paraglide-js";
/**
 * Vite 基础配置
 * Base config for Vite.
 *
 * 构建时会由适配器配置加载并扩展本文件
 * Adapter configs load and extend this file during builds
 */
import { defineConfig, type UserConfig } from "vite";
import { qwikVite } from "@builder.io/qwik/optimizer";
import { qwikCity } from "@builder.io/qwik-city/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import pkg from "./package.json";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";
type PkgDep = Record<string, string>;
const { dependencies = {}, devDependencies = {} } = pkg as any as {
  dependencies: PkgDep;
  devDependencies: PkgDep;
  [key: string]: unknown;
};
errorOnDuplicatesPkgDeps(devDependencies, dependencies);
/**
 * 默认入口是 `index.html`，但 qwikCity 插件会改为 `src/entry.ssr.tsx`
 * Vite would normally start from `index.html`, but qwikCity switches it to `src/entry.ssr.tsx`
 */

export default defineConfig(({ command, mode }): UserConfig => {
  return {
    plugins: [paraglideVitePlugin({ project: './project.inlang', outdir: './src/paraglide' }),
      qwikCity(),
      qwikVite(),
      tsconfigPaths({ root: "." }),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        // 统一使用 @ 指向 src 目录 / Use @ to point to src directory
        "@": path.resolve(__dirname, "src"),
      },
    },
    // 指定开发模式下需要预构建的依赖 / Tell Vite which deps to pre-bundle in dev
    optimizeDeps: {
      // 将可能影响打包的依赖放这里，通常是带原生二进制的库
      // Place problematic/binary-heavy deps here, e.g., ['better-sqlite3']
      exclude: [],
    },
    /**
     * 高级设置：优化服务端代码的打包
     * Advanced: improves server bundling—only use if deps/devDeps 分界清晰 (avoid prod breakage)
     */
    // ssr:
    //   command === "build" && mode === "production"
    //     ? {
    //         // All dev dependencies should be bundled in the server build
    //         noExternal: Object.keys(devDependencies),
    //         // Anything marked as a dependency will not be bundled
    //         // These should only be production binary deps (including deps of deps), CLI deps, and their module graph
    //         // If a dep-of-dep needs to be external, add it here
    //         // For example, if something uses `bcrypt` but you don't have it as a dep, you can write
    //         // external: [...Object.keys(dependencies), 'bcrypt']
    //         external: Object.keys(dependencies),
    //       }
    //     : undefined,
    server: {
      headers: {
        // 开发模式不缓存响应 / Avoid caching responses in dev
        "Cache-Control": "public, max-age=0",
      },
    },
    preview: {
      headers: {
        // 预览环境适度缓存响应 / Cache responses moderately in preview
        "Cache-Control": "public, max-age=600",
      },
    },
  };
});
// *** utils ***
/**
 * 检测重复依赖并抛出错误
 * Identify duplicated dependencies and throw an error
 *
 * @param {Object} devDependencies 开发依赖列表 / Development dependencies
 * @param {Object} dependencies 生产依赖列表 / Production dependencies
 */
function errorOnDuplicatesPkgDeps(
  devDependencies: PkgDep,
  dependencies: PkgDep,
) {
  let msg = "";
  // 找出同时存在于 devDependencies 与 dependencies 的包 / Find deps present in both sections
  const duplicateDeps = Object.keys(devDependencies).filter(
    (dep) => dependencies[dep],
  );
  // 捕获需移动到 devDependencies 的 Qwik 相关包 / Capture Qwik packages that belong in devDependencies
  const qwikPkg = Object.keys(dependencies).filter((value) =>
    /qwik/i.test(value),
  );
  // 捕获缺少 "qwik-city-plan" 时的错误信息 / Guard against missing "qwik-city-plan" resolution errors
  msg = `Move qwik packages ${qwikPkg.join(", ")} to devDependencies`;
  if (qwikPkg.length > 0) {
    throw new Error(msg);
  }
  // 拼接重复依赖的错误提示 / Compose error message for duplicated deps
  msg = `
    Warning: The dependency "${duplicateDeps.join(", ")}" is listed in both "devDependencies" and "dependencies".
    Please move the duplicated dependencies to "devDependencies" only and remove it from "dependencies"
  `;
  // 如存在重复则抛错 / Throw when duplicates are present
  if (duplicateDeps.length > 0) {
    throw new Error(msg);
  }
}
