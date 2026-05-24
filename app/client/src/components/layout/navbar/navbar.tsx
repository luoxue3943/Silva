import { SilvaConfig } from "@/lib/silva-config";
import NavbarClient, { type NavbarCategory } from "./navbar-client";

/**
 * 导航栏服务端组件 / Navigation server component
 *
 * 从站点配置读取分类数据，并传递给客户端导航栏处理交互。
 * Reads categories from site config and passes them to the client navbar for interactions.
 */
export default function Navbar() {
  // 只暴露导航栏需要的分类字段 / Exposes only the category fields needed by the navbar.
  const categories: NavbarCategory[] = SilvaConfig.categories.map(
    (category) => ({
      slug: category.slug,
      name: category.name,
      names: category.names,
    }),
  );

  return <NavbarClient categories={categories} />;
}
