import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { type Config, load } from "@/utils/config";
import { CACHE_DIR, EXECUTABLE } from "@/utils/constants";
import { hashFiles } from "@/utils/hash";
import { defineCommand } from "citty";
import consola from "consola";
import { build as tsupBuild } from "tsup";

interface EntryPointsReturn {
  entry: Record<string, string>;
  executable: string;
}

let argPath: string | undefined;
export function entryPoint(config: Config): EntryPointsReturn {
  const entry = argPath ?? config.start?.entry ?? "src/index.ts";

  if (!existsSync(entry)) {
    consola.error(`Entry file "${entry}" not found.`);
    process.exit(1);
  }

  argPath = undefined;
  return {
    entry: {
      [EXECUTABLE]: entry,
    },
    executable: EXECUTABLE,
  };
}

function getExecutable(path: string, config: Config) {
  switch (config.start?.format) {
    case "esm":
      return `${path}.mjs`;
    case "iife":
      return `${path}.global.js`;
    case "cjs":
      return `${path}.js`;
    default:
      return `${path}.js`;
  }
}

/**
 * Executes javascript/typescript files, similar to `korob start`.
 * @param {Config} config - General configuration object.
 * @experimental
 * @alpha
 */
export async function start(config: Config = {}) {
  const { entry, executable } = entryPoint(config);
  const hash = await hashFiles();
  const dirPath = join(
    CACHE_DIR,
    "start",
    config.start?.watch ? "watch" : hash,
  );
  const exePath = join(dirPath, executable);
  const executablePath = getExecutable(exePath, config);

  if (existsSync(executablePath) && !config.start?.watch)
    return execSync(`node ${executablePath}`, { stdio: "inherit" });

  await tsupBuild({
    ...config.start,
    entry,
    outDir: dirPath,
    silent: true,
    onSuccess: `node ${executablePath}`,
  });
}

export default defineCommand({
  meta: {
    name: "start",
    description: "Execute entry.",
  },
  args: {
    path: {
      type: "positional",
      required: false,
      description: "Path to executable",
      valueHint: "src/index.ts",
    },
  },
  async run({ args }) {
    const config = await load();
    argPath = args.path;
    return start(config);
  },
});
