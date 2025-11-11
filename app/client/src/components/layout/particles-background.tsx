"use client";

import { usePathname } from "next/navigation";
import Particles from "@/components/ReactBits/particles";
import { useEffect, useRef, useState } from "react";
import type { ComponentProps } from "react";

type ParticlesProps = ComponentProps<typeof Particles>;

/**
 * Keeps the particle canvas in sync with the current pathname and fades between states.
 * 让粒子背景随当前路径同步，并通过淡入淡出保证视觉连续性。
 */
export default function ParticlesBackground({
  className,
  ...rest
}: ParticlesProps) {
  const pathname = usePathname();
  // Track whether the particle layer should be visible so we can run opacity transitions. ｜ 跟踪粒子层当前是否可见，以便驱动透明度过渡。
  const [visible, setVisible] = useState(true);
  // Changing the key forces <Particles> to remount and pick up the new pathname context. ｜ 更换 key 可以强制 <Particles> 重新挂载并应用新的路径上下文。
  const [renderKey, setRenderKey] = useState(pathname);
  // Store the animation frame handle used to delay the fade-out until the next paint. ｜ 保存 requestAnimationFrame 句柄以把淡出推迟到下一帧。
  const fadeFrameRef = useRef<number | null>(null);
  // Store the timeout handle that waits for the fade to finish before remounting. ｜ 保存 setTimeout 句柄以等待淡出完成后再重新挂载。
  const transitionTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (pathname === renderKey) return;

    fadeFrameRef.current = window.requestAnimationFrame(() => {
      // Fade out first so users never see the particle canvas rerender mid-transition. ｜ 先淡出以避免用户在过渡中看到画布重绘。
      setVisible(false);
      fadeFrameRef.current = null;

      transitionTimeoutRef.current = window.setTimeout(() => {
        // Once the fade completes, swap the key and fade back in with the fresh canvas. ｜ 淡出结束后切换 key 并重新淡入，让画布以新路径渲染。
        setRenderKey(pathname);
        setVisible(true);
        transitionTimeoutRef.current = null;
      }, 238); // Wait 238ms so the fade-out fully covers the canvas rerender. ｜ 等待 238ms 以确保淡出完全遮挡画布重绘。
    });

    return () => {
      if (fadeFrameRef.current !== null) {
        cancelAnimationFrame(fadeFrameRef.current);
        fadeFrameRef.current = null;
      }

      if (transitionTimeoutRef.current !== null) {
        clearTimeout(transitionTimeoutRef.current);
        transitionTimeoutRef.current = null;
      }
    };
  }, [pathname, renderKey]);

  const containerClassName = [
    "fixed inset-0 transition-opacity duration-260 ease-in-out",
    visible ? "opacity-100" : "opacity-0",
  ].join(" ");

  // Render the particle background once at the app root so every page inherits it. ｜ 将粒子背景固定渲染在应用根部，以便每个页面都能继承。
  return (
    <div className={containerClassName}>
      <Particles key={renderKey} className={className} {...rest} />
    </div>
  );
}
