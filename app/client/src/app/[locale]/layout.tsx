import localFont from "next/font/local";
import { NextIntlClientProvider } from "next-intl";
import { ViewTransitions } from "next-view-transitions";
import ParticlesBackground from "@/components/ReactBits/particles/particles";
import Footer from "@/components/layout/footer/footer";

// 导入全局样式 / Import global styles
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
    <ViewTransitions>
      <html lang="zh-CN">
        <body className={ChillRoundF.className}>
          <NextIntlClientProvider>
            {/* 背景层：粒子动画效果 / Background layer: particle animation */}
            <div className="basics-background">
              <ParticlesBackground
                particleColors={["#ffffff", "#d7fee5"]} // 粒子颜色：白色与淡绿色 / Particle colors: white and light green
                particleCount={200} // 粒子数量 / Number of particles
                particleSpread={10} // 粒子分散范围 / Particle spread range
                speed={0.0375} // 移动速度 / Movement speed
                sizeRandomness={0.5} // 大小随机度 / Size randomness
                particleBaseSize={100} // 基础粒子大小 / Base particle size
                moveParticlesOnHover={false} // 鼠标悬停时不移动粒子 / Don't move particles on hover
                alphaParticles={true} // 启用透明度 / Enable alpha transparency
                disableRotation={false} // 启用旋转 / Enable rotation
              />
            </div>

            {/* 页面头部：导航栏 / Page header: navigation bar */}
            <header>
              <Navbar />
            </header>

            {/* 主内容区域：插槽用于渲染子页面 / Main content: Slot renders child pages */}
            <main>{children}</main>

            {/* 页面底部：页脚信息 / Page footer */}
            <footer>
              <Footer />
            </footer>
          </NextIntlClientProvider>
        </body>
      </html>
    </ViewTransitions>
  );
}
