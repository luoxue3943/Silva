"use server";

import { getLocale } from "next-intl/server";

export default async function LanguageGetConfig(): Promise<string> {
  const locale: string = await getLocale();
  return locale;
}
