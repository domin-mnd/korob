import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { findup } from "@/utils/findup";

enum PackageManager {
  Npm = "npm",
  Yarn = "yarn",
  Pnpm = "pnpm",
  Bun = "bun",
}

export const packageManagers = [
  {
    name: "npm",
    command: "npm",
    lockFile: "package-lock.json",
  },
  {
    name: "pnpm",
    command: "pnpm",
    lockFile: "pnpm-lock.yaml",
    files: ["pnpm-workspace.yaml"],
  },
  {
    name: "bun",
    command: "bun",
    lockFile: "bun.lockb",
  },
  {
    name: "yarn",
    command: "yarn",
    lockFile: "yarn.lock",
    files: [".yarnrc.yml"],
  },
  {
    name: "yarn",
    command: "yarn",
    lockFile: "yarn.lock",
  },
];

export async function detectPackageManager(
  cwd: string = process.cwd(),
): Promise<PackageManager | undefined> {
  const detected = await findup(resolve(cwd ?? "."), async path => {
    // 1. Use `packageManager` field from package.json
    const packageJSONPath = join(path, "package.json");
    if (existsSync(packageJSONPath)) {
      const packageJSON = JSON.parse(
        await readFile(packageJSONPath, "utf8"),
      );
      if (packageJSON?.packageManager) {
        const [name, _version = "0.0.0"] =
          packageJSON.packageManager.split("@");
        return name;
      }
    }

    // 2. Use implicit file detection
    for (const packageManager of packageManagers) {
      const detectionsFiles = [
        packageManager.lockFile,
        ...(packageManager.files ?? []),
      ].filter(Boolean) as string[];

      if (
        detectionsFiles.some(file => existsSync(resolve(path, file)))
      )
        return packageManager.name;
    }
  });

  if (!detected) {
    // 3. Try to detect based on dlx/exec command
    const scriptArg = process.argv[1];
    if (scriptArg) {
      for (const packageManager of packageManagers) {
        // Check /.[name] or /[name] in path
        const re = new RegExp(`[/\\\\]\\.?${packageManager.command}`);
        if (re.test(scriptArg))
          return packageManager.name as PackageManager;
      }
    }
  }

  return detected as PackageManager;
}

export async function addDevDependency(dependencies: string[]) {
  const pm = (await detectPackageManager()) ?? PackageManager.Npm;
  const deps = dependencies.join(" ");

  switch (pm) {
    case PackageManager.Npm:
      return execSync(`npm install --save-dev ${deps}`);
    case PackageManager.Yarn:
      return execSync(`yarn add --dev ${deps}`);
    case PackageManager.Pnpm:
      return execSync(`pnpm add --save-dev ${deps}`);
    case PackageManager.Bun:
      return execSync(`bun add --dev ${deps}`);
  }
}
