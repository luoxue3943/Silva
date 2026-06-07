import Modules from "./home.module.scss";
import { useLocale, useTranslations } from "next-intl";
import {
  getLocalizedName,
  SilvaConfig,
  type SilvaLinkConfig,
} from "@/lib/silva-config";
import Image from "next/image";

export default function Home() {
  // 读取当前语言环境 / Read the current locale
  const locale = useLocale();

  // 按语言解析网站所有者名称 / Resolves site owner name by locale
  const siteOwnerName = getLocalizedName(SilvaConfig.site, locale);

  // 读取首页文案翻译函数 / Read the homepage translation function
  const t = useTranslations("HomePage");

  const links: SilvaLinkConfig[] = SilvaConfig.links ?? [];
  const motto = SilvaConfig.site.motto ?? "";

  /**
   * 将文本拆分为逐字动画 span / Splits text into per-character animated spans
   *
   * @param text 待拆分文本 / Text to split
   * @param className 附加 CSS 类名 / Extra CSS class name
   * @param delay 动画延迟起始偏移 / Starting animation delay offset
   * @returns 动画 span 数组 / Animated span array
   */
  const splitToSpans = (text: string, className = "", delay = 0) =>
    Array.from(text).map((char, i) => (
      <span
        key={i}
        className={`${Modules["pop-up"]} ${Modules["delay-" + (i + delay)]} ${className}`}
      >
        {/* 使用不间断空格保持动画文本宽度 / Uses non-breaking spaces to preserve animated text width */}
        {char === " " ? "\u00A0" : char}
      </span>
    ));

  // 读取欢迎语文本 / Read welcome text
  const welcome = t("welcome");

  return (
    <>
      <div className={Modules.container}>
        {/* 左侧个人头像区域 / Left profile avatar area */}
        <div className={Modules.profile}>
          <Image
            src="/profile.jpg"
            alt="Profile Picture"
            className={Modules.avatar}
            width={300}
            height={300}
            priority={false}
            loading="eager"
          />
        </div>

        {/* 右侧欢迎信息和社交链接 / Right welcome text and social links */}
        <div className={Modules.headline}>
          <div className={Modules.welcome}>
            {/* 欢迎文本容器 / Welcome text container */}
            <div className="h-fit">
              {/* 逐字动画欢迎语 / Character-by-character welcome message */}
              {splitToSpans(welcome)}

              {/* 站点所有者名称 / Site owner name */}
              <span className={`${Modules["owner-name"]} font-bold`}>
                {splitToSpans(siteOwnerName, "", welcome.length)}
              </span>

              {/* 结尾符号动画（挥手和句号）/ Ending symbol animation (wave and period) */}
              {["👋", "."].map((char, i) => (
                <span
                  key={char}
                  className={`${Modules["pop-up"]} ${
                    Modules["delay-" + ((welcome + siteOwnerName).length + i)]
                  }`}
                >
                  {char}
                </span>
              ))}
            </div>

            {/* 社交链接图标区域 / Social link icon area */}
            <div className={Modules["social-links"]}>
              {links.map((link, i) => {
                // 社交链接类型到图标样式的映射 / Maps social link types to icon styles
                const iconConfig: Record<
                  string,
                  { icon: string; bgClass: string }
                > = {
                  github: {
                    icon: "icon-[line-md--github]",
                    bgClass: Modules["bg-github"],
                  },
                  twitter: {
                    icon: "icon-[line-md--twitter-x]",
                    bgClass: Modules["bg-twitter"],
                  },
                  email: {
                    icon: "icon-[line-md--email]",
                    bgClass: Modules["bg-email"],
                  },
                  telegram: {
                    icon: "icon-[line-md--telegram]",
                    bgClass: Modules["bg-telegram"],
                  },
                };

                // 读取当前链接类型的图标配置 / Read icon config for the current link type
                const config = iconConfig[link.type];
                if (!config) return null;

                return (
                  <a
                    key={`${link.type}-${link.url}`}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${Modules["icon-link"]} ${config.bgClass} ${Modules["pop-up"]} ${
                      Modules[
                        "delay-" + ((welcome + siteOwnerName).length + 2 + i)
                      ]
                    }`}
                  >
                    <span className={`${config.icon} ${Modules.icon}`} />
                  </a>
                );
              })}
            </div>

            {/* 座右铭文本区域 / Motto text area */}
            <div className={Modules.motto}>
              {splitToSpans(
                motto,
                "",
                (welcome + siteOwnerName).length + links.length + 2,
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 页面向下滚动提示图标 / Page scroll-down indicator icon */}
      <span
        className={`icon-[line-md--chevron-small-down] animate-bounce text-xl ${Modules["scroll-indicator"]}`}
      />
    </>
  );
}
