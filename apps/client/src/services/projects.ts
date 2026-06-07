import { silvaAlova } from "@/lib/alova";
import type { Project } from "@/types/project";

export function getProjects() {
  return silvaAlova.Get<Project[]>("/projects");
}
