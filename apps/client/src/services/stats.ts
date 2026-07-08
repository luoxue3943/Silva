import { silvaFetch } from "@/lib/ofetch";
import type { SiteStats } from "@/types/stats";

/**
 * 获取站点统计数据
 */
export function getStats() {
  return silvaFetch<SiteStats>("/stats/total-stats");
}

/**
 * 记录访客访问并返回最新统计
 */
export function recordVisit() {
  return silvaFetch<number>("/stats/visit", {
    method: "POST",
  });
}
