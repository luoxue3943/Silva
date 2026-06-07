/**
 * Prettier 与 Tailwind 插件配置类型提示 / Prettier and Tailwind plugin config type hint
 *
 * JSDoc 类型声明供编辑器和类型检查读取 / JSDoc type declaration for editor and type-checker support
 * @type {import('prettier').Config & import('prettier-plugin-tailwindcss').PluginOptions}
 */
const prettierConfig = {
  plugins: ["prettier-plugin-tailwindcss"],
};
export default prettierConfig;
