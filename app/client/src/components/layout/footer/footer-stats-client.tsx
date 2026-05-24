"use client";

import { getStats, recordVisit } from "@/services/stats";
import type { SiteStats } from "@/types/stats";
import { useEffect, useState } from "react";

type FooterStatsClientProps = {
  labels: {
    totalViews: string;
    totalVisitors: string;
    onlineUsers: string;
  };
  highlightClassName: string;
};

const initialStats: SiteStats = {
  totalVisits: 0,
  totalGuests: 0,
  onlineUsers: 0,
};

/**
 * 获取或创建本地访客标识 / Gets or creates the local guest identifier.
 */
function getOrCreateGuestId() {
  const storageKey = "silva_guest_id";

  try {
    const existingGuestId = globalThis.localStorage.getItem(storageKey);

    if (existingGuestId) {
      return existingGuestId;
    }

    const nextGuestId =
      globalThis.crypto?.randomUUID?.() ??
      `${Date.now()}-${Math.random().toString(36).slice(2)}`;

    globalThis.localStorage.setItem(storageKey, nextGuestId);

    return nextGuestId;
  } catch {
    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
}

/**
 * 页脚统计客户端组件 / Footer stats client component.
 *
 * 记录当前访客访问，并在失败时回退为只读取统计数据。
 * Records the current guest visit and falls back to read-only stats loading on failure.
 */
export default function FooterStatsClient({
  labels,
  highlightClassName,
}: FooterStatsClientProps) {
  const [stats, setStats] = useState<SiteStats>(initialStats);

  useEffect(() => {
    let active = true;

    const loadStats = async () => {
      try {
        // 优先记录访问以刷新统计 / Prefer recording the visit to refresh stats.
        const guestId = getOrCreateGuestId();
        const nextStats = await recordVisit({ guestId }).send(true);

        if (active) {
          setStats(nextStats);
        }
      } catch {
        try {
          // 记录失败时退回到只读统计接口 / Falls back to the read-only stats API when recording fails.
          const nextStats = await getStats().send(true);

          if (active) {
            setStats(nextStats);
          }
        } catch {
          if (active) {
            setStats(initialStats);
          }
        }
      }
    };

    void loadStats();

    return () => {
      active = false;
    };
  }, []);

  return (
    <>
      <span>
        {labels.totalViews}{" "}
        <span className={highlightClassName}>{stats.totalVisits}</span>
      </span>

      <span>
        {labels.totalVisitors}{" "}
        <span className={highlightClassName}>{stats.totalGuests}</span>
      </span>

      <span>
        {labels.onlineUsers}{" "}
        <span className={highlightClassName}>{stats.onlineUsers}</span>
      </span>
    </>
  );
}
