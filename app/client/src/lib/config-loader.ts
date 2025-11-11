import { readFileSync } from "node:fs";
import { parse } from "yaml";

/**
 * Load the shared Silva configuration file and surface readable errors when parsing fails.
 * 读取共享的 Silva 配置文件，解析失败时抛出可读的错误信息。
 */
export function loadSilvaConfig() {
  try {
    const configPath = "../config/SilvaConfig.yaml";
    const content = readFileSync(configPath, "utf-8");
    const config = parse(content);

    console.debug(`✓ Loaded SilvaConfig from ${configPath}`);
    return config;
  } catch (error) {
    console.error("Failed to load SilvaConfig:", error);
    throw new Error(`Failed to load SilvaConfig: ${error}`);
  }
}

export const SilvaConfig = loadSilvaConfig();
