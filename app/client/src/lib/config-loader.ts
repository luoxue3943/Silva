/**
 * Silva 配置加载器
 * Silva Configuration Loader
 *
 * 负责从 YAML 文件加载网站配置信息
 * Responsible for loading website configuration from YAML file
 */

import { readFileSync } from "node:fs";
import { parse } from "yaml";

/**
 * 加载 Silva 配置文件
 * Load Silva configuration file
 *
 * @returns 解析后的配置对象 / Parsed configuration object
 * @throws 如果配置文件不存在或解析失败 / If config file doesn't exist or parsing fails
 */
export function loadSilvaConfig() {
  try {
    // 配置文件相对路径 / Config file relative path
    const configPath = "../../config/SilvaConfig.yaml";

    // 读取配置文件内容 / Read config file content
    const content = readFileSync(configPath, "utf-8");

    // 解析 YAML 格式 / Parse YAML format
    const config = parse(content);

    console.debug(`✓ Loaded SilvaConfig from ${configPath}`);
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
 * 在应用启动时加载一次，供全局使用
 * Loaded once at application startup for global use
 */
export const SilvaConfig = loadSilvaConfig();
