"use client";

import { useEffect, useState, useTransition } from "react";
import { setUserLocale } from "@/i18n/service";
import local from "@/components/i18n/language-get-config";

export default function LanguageSwitcher() {
  const [currentLocale, setCurrentLocale] = useState<string>("en");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let mounted = true;

    const fetchLocale = async () => {
      try {
        const locale = await local();
        if (mounted && locale) {
          setCurrentLocale(locale);
        }
      } catch (error) {
        console.error("Failed to load locale", error);
      }
    };

    void fetchLocale();

    return () => {
      mounted = false;
    };
  }, []);

  function onChange(locale: string) {
    startTransition(() => {
      setUserLocale(locale);
      setCurrentLocale(locale);
    });
  }

  return (
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
  );
}
