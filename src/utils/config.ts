import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join as joinPath } from "node:path";
import { pathToFileURL } from "node:url";
import {
  CACHE_DIR,
  DEFAULT_CONFIG,
  EXECUTABLE,
} from "@/utils/constants";
import { findup } from "@/utils/findup";
import { join, stringify } from "@/utils/resolver";
import { Biome, Distribution } from "@biomejs/js-api";
import type { PartialConfiguration as BiomeConfig } from "@biomejs/wasm-nodejs";
import defu from "defu";
import type { Config as PrettierConfig } from "prettier";
import {
  type Format,
  type Options as _TsupOptions,
  build,
} from "tsup";
import type { InlineConfig as TestConfig } from "vitest";

export interface BuildConfig
  extends Omit<_TsupOptions, "ignoreWatch" | "watch" | "silent"> {
  /**
   * Cache transpilation process.
   * @default true
   */
  cache?: boolean;
}

export interface KorobConfig {
  /** `korob init` configuration. */
  init?: {
    /**
     * Create .vscode/settings.json file.
     * @default true if vscode text editor found.
     */
    createVscode?: boolean;
  };
}

export interface StartConfig
  extends Omit<
    _TsupOptions,
    "silent" | "entry" | "entryPoints" | "format" | "outDir"
  > {
  /**
   * Cache transpilation process.
   * Applies to `korob build` only.
   * @default true
   */
  cache?: boolean;
  entry?: string;
  format?: Format;
}

export interface Config extends KorobConfig {
  /** `korob start` configuration. */
  start?: StartConfig;
  /** `korob build` & `korob dev` configuration. Identical to tsup options. */
  build?: BuildConfig | BuildConfig[];
  /** `korob lint` & `korob format` configuration. */
  diagnostics?: {
    /** Prettier formatter configuration. */
    prettier?: PrettierConfig;
    /** Biome linter & formatter configuration configuration. */
    biome?: BiomeConfig;
  };
  /** `korob test` configuration. Identical to vitest options. */
  test?: TestConfig;
}

async function loadPackageJson(cwd: string): Promise<Config> {
  const packageJsonPath = await findup(cwd, path => {
    const json = joinPath(path, "package.json");
    if (existsSync(json)) return json;
  });
  const pkgJson = packageJsonPath
    ? JSON.parse(
        (
          await readFile(joinPath(process.cwd(), packageJsonPath))
        ).toString(),
      )
    : {};
  return "korob" in pkgJson ? pkgJson.korob : {};
}

async function compileConfig(path: string) {
  const outDir = joinPath(CACHE_DIR, "config");

  await build({
    entry: {
      [EXECUTABLE]: path,
    },
    outDir,
    target: "esnext",
    skipNodeModulesBundle: true,
    format: ["cjs"],
    silent: true,
    dts: false,
  });

  const url = pathToFileURL(joinPath(outDir, "index.js"));
  return (await import(url.toString())).default;
}

async function loadScript(cwd: string): Promise<Config> {
  const scriptPath = await findup(cwd, path => {
    const js = joinPath(path, "korob.config.js");
    const ts = joinPath(path, "korob.config.ts");
    if (existsSync(js)) return js;
    if (existsSync(ts)) return ts;
  });

  const json = scriptPath
    ? (await compileConfig(scriptPath)).default
    : {};
  return json;
}

const CWD = ".";
export async function load() {
  return (
    defu(loadScript(CWD), loadPackageJson(CWD), DEFAULT_CONFIG) ?? {}
  );
}

enum KillEvents {
  SIGINT = "SIGINT",
  SIGQUIT = "SIGQUIT",
  SIGTERM = "SIGTERM",
  EXIT = "exit",
}

export function addKillEvent<T, U>(cb: (data: T[]) => U) {
  Object.keys(KillEvents).forEach(event => process.on(event, cb));
}

export async function initBiome(config: Config): Promise<Biome> {
  const biome = await Biome.create({
    distribution: Distribution.NODE,
  });
  biome.applyConfiguration(config.diagnostics?.biome ?? {});

  return biome;
}

export async function writeJSON<T>(
  path: string,
  rawContent: T,
  biome: Biome,
) {
  /**
   * Formatter cannot ignore biome.json. This is why we format biome on its creation
   * @see {@link https://github.com/biomejs/biome/blob/cad1cfd1e8fc7440960213ce49130670dc90491d/crates/biome_service/src/workspace/server.rs#L349-L353}
   */
  const { content } = biome.formatContent(stringify(rawContent), {
    filePath: path,
  });

  await writeFile(path, content);
}

export async function createConfig(config: Config) {
  const paths = {
    biome: join("biome.json"),
    prettier: join(".prettierrc.json"),
    prettierIgnore: join(".prettierignore"),
  };

  const biomeIgnored = [
      "**/*.tsx",
      "**/*.ts",
      "**/*.jsx",
      "**/*.js",
      "**/*.json",
      "**/*.jsonc",
    ],
    lockIgnored = ["pnpm-lock.yaml"];

  await mkdir(join(""), { recursive: true });

  const biome = await initBiome(config);

  await writeJSON(paths.biome, config.diagnostics?.biome, biome);
  await writeJSON(
    paths.prettier,
    config.diagnostics?.prettier,
    biome,
  );
  await writeFile(
    paths.prettierIgnore,
    ["# Biome", ...biomeIgnored, "# Lock", ...lockIgnored].join("\n"),
  );
}

export type { PrettierConfig, BiomeConfig, TestConfig };
