"use client";

import PulsatingDots from "@/components/loading/pulsating-dots";
import {
  useInfinitePagination,
  useLoadMoreSentinel,
} from "@/hooks/use-infinite-pagination";
import { getMurmurs } from "@/services/murmurs";
import type { Murmur } from "@/types/murmur";
import { useTranslations } from "next-intl";
import { useCallback, useMemo } from "react";
import TimelineProgressClient from "../timeline/timeline-progress-client";
import styles from "./murmurs.module.scss";

const MURMURS_PAGE_SIZE = 15;

interface MurmursByYear {
  year: string;
  murmurs: Array<{
    id: number;
    content: string;
    date: string;
    monthDay: string;
  }>;
}

function groupMurmursByYear(murmurs: Murmur[]) {
  const murmursByYear: Record<string, MurmursByYear["murmurs"]> = {};

  murmurs.forEach((murmur) => {
    const date = new Date(murmur.created_at);
    const year = date.getFullYear().toString();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    murmursByYear[year] ??= [];

    murmursByYear[year].push({
      id: murmur.id,
      content: murmur.content,
      date: `${year}/${month}/${day}`,
      monthDay: `${month}-${day}`,
    });
  });

  return Object.entries(murmursByYear)
    .map(([year, yearMurmurs]) => ({
      year,
      murmurs: yearMurmurs.sort((left, right) =>
        right.date.localeCompare(left.date),
      ),
    }))
    .sort((left, right) => Number(right.year) - Number(left.year));
}

export default function MurmursClient() {
  const t = useTranslations("Murmurs");

  const getPage = useCallback(
    (page: number, pageSize: number) => getMurmurs(page, pageSize),
    [],
  );

  const { items, total, hasMore, loading, loadMore } =
    useInfinitePagination<Murmur>({
      pageSize: MURMURS_PAGE_SIZE,
      getPage,
    });

  const sentinelRef = useLoadMoreSentinel(hasMore && !loading, loadMore);
  const groupedMurmurs = useMemo(() => groupMurmursByYear(items), [items]);

  return (
    <section className={styles.murmurs}>
      <div className={styles.header}>
        <h1 className={styles.title}>{t("title")}</h1>

        <p className={styles.subtitle}>
          {t("totalMurmurs", {
            count: String(total ?? 0),
          })}
        </p>

        <TimelineProgressClient />

        <p className="mt-5 text-sm text-gray-500">{t("motto")}</p>
      </div>

      <div className={styles.list}>
        {groupedMurmurs.map((yearGroup) => (
          <div key={yearGroup.year} className={styles["year-group"]}>
            <div className={styles["year-header"]}>
              <h2 className={styles["year-title"]}>{yearGroup.year}</h2>

              <span className={styles["year-count"]}>
                {t("murmursCount", {
                  count: yearGroup.murmurs.length.toString(),
                })}
              </span>
            </div>

            <div
              className={`${styles["murmurs-list"]} ${
                yearGroup.murmurs.length > 1 ? styles["has-line"] : ""
              }`}
            >
              {yearGroup.murmurs.map((murmur) => (
                <article key={murmur.id} className={styles["murmur-item"]}>
                  <div className={styles["murmur-dot"]} />

                  <div className={styles["murmur-content"]}>
                    <span className={styles["murmur-date"]}>
                      {murmur.monthDay}
                    </span>

                    <p className={styles["murmur-text"]}>{murmur.content}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        ))}

        <div ref={sentinelRef} className={styles.sentinel} />

        {loading && (
          <div className={styles.loading}>
            <PulsatingDots />
          </div>
        )}
      </div>
    </section>
  );
}
