/**
 * Silva 配置加载器
 * Silva configuration loader
 *
 * 负责从 YAML 文件加载网站配置信息，供全局引用
 * Loads website configuration from YAML for global consumption
 */
import { readFileSync } from "node:fs";
import { parse } from "yaml";

/**
 * 加载 Silva 配置文件
 * Load Silva configuration file
 *
 * @returns 解析后的配置对象 / Parsed configuration object
 * @throws 如果配置文件不存在或解析失败 / If the config file is missing or fails to parse
 */
export function loadSilvaConfig() {
  try {
    // 配置文件相对路径 / Config file relative path
    const configPath = "../../config/SilvaConfig.yaml";

    // 读取配置文件内容 / Read config file content
    const content = readFileSync(configPath, "utf-8");

    // 解析 YAML 格式 / Parse YAML format
    const config = parse(content);

    console.debug(`Loaded SilvaConfig from ${configPath}`);
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
 * 在应用启动时加载一次并复用，以避免重复
 * Loaded once at app start to avoid repeated
 */
export const SilvaConfig = loadSilvaConfig();
