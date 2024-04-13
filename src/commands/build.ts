import { cache } from "@/utils/cache";
import { type Config, load } from "@/utils/config";
import { consolePlugin } from "@/utils/console";
import { defineCommand } from "citty";

/**
 * Builds the project, similar to `korob build`.
 * @param {Config} config - General configuration object.
 * @experimental
 * @alpha
 */
export async function build(config: Config = {}) {
  if (!Array.isArray(config.build))
    config.build = [config.build ?? {}];

  config.build.forEach(({ cache: shouldCache, ...config }) =>
    cache(
      {
        ...config,
        watch: false,
        silent: true,
        plugins: [...(config.plugins ?? []), consolePlugin],
      },
      shouldCache,
    ),
  );
}

export default defineCommand({
  meta: {
    name: "build",
    description: "Build project files.",
  },
  async run() {
    const config = await load();
    return build(config);
  },
});
