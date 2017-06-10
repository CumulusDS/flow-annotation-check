# flow-annotation-check

[![Current Version](https://img.shields.io/npm/v/flow-annotation-check.svg)](https://www.npmjs.com/package/flow-annotation-check) [![Build Status](https://travis-ci.org/ryan953/flow-annotation-check.svg?branch=master)](https://travis-ci.org/ryan953/flow-annotation-check) [![Greenkeeper badge](https://badges.greenkeeper.io/ryan953/flow-annotation-check.svg)](https://greenkeeper.io/)

Verify the `@flow` and `@flow weak` annotations in your javascript files.

Install with NPM:

```bash
npm install flow-annotation-check
```

or use the global flag to easily run from bash:

```bash
npm install --global flow-annotation-check
```

## As a library

Once installed you can import `flow-annotation-check` into your own module and have the checker return a list of files for you to further process.

```javascript
const flowAnnotationCheck = require('flow-annotation-check');
```

The most useful methods are:

- `genReport(folder: string, config: Config): Promise<Array<FileReport>>`
- `getStatus(filePath: string): Promise<FlowStatus>`

The types involved are:

```javascript
type Glob = string; // See https://github.com/isaacs/node-glob

type Config = {
  include: Array<Glob>,
  exclude: Array<Glob>,
  absolute: boolean,
};

type FlowStatus = 'flow' | 'flow weak' | 'no flow';

type FileReport = {
  file: string,
  status: FlowStatus,
};
```

#### genReport(folder, config)

If you want to check a whole project at once, then call `genReport`. You can pass in the root folder, like `~/my-project/src` and then a configuration object with some glob strings to find your files. `genReport` will return a Promise that will resolve when all matching files have had their flow-status discovered.

This is a convienence method to make working with globs and mapping over `getStatus` easier. Each file is tested serially in order to avoid setting really long timeouts that lock up the flow server.

```javascript
flowAnnotationCheck.genReport(
  '~/path/to/project',
  {
    include: ['**/*.js'],
    exclude: ['**/*.coffee'],
    absolute: true,
  }
).then((entries) => {
  entries.forEach((entry) => {
    console.log(entry.status + "\t" + entry.file);
  });
});
```

#### getStatus(filePath)

If you're checking one file at a time then go ahead and call `getStatus` directly. This takes a string that will be passed directly into `flow` on the command line.

```javascript
const file = '~/path/to/project/src/main.js';
flowAnnotationCheck.getStatus(file).then((status) => {
  console.log(`The status of ${file} is ${status}`);
});
```

## CLI

If you don't want to install the package globally you can run `flow-annotation-check` from the CLI by adding it to your `package.json` file:

```json
{
  "dependencies": {
    "flow-annotation-check": "^1.0.0"
  },
  "scripts": {
    "annotations": "flow-annotation-check"
  }
}
```

Then run that script:

```bash
npm run annotations
```

or if installed globally:

```bash
flow-annotation-check ~/path/to/project
```

The available commands can be found by running `flow-annotation-check -h` or `npm run annotations -- --help`.

The common settings you will use are:

* `-i`, `--include`  Glob for files to include. Can be set multiple times.
* `-x`, `--exclude`  Glob for files to exclude. Can be set multiple times.
* `-a`, `--absolute` Report absolute path names. The default is to report only filenames.
* `-o`, `--output`   Choose from either `text`, `csv`, or `html` format.

Setting `--exclude` will override the defaults. So don't forget to ignore `node_modules/**/*.js` in addition to project specific folders.

You can also configure cli arguments directly inside your package.json file. Example:

```json
{
  "dependencies": {
    "flow-annotation-check": "^1.0.0"
  },
  "flow-annotation-check": {
    "absolute": false,
    "allow_weak": false,
    "exclude": ["+(node_modules|build|flow-typed)/**/*.js"],
    "flow_path": "flow",
    "include": ["**/*.js"],
    "output": "text",
    "root": "."
  }
}
```

### Output format

You can use the `--output` flag, or `-o` to set the output format of the report. All reports are printed to stdio using console.log. The `--output` flag has no affect when `--validate` is set.

The default format is `text` which prints a two column list of status value (one of `flow`, `flow weak` or `no flow`) and filename separated by the Tab character.

The `csv` option prints a two column list of status value and filename with each field wrapped in quotes and separated by `,`.

The `html-table` option prints an opening and closing `<table>` tag with two columns of data. Each row contains a `data-status` attribute which can be useful for styling. There is a summary of the rows inside the `<tfoot>` element. This does not print a full, valid, html page but it is possible to render it directly.

### VERBOSE

If the `VERBOSE` env variable is set to a truthy value then the resolved configuration params will be printed:

```
$ VERBOSE=1 ./bin/flow-annotation-check.js
Invoking: { command: 'report',
  flags:
   { absolute: false,
     allow_weak: false,
     exclude:
      [ 'src/__tests__/fixtures/comment-blocks-10.js',
        'src/__tests__/fixtures/comment-statement-10.js',
        'src/__tests__/fixtures/no-comments.js' ],
     flow_path: 'flow',
     include: [ 'src/**/*.js' ],
     output: 'text',
     root: '/Users/ryan/Code/flow-annotation-check' } }
flow  src/__tests__/cli-test.js
flow  src/__tests__/core-test.js
flow  src/__tests__/fixtures/comment-blocks-09.flow.js
flow  src/__tests__/fixtures/comment-single-block-09.flow.js
flow  src/__tests__/fixtures/comment-single-block-10.flow.js
flow  src/__tests__/fixtures/comment-statement-09.flow.js
... snip ...
```

### Validate mode

Flow has some internal limits on what annotations it will detect. This might mean some files might not report errors when you run `flow check` on the cli (see [docblock.ml](https://github.com/facebook/flow/blob/master/src/parsing/docblock.ml#L39-L101) in facebook/flow). You can use the `validate` command to verify your existing annotations.

:bangbang::warning: Save your work because `--validate` will modify files in your local filesystem. :warning::bangbang:

```bash
flow-annotation-check --validate
```

