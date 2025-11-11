import localFont from "next/font/local";
import { NextIntlClientProvider } from "next-intl";
import { ViewTransitions } from "next-view-transitions";
import ParticlesBackground from "@/components/layout/particles-background";
import NavbarWrapper from "@/components/layout/navbar-wrapper";
import { getLocale } from "next-intl/server";
import "@/styles/globals.css";
import "@/styles/globals.scss";

/**
 * Load the font ChillRoundM from the public directory.
 * 从 public 目录加载字体 ChillRoundM
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
      {/* ViewTransitions wraps the entire page to achieve routing transition animations. ｜ ViewTransitions 包裹整个页面以实现路由切换动画效果 */}
      <html lang={locale}>
        <body className={ChillRoundF.className}>
          {/* next-intl supplies localized messages for the entire app ｜ next-intl 为整站注入多语言文案 */}
          <NextIntlClientProvider messages={messages}>
            <div className="root">
              {/* Background particle canvas ｜ 背景粒子画布 */}
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
              {/* Navbar ｜ 导航栏 */}
              <NavbarWrapper />
              {children}
            </div>
          </NextIntlClientProvider>
        </body>
      </html>
    </ViewTransitions>
  );
}
