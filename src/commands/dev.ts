import { build } from "@/commands/build";
import { type BuildConfig, type Config, load } from "@/utils/config";
import { consolePlugin } from "@/utils/console";
import { watch } from "@/utils/watcher";
import { defineCommand } from "citty";
import { build as tsupBuild } from "tsup";

const devBuild = async (build: BuildConfig[]) =>
  build.forEach(tsupBuild);

const formatConfig = (build: BuildConfig[]) =>
  build.map(value => ({
    ...value,
    watch: false,
    silent: true,
    plugins: [...(value.plugins ?? []), consolePlugin],
  }));

/**
 * Starts the development server, similar to `korob dev`.
 * @param {Config} config - General configuration object.
 * @experimental
 * @alpha
 */
export async function dev(config: Config = {}) {
  build(config);
  const configBuild = Array.isArray(config.build)
    ? config.build
    : [config.build ?? {}];

  watch(() => devBuild(formatConfig(configBuild)));
}

export default defineCommand({
  meta: {
    name: "dev",
    description: "Start development server.",
  },
  async run() {
    const config = await load();
    return dev(config);
  },
});
