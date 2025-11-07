import localFont from "next/font/local";
import { NextIntlClientProvider } from "next-intl";
import { ViewTransitions } from "next-view-transitions";
import "@/styles/globals.css";
import "@/styles/globals.scss";
import Navbar from "@/components/layout/navbar";

/**
 * Chill Round F 字体配置
 * 字体文件位于项目 public 目录
 */
const ChillRoundF = localFont({
  src: [
    {
      path: "../../public/ChillRoundFBold.ttf",
      style: "bold",
    },
    {
      path: "../../public/ChillRoundFRegular.ttf",
      style: "regular",
    },
  ],
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ViewTransitions>
      {/* 使用 ViewTransitions 包裹整个应用，实现页面切换动画效果 */}
      <html>
        <body className={ChillRoundF.className}>
          {/* next-intl提供国际化支持，包裹应用程序提供多语言功能 */}
          <NextIntlClientProvider>
            <div className="root">
              {/* 导航栏 */}
              <Navbar />
              {children}
            </div>
          </NextIntlClientProvider>
        </body>
      </html>
    </ViewTransitions>
  );
}
