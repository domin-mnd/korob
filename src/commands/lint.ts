import { type Config, load } from "@/utils/config";
import { run } from "@/utils/runner";
import { defineCommand } from "citty";

/**
 * Lints and checks formatting of the project, similar to `korob lint`.
 * @param {Config} _config - Configuration is unused. Function will fallback to file-based configs.
 * @experimental
 * @alpha
 */
export async function lint(_config: Config = {}) {
  // VSCode biome extension doesn't support config path detection
  // await run("biome lint . --config-path .korob");
  // await run("biome format . --config-path .korob");
  await run("biome lint .");
  await run("biome format .");
  await run("prettier --check .");
}

export default defineCommand({
  meta: {
    name: "lint",
    description: "Lint project files.",
  },
  async run() {
    const config = await load();
    return lint(config);
  },
});
