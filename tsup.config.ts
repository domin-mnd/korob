import { readFileSync, rmSync, writeFileSync } from "node:fs";
import { rm } from "node:fs/promises";
import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: ["src/index.ts", "src/cli.ts"],
    format: ["cjs", "esm"],
    outDir: "dist",
    dts: true,
    minify: "terser",
    treeshake: "smallest",
    external: ["vitest", "typescript"],
    splitting: true,
    async onSuccess() {
      // beforeExit because onSuccess runs before dts is built
      process.on("beforeExit", () => {
        rmSync("dist/index.d.mts");
        rmSync("dist/cli.d.mts");
        rmSync("dist/cli.d.ts");
        rmSync("dist/cli.js");
        const rawJson = readFileSync("npm-shrinkwrap.json");
        const json = JSON.parse(rawJson.toString());
        writeFileSync("npm-shrinkwrap.json", JSON.stringify(json));
      });
    },
  },
]);
