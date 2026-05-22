import "server-only";

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { parse } from "yaml";

export type LocalizedTextMap = Record<string, string>;

export interface LocalizedNameConfig {
  /**
   * 默认名称 / Default name
   *
   * 由 names.default 或第一个可用名称规范化得到。
   * Normalized from names.default or the first available localized name.
   */
  name: string;

  /**
   * 可扩展本地化名称 / Extensible localized names
   *
   * 示例 / Examples:
   * - default: "示例"
   * - zh-CN: "示例"
   * - en-US: "example"
   * - ja-JP: "サンプル"
   */
  names?: LocalizedTextMap;
}

export interface SilvaSiteConfig extends LocalizedNameConfig {
  motto?: string;
  copyright?: string;
}

export interface SilvaLinkConfig {
  type: "github" | "twitter" | "email" | "telegram" | string;
  url: string;
}

export interface SilvaFilingConfig {
  name: string;
  url: string;
}

export interface SilvaCategoryConfig extends LocalizedNameConfig {
  slug: string;
}

export interface SilvaSeoConfig {
  title: string;
  site_name: string;
  description: string;
  locale: "zh-CN" | "en-US" | string;
  canonical: string;
  author: string;
  theme_color: string;
  og: {
    title: string;
    description: string;
    type: "website" | "article" | "profile" | string;
    image: string;
  };
  twitter: {
    site: string;
    creator: string;
    card: "summary" | "summary_large_image" | string;
  };
}

export interface SilvaConfigSchema {
  site: SilvaSiteConfig;
  links: SilvaLinkConfig[];
  filings: SilvaFilingConfig[];
  categories: SilvaCategoryConfig[];
  seo: SilvaSeoConfig;
}

type LegacyLocalizedNameConfig = {
  name?: string;
  names?: LocalizedTextMap;
} & Partial<Record<`name_${string}`, string>>;

type RawSilvaConfigSchema = {
  site?: LegacyLocalizedNameConfig & {
    motto?: string;
  };
  links?: SilvaLinkConfig[];
  filings?: SilvaFilingConfig[];
  categories?: Array<
    LegacyLocalizedNameConfig & {
      slug: string;
    }
  >;
  seo?: SilvaSeoConfig;
};

function resolveSilvaConfigPath(): string {
  const candidates = [
    path.resolve(process.cwd(), "config/SilvaConfig.yaml"),
    path.resolve(process.cwd(), "../config/SilvaConfig.yaml"),
    path.resolve(process.cwd(), "../../config/SilvaConfig.yaml"),
    path.resolve(process.cwd(), "../../../config/SilvaConfig.yaml"),
    path.resolve(process.cwd(), "../../../../config/SilvaConfig.yaml"),
  ];

  const configPath = candidates.find((candidate) => existsSync(candidate));

  if (!configPath) {
    throw new Error(
      `SilvaConfig.yaml not found. Tried: ${candidates.join(", ")}`,
    );
  }

  return configPath;
}

function legacyNameKeyToLocale(key: `name_${string}`): string {
  const lang = key.replace(/^name_/, "");

  // 兼容旧字段：name_zh / name_en
  // Keep compatibility with legacy fields: name_zh / name_en
  if (lang === "zh") return "zh-CN";
  if (lang === "en") return "en-US";

  return lang;
}

function normalizeLocalizedName<T extends LegacyLocalizedNameConfig>(
  item: T | undefined,
  fallbackName: string,
): T & LocalizedNameConfig {
  const source = item ?? ({} as T);

  const legacyNames = Object.fromEntries(
    Object.entries(source)
      .filter(
        (entry): entry is [`name_${string}`, string] =>
          entry[0].startsWith("name_") && typeof entry[1] === "string",
      )
      .map(([key, value]) => [legacyNameKeyToLocale(key), value]),
  );

  const names = {
    ...legacyNames,
    ...(source.names ?? {}),
  };

  const name =
    source.name ??
    names.default ??
    names["zh-CN"] ??
    names["en-US"] ??
    Object.values(names)[0] ??
    fallbackName;

  return {
    ...source,
    name,
    names: {
      default: name,
      ...names,
    },
  };
}

function normalizeLocale(locale: string): string {
  return locale.trim().replace(/_/g, "-").toLowerCase();
}

function getLocalizedText(
  names: LocalizedTextMap | undefined,
  locale: string,
  fallback: string,
): string {
  if (!names) return fallback;

  const normalizedLocale = normalizeLocale(locale);
  const langCode = normalizedLocale.split("-")[0];

  const entries = Object.entries(names);

  const findByNormalizedKey = (target: string) =>
    entries.find(([key]) => normalizeLocale(key) === target)?.[1];

  const exactMatch = findByNormalizedKey(normalizedLocale);
  if (exactMatch) return exactMatch;

  if (langCode) {
    const langMatch =
      findByNormalizedKey(langCode) ??
      entries.find(([key]) =>
        normalizeLocale(key).startsWith(`${langCode}-`),
      )?.[1];

    if (langMatch) return langMatch;
  }

  return names.default ?? fallback;
}

export function getLocalizedName(
  item: LocalizedNameConfig,
  locale: string,
): string {
  return getLocalizedText(item.names, locale, item.name);
}

function normalizeSilvaConfig(
  rawConfig: RawSilvaConfigSchema,
): SilvaConfigSchema {
  return {
    site: normalizeLocalizedName(rawConfig.site, "Silva"),
    links: rawConfig.links ?? [],
    filings: rawConfig.filings ?? [],
    categories: (rawConfig.categories ?? []).map((category) =>
      normalizeLocalizedName(category, category.slug),
    ),
    seo: rawConfig.seo ?? {
      title: "Silva",
      site_name: "Silva",
      description: "",
      locale: "zh-CN",
      canonical: "",
      author: "Silva",
      theme_color: "#000000",
      og: {
        title: "Silva",
        description: "",
        type: "website",
        image: "",
      },
      twitter: {
        site: "",
        creator: "",
        card: "summary_large_image",
      },
    },
  };
}

function loadSilvaConfig(): SilvaConfigSchema {
  try {
    const configPath = resolveSilvaConfigPath();
    const rawConfig = readFileSync(configPath, "utf8");
    const parsedConfig = parse(rawConfig) as RawSilvaConfigSchema;

    return normalizeSilvaConfig(parsedConfig);
  } catch (error) {
    console.error("Failed to load SilvaConfig:", error);
    throw new Error(`Failed to load SilvaConfig: ${String(error)}`);
  }
}

export const SilvaConfig = loadSilvaConfig();
