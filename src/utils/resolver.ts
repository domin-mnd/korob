import { join as pathJoin } from "node:path";

export const join = (path: string, inConfigDir?: boolean) =>
  pathJoin(process.cwd(), inConfigDir ? ".korob" : "", path);

export const stringify = <T>(value: T) =>
  JSON.stringify(value, null, 2);
