import { build } from "@/commands/build";
import { type BuildConfig, type Config, load } from "@/utils/config";
import { consolePlugin } from "@/utils/console";
import { defineCommand } from "citty";
import { build as tsupBuild } from "tsup";

const devBuild = async (build: BuildConfig[]) =>
  build.forEach(tsupBuild);

const formatConfig = (build: BuildConfig[]) =>
  build.map(value => ({
    ...value,
    watch: true,
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
  const awaitable = build(config);

  const configBuild = Array.isArray(config.build)
    ? config.build
    : [config.build ?? {}];

  await awaitable;
  await devBuild(formatConfig(configBuild));
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
