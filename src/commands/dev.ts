import { build } from "@/commands/build";
import { type Config, createConfig, load } from "@/utils/config";
import { consolePlugin } from "@/utils/console";
import { watch } from "chokidar";
import { defineCommand } from "citty";
import { build as tsupBuild } from "tsup";

export async function dev(config: Config = {}) {
  async function devBuild(config: Config) {
    if (!Array.isArray(config.build))
      config.build = [config?.build ?? {}];

    config.build.forEach(value =>
      tsupBuild({
        ...value,
        silent: true,
        plugins: [...(value.plugins ?? []), consolePlugin],
      }),
    );
  }

  build();
  const watcher = watch("src", {
    persistent: true,
  });

  watcher.on("change", () => devBuild(config ?? {}));
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
