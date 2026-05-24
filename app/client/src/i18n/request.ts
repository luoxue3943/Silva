import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

/**
 * 请求级国际化配置 / Request-level i18n configuration
 *
 * 校验请求语言并加载对应消息文件，非法语言回退到默认语言。
 * Validate the requested locale and load messages, falling back to the default locale
 */
export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
