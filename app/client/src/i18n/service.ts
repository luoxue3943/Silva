"use server";

import { cookies, headers } from "next/headers";

const locales = ["en", "zh"];

const defaultLocale = "en";

const COOKIE_NAME = "NEXT_LOCALE";

export async function getUserLocale() {
  // 读取 cookie
  const locale = (await cookies()).get(COOKIE_NAME)?.value;
  if (locale) return locale;

  // 读取请求头 accept-language
  const acceptLanguage = (await headers()).get("accept-language");

  // 解析请求头
  const parsedLocale = acceptLanguage?.split(",")[0].split("-")[0];

  // 如果解析出的语言受支持则返回，否则使用默认语言
  if (parsedLocale && locales.includes(parsedLocale)) {
    return parsedLocale;
  }

  return defaultLocale;
}

export async function setUserLocale(locale: string) {
  (await cookies()).set(COOKIE_NAME, locale);
}
