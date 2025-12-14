/**
 * 首页组件 / Home Page Component
 *
 * 展示网站主页，包括欢迎信息、头像和社交链接
 * Displays the homepage with a welcome message, avatar, and social links
 */
import * as m from "@/paraglide/messages";
import { getLocale } from "@/paraglide/runtime";
import { component$ } from "@builder.io/qwik";
import { SilvaConfig } from "../lib/config-loader";
import Modules from "./home.module.scss";

export default component$(() => {
  // 获取当前语言环境 / Get current locale
  const locale = getLocale();
  // 提取语言代码 / Extract language code
  const langCode = locale.split("-")[0];

  // 根据语言获取网站所有者名称 / Get site owner name based on locale
  const siteOwnerName =
    SilvaConfig.site[`name_${langCode}`] ?? SilvaConfig.site.name;

  /**
   * 将文本拆分为带动画的 span 元素
   * Split text into animated span elements
   *
   * @param text 要拆分的文本 / Text to split
   * @param className 额外的 CSS 类名 / Additional CSS class name
   * @param delay 动画延迟偏移量 / Animation delay offset
   * @returns span 元素数组 / Array of span elements
   */
  const splitToSpans = (text: string, className = "", delay = 0) =>
    Array.from(text).map((char, i) => (
      <span
        key={i}
        class={`${Modules["pop-up"]} ${Modules["delay-" + (i + delay)]} ${className}`}
      >
        {/* 将空格替换为不间断空格以保持文本完整性 / Replace spaces with non-breaking spaces to keep text intact */}
        {char === " " ? "\u00A0" : char}
      </span>
    ));

  // 欢迎文本和所有者名称 / Welcome text and owner name
  const welcome = m["HomePage.welcome"]();

  return (
    <>
      <div class={Modules.container}>
        {/* 左侧：个人头像区域 / Left: Profile avatar section */}
        <div class={Modules.profile}>
          <img
            src="profile.jpg"
            alt="Profile Picture"
            class={Modules.avatar}
            width={300}
            height={300}
            loading="lazy"
          />
        </div>

        {/* 右侧：欢迎信息和社交链接 / Right: Welcome message and social links */}
        <div class={Modules.headline}>
          <div class={Modules.welcome}>
            {/* 欢迎文本区域 / Welcome text section */}
            <div class="h-fit">
              {/* 欢迎语（带逐字动画）/ Welcome message (character-by-character animation) */}
              {splitToSpans(welcome)}

              {/* 所有者名称 / Owner name */}
              <span class={`${Modules["owner-name"]} font-bold`}>
                {splitToSpans(siteOwnerName, "", welcome.length)}
              </span>

              {/* 结尾符号（挥手和句号）/ Ending symbols (wave and period) */}
              {["👋", "."].map((char, i) => (
                <span
                  key={char}
                  class={`${Modules["pop-up"]} ${
                    Modules["delay-" + ((welcome + siteOwnerName).length + i)]
                  }`}
                >
                  {char}
                </span>
              ))}
            </div>

            {/* 社交链接图标区域 / Social links icon section */}
            <div class={Modules["social-links"]}>
              {SilvaConfig.links?.map((link: any, i: number) => {
                // 图标配置映射 / Icon configuration mapping
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

                // 获取当前链接类型的配置 / Get configuration for current link type
                const config = iconConfig[link.type];
                if (!config) return null;

                return (
                  <a
                    key={i}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    class={`${Modules["icon-link"]} ${config.bgClass} ${Modules["pop-up"]} ${
                      Modules[
                        "delay-" + ((welcome + siteOwnerName).length + 2 + i)
                      ]
                    }`}
                  >
                    <span class={`${config.icon} ${Modules.icon}`} />
                  </a>
                );
              })}
            </div>

            {/* 座右铭文本区域 / Motto text section */}
            <div class={Modules.motto}>
              {splitToSpans(
                SilvaConfig.site.motto,
                "",
                (welcome + siteOwnerName).length + SilvaConfig.links.length + 2,
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 向下箭头图标 / Downward arrow icon */}
      <span
        class={`icon-[line-md--chevron-small-down] animate-bounce text-xl ${Modules["scroll-indicator"]}`}
      />
    </>
  );
});
