"use client";

/**
 * 时间进度客户端组件 / Time progress client component
 *
 * 展示当前年份进度和当天进度，避免服务端时间与客户端时间不一致。 / Display current year and day progress while avoiding server-client time mismatch
 */

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

type ProgressState = {
  yearPercentage: string;
  dayPercentage: string;
};

const initialProgress: ProgressState = {
  yearPercentage: "--",
  dayPercentage: "--",
};

/**
 * 计算当前年份已经过去的百分比 / Calculate the elapsed percentage of the current year
 */
function getYearPercentage(): string {
  const now = new Date();

  const year = now.getFullYear();
  const startOfYear = new Date(year, 0, 1);
  const startOfNextYear = new Date(year + 1, 0, 1);

  const yearElapsed = now.getTime() - startOfYear.getTime();
  const yearTotal = startOfNextYear.getTime() - startOfYear.getTime();

  const percentage = Math.min(
    100,
    Math.max(0, (yearElapsed / yearTotal) * 100),
  );

  return percentage.toFixed(2);
}

/**
 * 计算今天已经过去的百分比 / Calculate the elapsed percentage of today
 */
function getDayPercentage(): string {
  const now = new Date();

  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );

  const startOfTomorrow = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
  );

  const dayElapsed = now.getTime() - startOfToday.getTime();
  const dayTotal = startOfTomorrow.getTime() - startOfToday.getTime();

  const percentage = Math.min(100, Math.max(0, (dayElapsed / dayTotal) * 100));

  return percentage.toFixed(10);
}

export default function TimelineProgressClient() {
  const t = useTranslations("Timeline");

  const [progress, setProgress] = useState<ProgressState>(initialProgress);

  useEffect(() => {
    // 年进度一天内变化很小，挂载时固定即可 / Year progress changes slowly enough to fix it on mount
    const fixedYearPercentage = getYearPercentage();

    let frameId = 0;

    const update = () => {
      setProgress({
        yearPercentage: fixedYearPercentage,
        dayPercentage: getDayPercentage(),
      });

      // 天进度连续刷新，保持小数部分平滑变化 / Day progress refreshes continuously for smooth decimal updates
      frameId = window.requestAnimationFrame(update);
    };

    update();

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <div className="mx-auto mt-6 flex max-w-3xl flex-col gap-2 text-sm text-gray-400">
      <p>
        {t("yearPercentage", {
          percentage: progress.yearPercentage,
        })}
      </p>

      <p>
        {t("dayPercentage", {
          percentage: progress.dayPercentage,
        })}
      </p>
    </div>
  );
}
