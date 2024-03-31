<p align="center">
  <img alt="korob" src="public/korob.svg" width="100" />
</p>

# Overview

Korob (Russian word for "box") is a package development tool combining linter, formatter, bundler and tester. It is essentially a wrapper around [biome](https://biomejs.dev/), [prettier](https://prettier.io/), [tsup](https://tsup.egoist.dev/) & [vitest](https://vitest.dev/) with some preconfigured settings.

# Install

```bash
$ npm install --save-dev korob
$ yarn add -D korob
$ pnpm add -D korob
```

# Getting started

To start using korob, you need to initialize your project. To do so run the init command:

```bash
$ npx korob init
```

Running any command will automatically create a `biome.json`, `.prettierignore` & `.prettierrc.json` files depending on the korob's config so make sure to add them in your .gitignore.

Running `korob build` will build `src/index.ts` so use this entry as your main one. This is designed to keep your package as simple & consistent as possible.

## Configuration

Korob uses either "korob" key in `package.json` or `korob.config.ts`/`korob.config.js` to read the configuration. Here's a boilerplate example:

```ts
import { defineConfig } from "korob";

export default defineConfig({
  init: {
    createVscode: false,
  },
  // Tsup build options
  build: {
    dts: true,
    external: ["react"],
  },
  // Linter & formatter options
  diagnostics: {
    prettier: {
      semi: false,
    },
    biome: {
      organizeImports: {
        enabled: false,
      },
    },
  },
  // Vitest options
  test: {
    cache: false,
  },
});
```

## CLI Usage

### `korob build`

Builds the package using `tsup` bundler. Takes the `src/index.ts` as an entry point.

### `korob dev`

Starts a development server using `tsup` bundler wrapped with [`chokidar` watching library](https://github.com/paulmillr/chokidar).

### `korob format`

Formats the code using `prettier` and `biome`.

### `korob init`

Initializes the existing project with `korob` configuration.

### `korob lint`

Lints the code using `prettier` and `biome`.

### `korob test`

Runs tests using `vitest`.

## Javascript API (experimental)

Korob also offers programmatic way of working with your project:

```ts
import {
  build,
  dev,
  format,
  lint,
  test,
  defineConfig,
  type Config,
} from "korob";

main();
async function main() {
  const config = defineConfig({
    build: {
      dts: true,
      external: ["react"],
    },
  });

  await format(config);
  if (process.env.NODE_ENV === "production") {
    await build(config);
  } else {
    await dev(config);
  }
}

export async function testApp(config: Config) {
  await lint(config);
  await test(config);
}
```

# License

This project is under [MIT](https://choosealicense.com/licenses/mit/) license. You can freely use it for your own purposes.
