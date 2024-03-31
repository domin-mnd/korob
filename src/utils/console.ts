import type { TsupOptions } from "@/utils/config";
import consola from "consola";
import { colorize } from "consola/utils";

let buildTimeStart = new Date().getTime();

// tsup doesn't provide plugin type
type Unboxed<T> = T extends (infer U)[] ? U : T;
type Plugin = Exclude<Unboxed<TsupOptions["plugins"]>, undefined>;

export const consolePlugin: Plugin = {
  name: "Custom logger",
  async buildStart(this) {
    buildTimeStart = new Date().getTime();

    let entries = this.options.entry;
    if (!Array.isArray(entries)) entries = Object.values(entries);
    const plural = entries.length > 1 ? "entries" : "entry";

    consola.start(
      `Build start for ${plural} ${entries
        .map(value => colorize("green", value))
        .join(", ")}...`,
    );
  },
  async buildEnd({ writtenFiles }) {
    // process.stdout.cursorTo(0);

    const notDeepTree = writtenFiles.map(({ name }, index) => {
      const route = colorize("gray", name);
      if (writtenFiles.length === index + 1)
        return `${colorize("bold", "└")} ${route}`;
      return `${colorize("bold", "├")} ${route}`;
    });

    const buildTimeEnd = new Date().getTime();
    consola.info(
      "Build",
      "success in",
      buildTimeEnd - buildTimeStart,
      "ms!\n ",
      notDeepTree.join("\n  "),
    );
  },
};
