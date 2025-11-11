import localFont from "next/font/local";
import { NextIntlClientProvider } from "next-intl";
import { ViewTransitions } from "next-view-transitions";
import ParticlesBackground from "@/components/layout/particles-background";
import NavbarWrapper from "@/components/layout/navbar-wrapper";
import { getLocale } from "next-intl/server";
import "@/styles/globals.css";
import "@/styles/globals.scss";

/**
 * Chill Round F 字体配置
 * 字体文件位于项目 public 目录
 */
const ChillRoundF = localFont({
  src: "../../public/ChillRoundM.otf",
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = (await import(`../../messages/${locale}.json`)).default;
  return (
    <ViewTransitions>
      {/* 使用 ViewTransitions 包裹整个应用，实现页面切换动画效果 */}
      <html lang={locale}>
        <body className={ChillRoundF.className}>
          {/* next-intl提供国际化支持，包裹应用程序提供多语言功能 */}
          <NextIntlClientProvider messages={messages}>
            <div className="root">
              {/* 背景 */}
              <div className="basics-background">
                <ParticlesBackground
                  particleColors={["#ffffff", "#98F2B9"]}
                  particleCount={200}
                  particleSpread={10}
                  speed={0.0375}
                  sizeRandomness={0.5}
                  particleBaseSize={100}
                  moveParticlesOnHover={false}
                  alphaParticles={true}
                  disableRotation={false}
                />
              </div>
              {/* 导航栏 */}
              <NavbarWrapper />
              {children}
            </div>
          </NextIntlClientProvider>
        </body>
      </html>
    </ViewTransitions>
  );
}
