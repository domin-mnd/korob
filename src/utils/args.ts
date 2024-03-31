export function setArgs(args: string[]) {
  process.argv = [process.argv[0], process.argv[1], ...args];
}

export function getArgs() {
  return process.argv.slice(2);
}
