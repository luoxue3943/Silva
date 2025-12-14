/**
 * 页脚组件 / Footer Component
 *
 * 展示站点统计信息、版权与备案信息
 * Displays site stats, copyright, and filing info
 */
import { SilvaConfig } from "@/lib/config-loader";
import * as m from "@/paraglide/messages";
import { component$ } from "@builder.io/qwik";
import Modules from "./footer.module.scss";

export default component$(() => {
  // 统计数据可从配置扩展，当前使用占位数据 / Stats can be extended via config; placeholders for now
  const stats =
    SilvaConfig.analytics ??
    ({
      totalVisits: 12345,
      totalGuests: 678,
      onlineUsers: 12,
    } as const);

  const siteName = SilvaConfig.site.name;

  // 版权信息 / Copyright text
  const copyrightText =
    SilvaConfig.site?.copyright ??
    `Copyright © 2025${siteName ? ` ${siteName}` : ""}`;

  // 备案信息列表 / Filing info list
  const filings = SilvaConfig.filings;

  return (
    <div class={Modules.footer}>
      <div class={Modules.container}>
        <div class={Modules.stats}>
          <span>
            {m["Stats.totalViews"]()} <span class={Modules.highlight}>{stats.totalVisits}</span>，
          </span>
          <span>
            {m["Stats.totalVisitors"]()} <span class={Modules.highlight}>{stats.totalGuests}</span>，
          </span>
          <span>
            {m["Stats.onlineUsers"]()} <span class={Modules.highlight}>{stats.onlineUsers}</span>
          </span>
        </div>

        {filings.length > 0 && (
          <div class={Modules.filings}>
            {filings.map((item: any, index: number) => (
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
        <div class={Modules.copyright}>{copyrightText}</div>
      </div>
    </div>
  );
});
