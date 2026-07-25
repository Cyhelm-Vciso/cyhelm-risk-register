import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { aiConfiguration } from "../server.mjs";

test("portfolio page contains its product identity and safe AI route", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  assert.match(html, /CyHelm Risk Ledger/);
  assert.match(html, /askAi|\/api\/ai/);
  assert.doesNotMatch(html, /localStorage|sessionStorage|sk-proj-/);
});

test("local OpenAI-compatible endpoints need no API key", () => {
  assert.deepEqual(aiConfiguration({ CYHELM_AI_BASE_URL: "http://127.0.0.1:11434/v1", CYHELM_AI_MODEL: "local-model" }), {
    configured: true,
    baseUrl: "http://127.0.0.1:11434/v1",
    model: "local-model",
    hasApiKey: false
  });
  assert.equal(aiConfiguration({}).configured, false);
});
