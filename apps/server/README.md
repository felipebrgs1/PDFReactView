# Server

Local dev:

```bash
bun install
bun run dev
```

With Docker Compose:

```bash
cp .env.example .env
bun run compose:build
bun run compose
```

Environment:

- PORT (default 3000)
- DATABASE_URL (points to postgres service by default)

Multi-stage Dockerfile supports dev and prod targets.
