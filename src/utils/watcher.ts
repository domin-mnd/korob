import type { Stats } from "node:fs";
import { watch as chokidarWatch } from "chokidar";

export function watch(
  callback: (path: string, stats?: Stats) => void,
) {
  const watcher = chokidarWatch("src", {
    persistent: true,
  });

  watcher.on("change", callback);
}
