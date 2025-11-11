"use server";

import { cookies, headers } from "next/headers";

const locales = ["en", "zh"];

const defaultLocale = "en";

const COOKIE_NAME = "NEXT_LOCALE";

export async function getUserLocale() {
  // Read the persisted locale from cookies first ｜ 优先从 cookie 读取语言偏好
  const locale = (await cookies()).get(COOKIE_NAME)?.value;
  if (locale) return locale;

  // Fall back to the Accept-Language header ｜ 退回读取 Accept-Language 请求头
  const acceptLanguage = (await headers()).get("accept-language");

  // Extract the primary language tag ｜ 解析首个语言标签
  const parsedLocale = acceptLanguage?.split(",")[0].split("-")[0];

  // Return the supported locale or the default one ｜ 匹配受支持的语言，否则返回默认值
  if (parsedLocale && locales.includes(parsedLocale)) {
    return parsedLocale;
  }

  return defaultLocale;
}

export async function setUserLocale(locale: string) {
  // Persist the user's selection into the NEXT_LOCALE cookie ｜ 将用户选择写入 NEXT_LOCALE cookie
  (await cookies()).set(COOKIE_NAME, locale);
}
