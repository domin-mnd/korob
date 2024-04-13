import { createHash } from "node:crypto";

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import ignore from "ignore";

export function fileNames() {
  const files = readdirSync(".", {
    recursive: true,
    withFileTypes: true,
  })
    .filter(file => file.isFile())
    .map(file => join(file.path, file.name));

  const filteredFiles = ignore()
    .add(
      existsSync(".gitignore")
        ? readFileSync(".gitignore").toString()
        : [],
    )
    .add([".git", "node_modules"])
    .filter(files);
  return filteredFiles;
}

const hash = createHash("md5");

export async function update(path: string) {
  const content = await readFile(path);
  hash.update(content);
}

export async function hashFiles() {
  const files = fileNames();
  for (const file of files) await update(file);
  return hash.digest("hex");
}
