import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: ["src/index.ts"],
    format: ["cjs", "esm"],
    outDir: "dist",
    dts: true,
    minify: "terser",
    treeshake: "smallest",
  },
  {
    entry: ["src/cli.ts"],
    format: ["cjs"],
    outDir: "bin",
    minify: "terser",
    treeshake: "smallest",
  },
]);
