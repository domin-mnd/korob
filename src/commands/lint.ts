import { type Config, createConfig, load } from "@/utils/config";
import { run } from "@/utils/runner";
import { defineCommand } from "citty";

/**
 * @param _config Configuration is unused. Function will fallback to file-based configs.
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
    const config = (await load()).config ?? {};
    await createConfig(config);
    return lint(config);
  },
});
