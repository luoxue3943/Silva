import { createPageMetadata } from "@/lib/seo";
import { SilvaConfig } from "@/lib/silva-config";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import MurmursClient from "./murmurs-client";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Murmurs");

  return createPageMetadata({
    title: t("title"),
    description: t("motto") || SilvaConfig.seo.description,
    pathname: "/murmurs",
  });
}

export default function MurmursPage() {
  return <MurmursClient />;
}
