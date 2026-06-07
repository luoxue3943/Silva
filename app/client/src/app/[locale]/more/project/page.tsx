import { createPageMetadata } from "@/lib/seo";
import { SilvaConfig } from "@/lib/silva-config";
import type { Metadata } from "next";
import ProjectsClient from "./projects-client";

export function generateMetadata(): Metadata {
  return createPageMetadata({
    title: "项目",
    description: SilvaConfig.seo.description,
    pathname: "/more/project",
  });
}

export default function ProjectPage() {
  return <ProjectsClient />;
}
