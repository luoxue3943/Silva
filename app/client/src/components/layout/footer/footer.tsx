import {
  getLocalizedName,
  SilvaConfig,
  type SilvaFilingConfig,
} from "@/lib/silva-config";
import { useLocale, useTranslations } from "next-intl";
import FooterStatsClient from "./footer-stats-client";
import Modules from "./footer.module.scss";

/**
 * 页脚组件 / Footer component.
 *
 * 展示站点统计、版权声明和备案链接。
 * Displays site stats, copyright text, and filing links.
 */
export default function Footer() {
  // 读取当前语言环境 / Reads the current locale.
  const locale = useLocale();
  // 读取统计文案翻译函数 / Reads the stats translation function.
  const t = useTranslations("Stats");
  // 按当前语言解析站点名称 / Resolves site name for the current locale.
  const siteName = getLocalizedName(SilvaConfig.site, locale);
  // 生成默认版权文案 / Builds fallback copyright text.
  const copyrightText =
    SilvaConfig.site.copyright ??
    `Copyright (c) 2025${siteName ? ` ${siteName}` : ""}`;
  // 读取备案链接列表 / Reads filing link list.
  const filings = SilvaConfig.filings ?? [];

  return (
    <footer className={Modules.footer}>
      <div className={Modules.container}>
        <div className={Modules.stats}>
          <FooterStatsClient
            labels={{
              totalViews: t("totalViews"),
              totalVisitors: t("totalVisitors"),
              onlineUsers: t("onlineUsers"),
            }}
            highlightClassName={Modules.highlight}
          />
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
