# Gotenberg Deno Client

> This is a WIP client implementation until version 1.0 api breaking changes can
> happen!

## API

For each Endpoint we provide a custom function they are calles: `chromiumUrl`,
`chromiumHTML`, `chromiumMarkdown`, `office`, `merge`, `convert`

Each function get as parameters all data needed to execute THIS request and
returns a `RequestInfo` object. This can be passed to an executor.

We provide 2 executor: `executor` and `webhookExecutor`. They get options as
parameters that are Request undependend so only request-header fields. They
return a function that gets a `RequestInfo` object and return a Promise of a
Response object.

All files need to be in the form of the `ASSET` object so a object with 2 fields
a content field of type Blob (or subclass) and a filename (type string). We
provide a helper `readFile` to simply load a file (async) from the filesystem.

_**Most API should be clear by looking at the types of the functions!**_

## Basic example:

```ts
import {
  executor,
  office,
  readFile,
  handleResponse
} from "https://deno.land/x/gotenberg/mod.ts";

const gotenberg = executor("http://gotenberg:3000");

handleResponse(
  gotenberg(
    office([readFile("./path/to/file.docx")], {
      landscape: true,
    }),
  )
)
```

## Note

Most of this API is created just by looking at the docs at
https://gotenberg.dev/ so feel free to report any bugs or missing options! This
is a alpha version!

## Roadmap
- [ ] documentation


