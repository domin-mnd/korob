import { setArgs } from "@/utils/args";

export enum Modules {
  Biome = "biome",
  Prettier = "prettier",
  Turbo = "turbo",
  Tsup = "tsup",
  Vitest = "vitest",
}

export interface RunOptions {
  turbo?: boolean;
}

export async function run(
  executable: `${Modules} ${string}` | `${Modules}`,
  options: RunOptions = {},
) {
  const paths: Record<Modules, string> = {
    [Modules.Biome]: "@biomejs/biome/bin/biome",
    [Modules.Prettier]: "prettier/bin/prettier.cjs",
    [Modules.Turbo]: "turbo/bin/turbo",
    [Modules.Tsup]: "tsup/dist/cli-default.js",
    [Modules.Vitest]: "vitest/vitest.mjs",
  };

  const [module, ...args] = executable.split(" ") as [
    Modules,
    ...string[],
  ];

  /** @todo implement turbo support. */
  if (options.turbo) {
    setArgs(["run", module, "--", ...args]);
    paths[module] = paths[Modules.Turbo];
  } else {
    setArgs(args);
  }

  await require(paths[module]);
  // Delete require cache to avoid caching the module if it's called twice.
  delete require.cache[require.resolve(paths[module])];
}
