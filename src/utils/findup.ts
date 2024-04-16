import { normalize } from "node:path";

/** Finder function to fetch cwd tree. */
export async function findup<T>(
  cwd: string,
  match: (path: string) => T | Promise<T>,
): Promise<T | undefined> {
  const divider = process.platform === "win32" ? "\\" : "/";
  const segments = normalize(cwd).split(divider);

  while (segments.length > 0) {
    const path = segments.join(divider) ?? divider;
    const result = await match(path);

    if (result) return result;
    segments.pop();
  }
}
