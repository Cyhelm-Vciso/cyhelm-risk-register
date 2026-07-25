# Security policy

Use GitHub private vulnerability reporting for suspected vulnerabilities. Do not open public issues containing secrets, personal data, tenant identifiers, or exploitable details.

The demonstration applications bind to 127.0.0.1, keep AI credentials server-side, limit prompt size, and retain no AI conversation history. Before production use, add authentication, authorization, tenant isolation, rate limits, durable audit storage, TLS, secret management, and connector-specific threat models.

Synthetic fixtures are not production evidence.
