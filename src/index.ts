import type { Config } from "@/utils/config";
import { createDefineConfig } from "c12";

export const defineConfig = createDefineConfig<Config>();

export type { Config };
export { build } from "@/commands/build";
export { dev } from "@/commands/dev";
export { format } from "@/commands/format";
export { init } from "@/commands/init";
export { lint } from "@/commands/lint";
export { test } from "@/commands/test";
