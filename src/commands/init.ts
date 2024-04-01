import { existsSync } from "node:fs";
import {
  appendFile,
  mkdir,
  readFile,
  writeFile,
} from "node:fs/promises";
import { type Config, createConfig, load } from "@/utils/config";
import { stringify } from "@/utils/resolver";
import { defineCommand } from "citty";
import consola from "consola";
import { colorize } from "consola/utils";
import { addDevDependency } from "nypm";

const vsc = {
  "[json]": {
    "editor.defaultFormatter": "biomejs.biome",
  },
  "[javascript]": {
    "editor.defaultFormatter": "biomejs.biome",
  },
  "[typescript]": {
    "editor.defaultFormatter": "biomejs.biome",
  },
  "[javascriptreact]": {
    "editor.defaultFormatter": "biomejs.biome",
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "biomejs.biome",
  },
  "[jsonc]": {
    "editor.defaultFormatter": "biomejs.biome",
  },
  "editor.defaultFormatter": "esbenp.prettier-vscode",
};

const note = (text: string) => colorize("green", text),
  comment = (text: string) => colorize("gray", text),
  mark = (text: string) => colorize("yellow", text),
  link = (text: string) => colorize("magenta", text);

export async function korobConfigInit() {
  const CONFIG_PATH = "korob.config.ts";
  // Create korob.config.ts
  if (existsSync(CONFIG_PATH))
    return consola.warn(
      `File ${mark(CONFIG_PATH)} already exists...`,
    );

  // Contents example
  const contents: string[] = [
    'import { defineConfig } from "korob";',
    "",
    "export default defineConfig({",
    "  build: {",
    "    dts: true,",
    '    external: ["react"],',
    "  },",
    "});",
    "",
  ];

  await writeFile(CONFIG_PATH, contents.join("\n"));
  consola.success(`Created ${mark(CONFIG_PATH)}.`);
}

export async function configInit() {
  const configFiles = [
    ".prettierrc.json",
    ".prettierignore",
    "biome.json",
  ];

  const config = (await load()).config ?? {};
  await createConfig(config);

  consola.success(
    "Created configuration.",
    configFiles.map(value => `\n${note("+")} ${value}`).join(""),
  );
  return config;
}

export async function gitignoreInit() {
  // Append to .gitignore
  const ignored = [
    "dist",
    ".prettierrc.json",
    ".prettierignore",
    "biome.json",
  ];

  let shouldAppend = !existsSync(".gitignore");
  if (shouldAppend) {
    consola.warn("No .gitignore found. Creating one...");
  } else {
    const contents = await readFile(".gitignore", "utf-8");

    shouldAppend = !contents.includes(
      ["# Korob", ...ignored].join("\n"),
    );
  }

  if (!shouldAppend) return false;

  await appendFile(
    ".gitignore",
    ["# Korob", ...ignored].map(value => `\n${value}`).join(""),
  );
  consola.success(
    "Appended to .gitignore.",
    `\n${note("+")} ${comment("# Korob")}`,
    ignored.map(value => `\n${note("+")} ${value}`).join(""),
  );
  return shouldAppend;
}

export async function dependencyInit() {
  const dependencyInit = await consola.prompt(
    "Install dependencies?",
    {
      type: "confirm",
    },
  );
  if (!dependencyInit) return false;

  consola.start(
    `Installing ${note("@biomejs/biome")} (for LSP server) & ${note(
      "vitest",
    )} (for tests)...`,
  );

  // Add @biomejs/biome & vitest
  // Not using lspBin option instead because it's buggy
  await addDevDependency(["@biomejs/biome", "vitest"], {
    silent: true,
  });

  consola.success(
    `Installed ${note("@biomejs/biome")} & ${note(
      "vitest",
    )} successfully.`,
  );
  return dependencyInit;
}

export async function vscodeInit(config: Config) {
  // Add .vscode if the text editor is vsc
  const vscodeInit =
    process.env.TERM_PROGRAM === "vscode" &&
    config.init?.createVscode !== false &&
    (await consola.prompt(
      `Visual studio code detected... Initialize ${mark(
        ".vscode/settings.json",
      )}?`,
      {
        type: "confirm",
      },
    ));

  if (!vscodeInit) return false;

  mkdir(".vscode", { recursive: true });
  writeFile(".vscode/settings.json", stringify(vsc));
  consola.success("Added .vscode/settings.json.");
  return vscodeInit;
}

export async function init() {
  consola.start("Initializing...");
  await korobConfigInit();
  const config = await configInit();

  const _shouldAddGitignore = await gitignoreInit();
  const shouldInitVscode = await vscodeInit(config);
  const _shouldInstall = await dependencyInit();

  consola.info("Initialization complete.");

  if (shouldInitVscode)
    consola.info(
      `Please install ${link(
        "Biome LSP",
      )} extension if you didn't already - https://marketplace.visualstudio.com/items?itemName=biomejs.biome`,
    );

  /** @todo implement importing config files into korob.config.ts. */
}

export default defineCommand({
  meta: {
    name: "init",
    description: "Initialize existing package.",
  },
  async run() {
    return init();
  },
});
