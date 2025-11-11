import { getTranslations, getLocale } from "next-intl/server";
import { SilvaConfig } from "@/lib/config-loader";
import Modules from "@/styles/home.module.scss";

export default async function Home() {
  // Resolve the active locale for this request ｜ 获取当前请求的语言环境
  const locale = await getLocale();

  const t = await getTranslations("HomePage");

  /**
   * Resolve the localized site owner name, falling back to the default key when missing.
   * 根据当前语言返回站点所有者名称，若无对应字段则回退到默认 name。
   */
  const siteOwnerName =
    SilvaConfig.site[`name_${locale.split("-")[0]}`] ?? SilvaConfig.site.name;

  /**
   * Split text into animated span elements to create a staggered pop effect.
   * 将文本拆分成带延迟动画的 <span>，以实现阶梯式弹出效果。
   *
   * @param text Text to split ｜ 需要拆分的原始文本
   * @param className Extra class name for each span ｜ 额外附加的类名
   * @param delay Base index offset for delay utilities ｜ 延迟动画的起始偏移量
   * @returns React nodes for every character ｜ 每个字符对应的 React 节点数组
   */
  const splitToSpans = (text: string, className = "", delay = 0) =>
    Array.from(text).map((char, i) => (
      <span
        key={i}
        className={`${Modules["pop-up"]} ${Modules["delay-" + (i + delay)]} ${className}`}
      >
        {char}
      </span>
    ));

  return (
    <main>
      {/* Hero headline block ｜ 首页主标题区块 */}
      <h1 className="text-4xl">
        {(() => {
          // Prepare localized tokens for the hero ｜ 拆解主标题所需的本地化片段
          const welcome = t("welcome"); // Localized "welcome" copy ｜ “欢迎”文案
          const owner = siteOwnerName; // Site owner display name ｜ 站点所有者名字
          const totalLength = (welcome + owner).length; // Combined character length ｜ 字符数量(Welcome, + 站点所有者名称)

          return (
            <>
              {/* "Welcome" lettering ｜ “欢迎”文案 */}
              {splitToSpans(welcome)}

              {/* Site owner text ｜ 网站所有者名字 */}
              <span className="inline px-3 font-bold">
                {splitToSpans(owner, "", welcome.length)}
              </span>

              {/* Emoji and punctuation ｜ 表情与句号 */}
              {["👋", "."].map((char, i) => (
                <span
                  key={char}
                  className={`${Modules["pop-up"]} ${Modules["delay-" + (totalLength + i)]}`}
                >
                  {char}
                </span>
              ))}
            </>
          );
        })()}
      </h1>
    </main>
  );
}
