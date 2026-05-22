/**
 * 页脚组件 / Footer Component
 *
 * 展示站点统计信息、版权与备案信息
 * Displays site stats, copyright, and filing info
 */

import {
  getLocalizedName,
  SilvaConfig,
  type SilvaFilingConfig,
} from "@/lib/silva-config";
import { useLocale, useTranslations } from "next-intl";
import Modules from "./footer.module.scss";

type FooterStats = {
  totalVisits: number;
  totalGuests: number;
  onlineUsers: number;
};

/**
 * 占位统计数据
 * Placeholder stats data
 *
 * 后续可以替换为服务端接口返回的数据。
 * Can be replaced with server API data later.
 */
const placeholderStats: FooterStats = {
  totalVisits: 12345,
  totalGuests: 678,
  onlineUsers: 12,
};

export default function Footer() {
  // 获取当前语言环境 / Get current locale
  const locale = useLocale();

  // 获取翻译函数 / Get translation function
  const t = useTranslations("Stats");

  // 统计数据占位 / Placeholder stats
  const stats = placeholderStats;

  // 根据当前语言获取站点名称 / Get localized site name
  const siteName = getLocalizedName(SilvaConfig.site, locale);

  // 版权信息 / Copyright text
  const copyrightText =
    SilvaConfig.site.copyright ??
    `Copyright © 2025${siteName ? ` ${siteName}` : ""}`;

  // 备案信息列表 / Filing info list
  const filings = SilvaConfig.filings ?? [];

  return (
    <footer className={Modules.footer}>
      <div className={Modules.container}>
        <div className={Modules.stats}>
          <span>
            {t("totalViews")}{" "}
            <span className={Modules.highlight}>{stats.totalVisits}</span>
          </span>

          <span>
            {t("totalVisitors")}{" "}
            <span className={Modules.highlight}>{stats.totalGuests}</span>
          </span>

          <span>
            {t("onlineUsers")}{" "}
            <span className={Modules.highlight}>{stats.onlineUsers}</span>
          </span>
        </div>

        {filings.length > 0 && (
          <div className={Modules.filings}>
            {filings.map((item: SilvaFilingConfig, index: number) => (
              <a
                key={`${item.name}-${index}`}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {item.name}
              </a>
            ))}
          </div>
        )}

        <div className={Modules.copyright}>{copyrightText}</div>
      </div>
    </footer>
  );
}
