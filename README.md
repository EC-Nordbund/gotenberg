# Gotenberg Deno Client

## API

We have 4 types of exported functions:

1. File-Loader helper (`readFile`)
2. `RequestInfo` creator (`office`, `merge`, `convert`, `url`, `markdown`,
   `url`)
3. Executoren (`executor`, `webhookExecutor`)
4. Response handler (`handleZipResponse`, `handleResponse`)

To create a request:

1. create a (global) execcutor wich can be used for multiple requests (we
   provide 2 one with webhook options). You might use multiple executoren in
   your project!
2. create the RequestInfo object by calling the corresponding function depending
   on your use case.
3. pass the RequestInfo to the executor it returns a `Promise<Response>`.
4. pass the Promise (or the Response) to one of the response handler. If you
   expect more than one pdf file use `handleZipResponse`. If you expect a single
   PDF use `handleResponse`

## Basic example:

```ts
import {
  executor,
  handleResponse,
  office,
  readFile,
} from "https://deno.land/x/gotenberg/mod.ts";

const gotenberg = executor("http://gotenberg:3000");

const { filename, content } = await handleResponse(
  gotenberg(
    office([await readFile("./path/to/file.docx")], {
      landscape: true,
    }),
  ),
);
```

## API Documentation

The generated API documentaion you can find here:
https://doc.deno.land/https://deno.land/x/gotenberg/mod.ts
