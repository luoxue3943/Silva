/**
 * 全局布局组件 / Global Layout Component
 *
 * 为所有页面提供统一的背景、导航栏与内容区块结构
 * Provides unified background, navbar, and content structure for every page
 */
import ParticlesBackground from "@/components/ReactBits/particles/particles";
import Footer from "@/components/layout/footer/footer";
import Navbar from "@/components/layout/navbar/navbar";
import { SilvaConfig } from "@/lib/config-loader";
import { component$, Slot } from "@builder.io/qwik";
import { DocumentHead } from "@builder.io/qwik-city";

export default component$(() => {
  return (
    <>
      {/* 背景层：粒子动画效果 / Background layer: particle animation */}
      <div class="basics-background">
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
      <main>
        <Slot />
      </main>

      {/* 页面底部：页脚信息 / Page footer */}
      <footer>
        <Footer />
      </footer>
    </>
  );
});

/**
 * 全局默认 head / Global default head
 */
export const head: DocumentHead = {
  title: SilvaConfig.seo.title,
  meta: [
    {
      name: "description",
      content: SilvaConfig.seo.description,
    },
    {
      name: "author",
      content: SilvaConfig.seo.author,
    },
    {
      name: "theme-color",
      content: SilvaConfig.seo.theme_color,
    },
    {
      name: "application-name",
      content: SilvaConfig.seo.site_name,
    },

    // Open Graph 元数据 / Open Graph metadata
    {
      property: "og:title",
      content: SilvaConfig.seo.title,
    },
    {
      property: "og:description",
      content: SilvaConfig.seo.description,
    },
    {
      property: "og:type",
      content: SilvaConfig.seo.og.type,
    },
    {
      property: "og:image",
      content: SilvaConfig.seo.og.image,
    },
    {
      property: "og:site_name",
      content: SilvaConfig.seo.site_name,
    },
    {
      property: "og:locale",
      content: SilvaConfig.seo.locale,
    },
    {
      property: "og:url",
      content: SilvaConfig.seo.canonical,
    },

    // Twitter Card 元数据 / Twitter Card metadata
    {
      name: "twitter:card",
      content: SilvaConfig.seo.twitter.card,
    },
    {
      name: "twitter:site",
      content: SilvaConfig.seo.twitter.site,
    },
    {
      name: "twitter:creator",
      content: SilvaConfig.seo.twitter.creator,
    },
    {
      name: "twitter:image",
      content: SilvaConfig.seo.og.image,
    },

    // 搜索引擎爬虫配置 / Search engine crawler configuration
    {
      name: "robots",
      content: "index, follow",
    },
    {
      name: "googlebot",
      content: "index, follow",
    },
  ],
};
