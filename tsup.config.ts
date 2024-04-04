import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: ["src/index.ts"],
    format: ["cjs", "esm"],
    outDir: "dist",
    dts: true,
    // minify: "terser",
    minify: false,
    treeshake: "smallest",
    splitting: true,
  },
  {
    entry: ["src/cli.ts"],
    format: ["cjs"],
    outDir: "bin",
    // minify: "terser",
    minify: false,
    treeshake: "smallest",
    splitting: true,
  },
]);
