import { createPageMetadata } from "@/lib/seo";
import { SilvaConfig } from "@/lib/silva-config";
import type { Metadata } from "next";

export function generateMetadata(): Metadata {
  return createPageMetadata({
    title: "更多",
    description: SilvaConfig.seo.description,
    pathname: "/more",
  });
}

export default function MorePage() {
  return null;
}
