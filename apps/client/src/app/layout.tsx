import localFont from "next/font/local";
import { ViewTransition } from "react";
import ParticlesBackground from "@/components/ReactBits/particles/particles";
import Navbar from "@/components/layout/navbar/navbar";
import Footer from "@/components/layout/footer/footer";

import "./global.css";
import "./global.scss";

const ChillRoundF = localFont({
  src: "../../public/fonts/ChillRoundM.otf",
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
          {/* 固定背景层：粒子动画效果 */}
          <div className="basics-background">
            <ParticlesBackground
              particleColors={["#ffffff", "#d7fee5"]}
              particleCount={200} // 粒子总数
              particleSpread={10} // 粒子散布半径
              speed={0.0375} // 粒子运动速度
              sizeRandomness={0.5} // 粒子尺寸随机系数
              particleBaseSize={100} // 粒子基础尺寸
              moveParticlesOnHover={false} // 关闭悬停位移
              alphaParticles={true} // 启用粒子透明度
              disableRotation={false} // 保留粒子旋转
            />
          </div>

          {/* 导航栏区域 */}
          <header>
            <Navbar />
          </header>

          {/* 主内容区域 */}
          <main>{children}</main>

          {/* 页面底部区域 */}
          <footer>
            <Footer />
          </footer>
        </body>
      </html>
    </ViewTransition>
  );
}
