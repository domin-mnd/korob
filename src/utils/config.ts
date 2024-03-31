import { mkdir, writeFile } from "node:fs/promises";
import { join, stringify } from "@/utils/resolver";
import { Biome, Distribution } from "@biomejs/js-api";
import type { PartialConfiguration as BiomeConfig } from "@biomejs/wasm-nodejs";
import biomeConfig from "@domin-mnd/config/biome";
import { loadConfig } from "c12";
import type { Config as PrettierConfig } from "prettier";
import type { Options as TsupOptions } from "tsup";
import type { InlineConfig as VitestConfig } from "vitest";

export type TsupConfig = TsupOptions | TsupOptions[];

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

export interface Config extends KorobConfig {
  /** `korob build` & `korob dev` configuration. Identical to tsup options. */
  build?: TsupConfig;
  /** `korob lint` & `korob format` configuration. */
  diagnostics?: {
    prettier?: PrettierConfig;
    biome?: BiomeConfig;
  };
  /** `korob test` configuration. Identical to vitest options. */
  test?: VitestConfig;
}

export async function load() {
  const ignore = [
    "biome.json",
    ".prettierrc.json",
    ".prettierignore",
    "dist",
    "bin",
  ];
  const biome = biomeConfig as BiomeConfig;

  return loadConfig<Config>({
    name: "korob",
    dotenv: true,
    packageJson: true,
    defaultConfig: {
      diagnostics: {
        biome: {
          ...biome,
          $schema: "https://biomejs.dev/schemas/1.6.3/schema.json",
          linter: {
            ...biome.linter,
            ignore,
          },
          formatter: {
            ...biome.formatter,
            ignore,
          },
        },
        prettier: {
          tabWidth: 2,
          semi: true,
        },
      },
      build: {
        entry: ["src/index.ts"],
        target: "node16",
        outDir: "dist",
        treeshake: "smallest",
      },
      test: {
        coverage: {
          provider: "v8",
        },
      },
    },
  });
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

  // It shouldn't be async
  // function exit() {
  //   rmSync(join(""), { recursive: true, force: true });
  //   process.exit(0);
  // }

  // Initialize killwatcher
  // addKillEvent(exit);

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

export type {
  TsupOptions,
  PrettierConfig,
  BiomeConfig,
  VitestConfig,
};
