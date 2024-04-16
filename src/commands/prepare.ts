import { type Config, createConfig, load } from "@/utils/config";
import { defineCommand } from "citty";
import consola from "consola";
import { colorize } from "consola/utils";

/**
 * Creates config files for development environment purposes, similar to `korob prepare`.
 * @param {Config} config - General configuration object.
 * @experimental
 * @alpha
 */
export async function prepare(config: Config = {}) {
  await createConfig(config);
}

export default defineCommand({
  meta: {
    name: "prepare",
    description: "Create config files for development environment.",
  },
  async run() {
    const config = await load();
    await prepare(config);
    const configFiles = [
      "biome.json",
      ".prettierrc.json",
      ".prettierignore",
    ];
    consola.ready("Created configuration files!");
    configFiles
      .map(value => `${colorize("green", "+")} ${value}`)
      .forEach(value => console.log(value));
  },
});
