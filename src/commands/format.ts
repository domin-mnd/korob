import { type Config, createConfig, load } from "@/utils/config";
import { run } from "@/utils/runner";
import { defineCommand } from "citty";

/**
 * Formats the project, similar to `korob format`.
 * @param {Config} _config - Configuration is unused. Function will fallback to file-based configs.
 * @experimental
 * @alpha
 */
export async function format(_config: Config = {}) {
  // VSCode biome extension doesn't support config path detection
  await run("biome format --write .");
  await run("prettier --write .");
}

export default defineCommand({
  meta: {
    name: "format",
    description: "Format project files.",
  },
  async run() {
    const config = (await load()).config ?? {};
    await createConfig(config);
    return format(config);
  },
});
