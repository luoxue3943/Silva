/**
 * Prettier 配置文件 / Prettier Configuration
 *
 * 代码格式化配置，集成 Tailwind CSS 插件
 * Code formatting configuration with Tailwind CSS plugin
 *
 * @see https://prettier.io/docs/configuration
 * @type {import("prettier").Config}
 */

/** Prettier 配置对象 / Prettier configuration object */
const config = {
  /** 插件列表 / Plugins list */
  plugins: ["prettier-plugin-tailwindcss"],
};

export default config;
