# Gotenberg Deno Client
> This is a WIP client implementation until version 1.0 api breaking changes can happen!

Basic example:

```ts
import { execurtor, office } from 'path/to/liv/mod.ts'

const gotenberg = executor("http://gotenberg:3000")

gotenberg(
  office([] as any[], {
    landscape: true,
  })
);

```