"use client";

import { getStats, recordVisit } from "@/services/stats";
import type { SiteStats } from "@/types/stats";
import { useEffect, useState } from "react";

type FooterStatsClientProps = {
  highlightClassName: string;
};

const initialStats: SiteStats = {
  totalVisits: 0,
  onlineUsers: 0,
};

export default function FooterStatsClient({
  highlightClassName,
}: FooterStatsClientProps) {
  const [stats, setStats] = useState<SiteStats>(initialStats);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const nextStats = await getStats();

        setStats({
          totalVisits: await recordVisit(),
          onlineUsers: nextStats.onlineUsers,
        });
      } finally {
      }
    };

    void loadStats();
  }, []);

  return (
    <>
      <span>
        总访问量 <span className={highlightClassName}>{stats.totalVisits}</span>
      </span>

      <span>
        在线用户 <span className={highlightClassName}>{stats.onlineUsers}</span>
      </span>
    </>
  );
}
