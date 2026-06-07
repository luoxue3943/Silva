"use client";

import PulsatingDots from "@/components/loading/pulsating-dots";
import { getProjects } from "@/services/projects";
import type { Project } from "@/types/project";
import { useEffect, useState } from "react";
import Modules from "./projects.module.scss";

export default function ProjectsClient() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let ignore = false;

    const loadProjects = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await getProjects().send(true);

        if (!ignore) {
          setProjects(data);
        }
      } catch (caughtError) {
        if (!ignore) {
          setError(
            caughtError instanceof Error
              ? caughtError
              : new Error("Project request failed"),
          );
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    void loadProjects();

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <section className={Modules["projects-section"]}>
      <div className={Modules["projects-header"]}>
        <h1>项目</h1>
      </div>

      {loading && (
        <div className={Modules.loading}>
          <PulsatingDots />
        </div>
      )}

      {!loading && projects.length > 0 && (
        <div className={Modules["projects-grid"]}>
          {projects.map((project) => (
            <a
              key={project.id}
              href={project.link}
              className={Modules["project-card"]}
            >
              <div className={Modules["project-content"]}>
                <h2>{project.name}</h2>
                <p>{project.summary}</p>
              </div>
            </a>
          ))}
        </div>
      )}

      {!loading && projects.length === 0 && (
        <div className={Modules["empty-state"]}>
          {error ? error.message : "暂无项目"}
        </div>
      )}
    </section>
  );
}
