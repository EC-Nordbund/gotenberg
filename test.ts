import { chromiumUrl, executor } from "./mod.ts";
import { assert } from "https://deno.land/std@0.121.0/testing/asserts.ts";

const __API_URL__ = "https://demo.gotenberg.dev/";

Deno.test("Test that api is running", async () => {
  const res = await fetch(new URL("/prometheus/metrics", __API_URL__));

  assert(res.status === 200, "API returns status code " + res.status);

  const t = await res.text();

  assert(t.length > 100, "Falsy response");
});

Deno.test("chromium/url", async () => {
  const gotenberg = executor(__API_URL__);
  const res = await gotenberg(chromiumUrl("https://www.google.de/"));

  assert(res.status === 200, "API failed! " + res.status);

  const ab = await res.arrayBuffer();

  const start = String.fromCharCode(...new Uint8Array(ab.slice(0, 4)));

  assert(start === "%PDF", "Returned file is no pdf!");
});
