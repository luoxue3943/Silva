"use client";

import { useState, useTransition } from "react";
import { setUserLocale } from "@/i18n/service";

type LanguageSwitcherProps = {
  locale: string;
};

export default function LanguageSwitcher({ locale }: LanguageSwitcherProps) {
  const [currentLocale, setCurrentLocale] = useState<string>(
    (locale !== undefined && locale === "en") || locale === "zh"
      ? locale
      : "zh",
  );
  const [isPending, startTransition] = useTransition();
  function onChange(locale: string) {
    startTransition(() => {
      setUserLocale(locale);
      setCurrentLocale(locale);
      setTimeout(() => {
        window.location.reload();
      }, 50);
    });
  }

  return (
    <div key={currentLocale}>
      <select
        title="switch language"
        className="bg-transparent"
        disabled={isPending}
        value={currentLocale}
        onChange={(e) => onChange(e.target.value)}
      >
        <option className="bg-gray-600" value="en">
          English
        </option>
        <option className="bg-gray-600" value="zh">
          中文
        </option>
      </select>
    </div>
  );
}
