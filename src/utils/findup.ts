import { normalize } from "node:path";

/** Finder function to fetch cwd tree. */
export async function findup<T>(
  cwd: string,
  match: (path: string) => T | Promise<T>,
): Promise<T | undefined> {
  const segments = normalize(cwd).split("/");

  while (segments.length > 0) {
    const path = segments.join("/") || "/";
    const result = await match(path);

    if (result) return result;
    segments.pop();
  }
}
