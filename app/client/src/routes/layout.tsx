/**
 * 全局布局组件
 * Global Layout Component
 *
 * 为所有页面提供统一的布局结构，包括背景、导航栏和内容区域
 * Provides unified layout structure for all pages, including background, navbar and content area
 */

import { component$, Slot } from "@builder.io/qwik";
import ParticlesBackground from "~/components/ReactBits/particles";
import Footer from "~/components/layout/footer/footer";
import Navbar from "~/components/layout/navbar/navbar";

export default component$(() => {
  return (
    <>
      {/* 背景层：粒子动画效果 / Background layer: Particle animation effect */}
      <div class="basics-background">
        <ParticlesBackground
          particleColors={["#ffffff", "#d7fee5"]} // 粒子颜色：白色和淡绿色 / Particle colors: white and light green
          particleCount={200} // 粒子数量 / Number of particles
          particleSpread={10} // 粒子分散范围 / Particle spread range
          speed={0.0375} // 移动速度 / Movement speed
          sizeRandomness={0.5} // 大小随机性 / Size randomness
          particleBaseSize={100} // 基础粒子大小 / Base particle size
          moveParticlesOnHover={false} // 鼠标悬停时不移动粒子 / Don't move particles on hover
          alphaParticles={true} // 启用透明度 / Enable alpha transparency
          disableRotation={false} // 启用旋转 / Enable rotation
        />
      </div>

      {/* 页面头部：导航栏 / Page header: Navigation bar */}
      <header>
        <Navbar />
      </header>

      {/* 主内容区域：插槽用于渲染子页面 / Main content area: Slot for rendering child pages */}
      <main>
        <Slot />
      </main>

      {/* 页面底部：页脚信息 / Page footer: footer information */}
      <footer>
        <Footer />
      </footer>
    </>
  );
});
