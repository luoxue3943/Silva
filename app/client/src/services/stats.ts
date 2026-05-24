import { silvaAlova } from "@/lib/alova";
import type { SiteStats } from "@/types/stats";

/**
 * 站点统计数据服务 / Site stats data service.
 *
 * 封装统计读取和访问记录请求。
 * Wraps stats retrieval and visit-recording requests.
 */
type VisitParams = {
  guestId: string;
};

/**
 * 获取站点统计数据 / Fetches site stats.
 */
export function getStats() {
  return silvaAlova.Get<SiteStats>("/stats");
}

/**
 * 记录访客访问并返回最新统计 / Records a guest visit and returns fresh stats.
 */
export function recordVisit(data: VisitParams) {
  return silvaAlova.Post<SiteStats>("/stats/visit", data);
}
