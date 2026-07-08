import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";
import { cache } from "react";
import { parse } from "yaml";

export type RegistrationItem = {
  name: string;
  url: string;
};

export type SilvaConfig = {
  site: {
    author: string;
  };
  registration?: RegistrationItem[];
};

export type SilvaPublicConfig = {
  siteAuthor: string;
  registration: RegistrationItem[];
};

async function readYamlFile<T = unknown>(filePath: string): Promise<T> {
  const resolvedPath = path.isAbsolute(filePath)
    ? filePath
    : path.resolve(process.cwd(), filePath);

  const content = await readFile(resolvedPath, "utf8");

  return parse(content) as T;
}

export const getSilvaConfig = cache(async (): Promise<SilvaConfig> => {
  return readYamlFile<SilvaConfig>("../../configs/SilvaConfig.yaml");
});

export async function getConfig(): Promise<SilvaPublicConfig> {
  const config = await getSilvaConfig();

  return {
    siteAuthor: config.site.author,
    registration: config.registration ?? [],
  };
}
