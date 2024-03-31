import {
  type Config,
  addKillEvent,
  createConfig,
  load,
} from "@/utils/config";
import { defineCommand } from "citty";

export async function test(config: Config = {}) {
  const { startVitest } = await import("vitest/node");
  const vitest = await startVitest("test", undefined, config.test);
  if (!vitest) return;
  addKillEvent(vitest?.close);
}

export default defineCommand({
  meta: {
    name: "test",
    description: "Test project files.",
  },
  async run() {
    const config = (await load()).config ?? {};
    await createConfig(config);
    return test(config);
  },
});
