"use client";

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
    const fixedYearPercentage = getYearPercentage();

    let frameId = 0;

    const update = () => {
      setProgress({
        yearPercentage: fixedYearPercentage,
        dayPercentage: getDayPercentage(),
      });

      frameId = window.requestAnimationFrame(update);
    };

    update();

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <div className="mx-auto mt-6 flex max-w-3xl flex-col items-center gap-2 text-sm text-gray-400">
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
