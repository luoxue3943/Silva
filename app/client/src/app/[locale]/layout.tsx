import localFont from "next/font/local";
import { NextIntlClientProvider } from "next-intl";
import { ViewTransition } from "react";
import ParticlesBackground from "@/components/ReactBits/particles/particles";
import Footer from "@/components/layout/footer/footer";

// 加载全局样式入口 / Load global style entry points
import "./global.css";
import "./global.scss";
import Navbar from "@/components/layout/navbar/navbar";

const ChillRoundF = localFont({
  src: "../../../public/fonts/ChillRoundM.otf",
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ViewTransition>
      <html lang="zh-CN">
        <body className={ChillRoundF.className}>
          <NextIntlClientProvider>
            {/* 固定背景层：粒子动画效果 / Fixed background layer: particle animation */}
            <div className="basics-background">
              <ParticlesBackground
                particleColors={["#ffffff", "#d7fee5"]} // 粒子配色：白色与淡绿 / Particle palette: white and light green
                particleCount={200} // 粒子总数 / Total particle count
                particleSpread={10} // 粒子散布半径 / Particle spread radius
                speed={0.0375} // 粒子运动速度 / Particle movement speed
                sizeRandomness={0.5} // 粒子尺寸随机系数 / Particle size randomness factor
                particleBaseSize={100} // 粒子基础尺寸 / Base particle size
                moveParticlesOnHover={false} // 关闭悬停位移 / Disables hover movement
                alphaParticles={true} // 启用粒子透明度 / Enables particle alpha
                disableRotation={false} // 保留粒子旋转 / Keeps particle rotation enabled
              />
            </div>

            {/* 页面头部区域：导航栏 / Page header area: navigation bar */}
            <header>
              <Navbar />
            </header>

            {/* 主内容插槽：渲染当前路由页面 / Main content slot: renders the current route page */}
            <main>{children}</main>

            {/* 页面底部区域：页脚信息 / Page footer area: footer information */}
            <footer>
              <Footer />
            </footer>
          </NextIntlClientProvider>
        </body>
      </html>
    </ViewTransition>
  );
}
