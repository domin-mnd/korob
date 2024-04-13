import { type Config, addKillEvent, load } from "@/utils/config";
import { defineCommand } from "citty";
import consola from "consola";

/**
 * Tests the project, similar to `korob test`.
 * @param {Config} config - General configuration object.
 * @experimental
 * @alpha
 */
export async function test(config: Config = {}) {
  try {
    const { startVitest } = await import("vitest/node");
    const vitest = await startVitest("test", undefined, config.test);
    if (!vitest) return;
    addKillEvent(vitest?.close);
  } catch (_e) {
    consola.error(
      "Vitest is not installed. Please install `vitest@1.4.0` for tests",
    );
  }
}

export default defineCommand({
  meta: {
    name: "test",
    description: "Test project files.",
  },
  async run() {
    const config = await load();
    return test(config);
  },
});
