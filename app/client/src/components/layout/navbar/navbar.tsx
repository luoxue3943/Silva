import { SilvaConfig } from "@/lib/silva-config";
import NavbarClient, { type NavbarCategory } from "./navbar-client";

export default function Navbar() {
  const categories: NavbarCategory[] = SilvaConfig.categories.map(
    (category) => ({
      slug: category.slug,
      name: category.name,
      names: category.names,
    }),
  );

  return <NavbarClient categories={categories} />;
}
