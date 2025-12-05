/**
 * Silva 配置加载器
 * Silva configuration loader
 *
 * 负责从 YAML 文件加载网站配置信息，供全局引用
 * Loads website configuration from YAML for global consumption
 */

import { parse } from "yaml";
import rawConfig from "../../../../config/SilvaConfig.yaml?raw";

/**
 * 加载 Silva 配置文件
 * Load Silva configuration file
 *
 * @returns 解析后的配置对象 / Parsed configuration object
 * @throws 如果配置文件解析失败 / If parsing fails
 */
export function loadSilvaConfig() {
  try {
    const config = parse(rawConfig);

    if (import.meta.env.DEV) {
      console.debug(
        "Loaded SilvaConfig from ../../../../config/SilvaConfig.yaml",
      );
    }

    return config;
  } catch (error) {
    console.error("Failed to load SilvaConfig:", error);
    throw new Error(`Failed to load SilvaConfig: ${error}`);
  }
}

/**
 * 全局配置实例
 * Global configuration instance
 *
 * 在应用启动时加载一次并复用，以避免重复解析
 * Load once at app start and reuse to avoid repeated parsing
 */
export const SilvaConfig = loadSilvaConfig();
