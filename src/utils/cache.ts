import { existsSync } from "node:fs";
import { cp, rm } from "node:fs/promises";
import { join } from "node:path";
import { hashFiles } from "@/utils/hash";
import consola from "consola";
import { type Options, build } from "tsup";

const CACHE_DIR = join(process.cwd(), "node_modules/.cache/korob");

/** Drop-in replacement for tsup's build function including support for cache. */
export async function cache(
  config: Options,
  shouldCache: boolean = true,
) {
  if (!shouldCache) return build(config);
  const hash = await hashFiles();
  const source = join(CACHE_DIR, hash, config.outDir ?? "dist");
  const dest = join(process.cwd(), config.outDir ?? "dist");

  if (!existsSync(source)) {
    await build(config);
    await cp(dest, source, {
      recursive: true,
    });
    consola.info(`Cached \`${hash}\`...`);
    return;
  }

  if (config.clean && config.outDir?.length)
    await rm(dest, { recursive: true });

  await cp(source, dest, {
    recursive: true,
  });
  consola.ready(
    `Cache \`${hash}\` copied to \`${config.outDir ?? "dist"}\`!`,
  );
}
