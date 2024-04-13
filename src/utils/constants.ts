import { join } from "node:path";
import type { BiomeConfig } from "@/utils/config";
import biomeConfig from "@domin-mnd/config/biome";

// It should create hash folder i.e. node_modules/.cache/korob/c692793f10d54ffe8c40cb435961f0f7/index.js
export const EXECUTABLE = "index";
export const CACHE_DIR = join(
  process.cwd(),
  "node_modules/.cache/korob",
);

const BIOME_IGNORE = [
  "biome.json",
  ".prettierrc.json",
  ".prettierignore",
  "dist",
  "bin",
];
const BIOME_CONFIG = biomeConfig as BiomeConfig;

export const DEFAULT_CONFIG = {
  diagnostics: {
    biome: {
      ...BIOME_CONFIG,
      $schema: "https://biomejs.dev/schemas/1.6.3/schema.json",
      linter: {
        ...BIOME_CONFIG.linter,
        ignore: BIOME_IGNORE,
      },
      formatter: {
        ...BIOME_CONFIG.formatter,
        ignore: BIOME_IGNORE,
      },
    },
    prettier: {
      tabWidth: 2,
      semi: true,
    },
  },
  start: {
    entry: "src/index.ts",
    format: "cjs",
    skipNodeModulesBundle: true,
    dts: false,
    sourcemap: false,
    external: ["react", "react-dom"],
    minify: false,
  },
  build: {
    entry: ["src/index.ts"],
    target: "node16",
    outDir: "dist",
    external: ["react", "react-dom"],
  },
  test: {
    coverage: {
      provider: "v8",
    },
  },
};
