import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("./", import.meta.url));
const project = process.env.CYHELM_PROJECT;
const port = Number(process.env.PORT || 4173);
const projectRoot = root;
const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".json": "application/json; charset=utf-8", ".svg": "image/svg+xml" };

function json(response, status, payload) {
  response.writeHead(status, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" });
  response.end(JSON.stringify(payload));
}

async function readBody(request) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > 100_000) throw new Error("Request body exceeds 100 KB");
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
}

export function aiConfiguration(environment = process.env) {
  const baseUrl = (environment.CYHELM_AI_BASE_URL || "").replace(/\/$/, "");
  const model = environment.CYHELM_AI_MODEL || "";
  return { configured: Boolean(baseUrl && model), baseUrl, model, hasApiKey: Boolean(environment.CYHELM_AI_API_KEY) };
}

async function handleAi(request, response) {
  const config = aiConfiguration();
  if (!config.configured) return json(response, 503, { error: "AI is optional and not configured. Set CYHELM_AI_BASE_URL and CYHELM_AI_MODEL." });
  const body = await readBody(request);
  if (typeof body.prompt !== "string" || !body.prompt.trim()) return json(response, 400, { error: "A non-empty prompt is required." });
  const headers = { "content-type": "application/json" };
  if (process.env.CYHELM_AI_API_KEY) headers.authorization = `Bearer ${process.env.CYHELM_AI_API_KEY}`;
  const upstream = await fetch(`${config.baseUrl}/chat/completions`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model: config.model,
      temperature: 0.2,
      messages: [
        { role: "system", content: "You are a cautious GRC copilot. Provide concise suggestions, identify assumptions, never claim certification, and require human review." },
        { role: "user", content: body.prompt.slice(0, 20_000) }
      ]
    }),
    signal: AbortSignal.timeout(45_000)
  });
  const payload = await upstream.json().catch(() => ({}));
  if (!upstream.ok) return json(response, 502, { error: "The configured AI provider rejected the request.", providerStatus: upstream.status });
  const content = payload?.choices?.[0]?.message?.content;
  return json(response, 200, { content: typeof content === "string" ? content : "No text response was returned.", model: config.model });
}

async function handler(request, response) {
  try {
    const url = new URL(request.url, `http://${request.headers.host || "localhost"}`);
    if (url.pathname === "/api/health") return json(response, 200, { ok: true, project: project || "standalone", ai: aiConfiguration() });
    if (url.pathname === "/api/ai" && request.method === "POST") return await handleAi(request, response);
    const sharedAsset = url.pathname.startsWith("/shared/");
    const requested = url.pathname === "/" ? "index.html" : decodeURIComponent(url.pathname.slice(sharedAsset ? 8 : 1));
    const safe = normalize(requested).replace(/^(\.\.[/\\])+/, "");
    const assetRoot = sharedAsset ? join(root, "shared") : projectRoot;
    const file = join(assetRoot, safe);
    if (!file.startsWith(assetRoot)) return json(response, 403, { error: "Forbidden" });
    const info = await stat(file);
    if (!info.isFile()) throw new Error("Not a file");
    response.writeHead(200, { "content-type": types[extname(file)] || "application/octet-stream", "x-content-type-options": "nosniff" });
    response.end(await readFile(file));
  } catch (error) {
    if (error?.code === "ENOENT" || error?.message === "Not a file") return json(response, 404, { error: "Not found" });
    json(response, 500, { error: error?.name === "TimeoutError" ? "AI provider timed out." : "Request failed safely." });
  }
}

export function startServer() {
  return createServer(handler).listen(port, "127.0.0.1", () => console.log(`CyHelm ${project || "app"}: http://127.0.0.1:${port}`));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) startServer();
