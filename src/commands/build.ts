import { type Config, createConfig, load } from "@/utils/config";
import { consolePlugin } from "@/utils/console";
import { defineCommand } from "citty";
import { build as tsupBuild } from "tsup";

export async function build(config: Config = {}) {
  if (!Array.isArray(config.build))
    config.build = [config.build ?? {}];

  config.build.forEach(value =>
    tsupBuild({
      ...value,
      silent: true,
      plugins: [...(value.plugins ?? []), consolePlugin],
    }),
  );
}

export default defineCommand({
  meta: {
    name: "build",
    description: "Build project files.",
  },
  async run() {
    const config = (await load()).config ?? {};
    await createConfig(config);
    return build(config);
  },
});
