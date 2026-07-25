# CyHelm AI Risk Register

An explainable cyber-risk assessment API for vCISO workflows. Despite the product name, the MVP uses transparent arithmetic—not opaque AI—to score inherent and residual risk and summarize a portfolio.

## MVP

- Validated 5×5 likelihood/impact inputs
- Explicit control-effectiveness adjustment
- Risk rating and suggested treatment
- Executive portfolio summary

```bash
docker compose up --build
curl -X POST http://localhost:8000/v1/risks/assess \
  -H "Content-Type: application/json" \
  -d '{"title":"Cloud administrator compromise","scenario":"A privileged cloud identity is compromised through phishing.","likelihood":5,"impact":5,"control_effectiveness":20,"owner":"CIO"}'
```

## Governance

Scores are decision support. Record scoring criteria, evidence, owner challenge, approval, review date and treatment cost before production use. AI may later suggest scenarios or controls, but it must never approve risk acceptance or overwrite accountable-owner decisions.

Future work: persistent registers, audit history, treatment plans, KRI trends, CSV import/export, board dashboards and optional private AI assistance.

