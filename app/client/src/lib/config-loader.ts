import { readFileSync } from "node:fs";
import { parse } from "yaml";

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
