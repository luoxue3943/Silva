"use client";

import { usePathname } from "next/navigation";
import Particles from "@/components/ReactBits/particles";
import { useEffect, useRef, useState } from "react";
import type { ComponentProps } from "react";

type ParticlesProps = ComponentProps<typeof Particles>;

// Fade timing that hides canvas re-renders during route transitions ｜ 用于遮挡路由切换时画布重绘的淡入淡出时长
const FADE_DURATION_MS = 238;

/**
 * Keeps the particle canvas in sync with the current pathname and fades between states.
 * 让粒子背景随当前路径同步，并通过淡入淡出保证视觉连续性。
 */
export default function ParticlesBackground({
  className,
  ...rest
}: ParticlesProps) {
  const pathname = usePathname();
  const [visible, setVisible] = useState(true);
  const [renderKey, setRenderKey] = useState(pathname);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (pathname === renderKey) return;

    setVisible(false);
    timeoutRef.current = window.setTimeout(() => {
      setRenderKey(pathname);
      setVisible(true);
    }, FADE_DURATION_MS);

    return () => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [pathname, renderKey]);

  const containerClassName = [
    "fixed inset-0 transition-opacity duration-260 ease-in-out",
    visible ? "opacity-100" : "opacity-0",
  ].join(" ");

  return (
    <div className={containerClassName}>
      <Particles key={renderKey} className={className} {...rest} />
    </div>
  );
}
