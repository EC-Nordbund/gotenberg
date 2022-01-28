import {
  executor,
  handleResponse,
  handleZipResponse,
  office,
  readFile,
  url,
} from "./mod.ts";
import { assert } from "https://deno.land/std@0.121.0/testing/asserts.ts";

const __API_URL__ = "https://demo.gotenberg.dev/";

Deno.test("Test that api is running", async () => {
  const res = await fetch(new URL("/prometheus/metrics", __API_URL__));

  assert(res.status === 200, "API returns status code " + res.status);

  const t = await res.text();

  assert(t.length > 100, "Falsy response");
});

async function isPDF(file: Blob) {
  const arrayBuffer = await file.arrayBuffer();

  const start = String.fromCharCode(...new Uint8Array(arrayBuffer.slice(0, 4)));
  assert(start === "%PDF", "Returned file is no pdf!");
}

Deno.test("API with returned PDF works", async () => {
  const gotenberg = executor(__API_URL__);
  const res = await handleResponse(
    gotenberg(url("https://www.google.de/")),
  );

  await isPDF(res.content);
});

Deno.test("API with returned ZIP works", async () => {
  const gotenberg = executor(__API_URL__);

  const files = [
    await readFile("./example.docx", "file1.docx"),
    await readFile("./example.docx", "file2.docx"),
  ];

  const res = await handleZipResponse(gotenberg(office(files)));

  for (let i = 0; i < res.length; i++) {
    assert(res[i].filename.endsWith(".pdf"), "Filenames doesn't end with pdf!");

    await isPDF(res[i].content);
  }
});
