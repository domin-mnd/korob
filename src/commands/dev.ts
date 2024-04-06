import { build } from "@/commands/build";
import {
  type Config,
  type TsupOptions,
  createConfig,
  load,
} from "@/utils/config";
import { consolePlugin } from "@/utils/console";
import { watch } from "chokidar";
import { defineCommand } from "citty";
import { build as tsupBuild } from "tsup";

const devBuild = async (build: TsupOptions[]) =>
  build.forEach(tsupBuild);

const formatConfig = (build: TsupOptions[]) =>
  build.map(value => ({
    ...value,
    silent: true,
    plugins: [...(value.plugins ?? []), consolePlugin],
  }));

export async function dev(config: Config = {}) {
  build(config);
  const watcher = watch("src", {
    persistent: true,
  });

  const configBuild = Array.isArray(config.build)
    ? config.build
    : [config.build ?? {}];

  watcher.on("change", () => devBuild(formatConfig(configBuild)));
}

export default defineCommand({
  meta: {
    name: "dev",
    description: "Start development server.",
  },
  async run() {
    const config = (await load()).config ?? {};
    await createConfig(config);
    return dev(config);
  },
});
