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
import { version } from "package.json";

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
  consola.success(`Created ${note(CONFIG_PATH)}.\n`);
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
    "\n",
  );
  return config;
}

export async function gitignoreInit() {
  // Append to .gitignore
  const ignored = [
    "dist",
    ".korob",
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
  const dependencyInit = (await consola.prompt(
    "Which dependencies to install?",
    {
      type: "multiselect",
      options: [
        {
          label: "korob",
          hint: "Scaffolds configuration",
          value: `korob@${version}`,
        },
        {
          label: "@biomejs/biome",
          hint: "LSP server",
          value: "@biomejs/biome@1.6.3",
        },
        {
          label: "vitest",
          hint: "Tests",
          value: "vitest@1.4.0",
        },
        {
          label: "typescript",
          hint: "Definition .d.ts build",
          value: "typescript@5.4.4",
        },
      ],
    },
  )) as unknown as string[];
  if (!dependencyInit.length) return dependencyInit;

  const dependencyList = dependencyInit.map(note).join(", ");

  consola.start(`Installing ${dependencyList}...`);

  // Not using lspBin option instead because it's buggy
  await addDevDependency(dependencyInit, {
    silent: true,
  });

  consola.success(`Installed ${dependencyList} successfully.\n`);
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

  const previousConfig = existsSync(".vscode/settings.json")
    ? await readFile(".vscode/settings.json")
    : "{}";
  const parsedPreviousConfig = JSON.parse(previousConfig.toString());

  await mkdir(".vscode", { recursive: true });
  await writeFile(
    ".vscode/settings.json",
    stringify({
      ...parsedPreviousConfig,
      ...vsc,
    }),
  );
  consola.success(`Added ${note(".vscode/settings.json")}.\n`);
  return vscodeInit;
}

/**
 * @experimental
 * @alpha
 */
export async function init() {
  consola.start("Initializing...");
  const dependencies = await dependencyInit();
  if (dependencies.some(value => value.includes("korob")))
    await korobConfigInit();
  const config = await configInit();

  const _shouldAddGitignore = await gitignoreInit();
  const shouldInitVscode = await vscodeInit(config);

  consola.info("Initialization complete.\n");

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
