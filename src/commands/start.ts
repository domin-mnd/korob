import { existsSync, rmSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import {
  type Config,
  addKillEvent,
  createConfig,
  load,
} from "@/utils/config";
import { defineCommand } from "citty";
import consola from "consola";
import { build as tsupBuild } from "tsup";

interface EntryPointsReturn {
  entry: Record<string, string>;
  executable: string;
}

let argPath: string | undefined = undefined;
export function entryPoint(config: Config): EntryPointsReturn {
  const executable = "index_1";
  const entry = argPath ?? config.start?.entry ?? "src/index.ts";

  if (!existsSync(entry)) {
    consola.error(`Entry file "${entry}" not found.`);
    process.exit(1);
  }

  argPath = undefined;
  return {
    entry: {
      [executable]: entry,
    },
    executable,
  };
}

let counter = 1;
function executeNode(path: string, config: Config) {
  switch (config.start?.format) {
    case "esm":
      // Use search query to avoid caching import
      return import(
        `${pathToFileURL(path).toString()}.mjs?${counter++}`
      );
    case "iife":
      return require(`${path}.global.js`);
  }
  return require(`${path}.js`);
}

function clearNode(path: string, config: Config) {
  switch (config.start?.format) {
    case "iife":
      return delete require.cache[
        require.resolve(`${path}.global.js`)
      ];
    case "cjs":
      return delete require.cache[require.resolve(`${path}.js`)];
  }
}

const CACHE_DIR = ".korob";

/**
 * @experimental
 * @alpha
 */
export async function start(config: Config = {}) {
  const { entry, executable } = entryPoint(config);
  const outDir = join(CACHE_DIR, config.start?.outDir ?? "");

  function clear() {
    rmSync(join(CACHE_DIR), { recursive: true, force: true });
    process.exit(0);
  }

  addKillEvent(clear);

  await tsupBuild({
    ...config.start,
    entry,
    outDir,
    silent: true,
    async onSuccess() {
      if (typeof config.start?.onSuccess === "function")
        await config.start?.onSuccess();
      const path = join(process.cwd(), outDir, executable);
      await executeNode(path, config);
      return () => {
        clearNode(path, config);
      };
    },
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
      default: "src/index.ts",
    },
  },
  async run({ args }) {
    const config = (await load()).config ?? {};
    await createConfig(config);
    argPath = args.path;
    return start(config);
  },
});
