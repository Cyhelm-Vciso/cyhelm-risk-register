# CyHelm Risk Ledger

A board-oriented cyber-risk register demonstrating inherent/residual scoring, ownership, treatment tracking, risk appetite, a heat map, JSON export, and an optional AI board brief.

Run `npm start`, then open `http://127.0.0.1:4173`. Core scoring is deterministic and credential-free.

Configure optional AI with `CYHELM_AI_BASE_URL`, `CYHELM_AI_MODEL`, and—only for providers that require it—`CYHELM_AI_API_KEY`. Any OpenAI-compatible hosted provider, Ollama, or LM Studio can be used.

Scores and financial exposure in the demo are synthetic and do not represent actuarial predictions.
