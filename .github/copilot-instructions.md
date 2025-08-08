## PDFReactView — AI agent working notes

Be productive fast in this monorepo. Follow the existing patterns and commands below.

### Big picture

- Monorepo managed by Turborepo (root scripts), package manager is Bun. Apps live in `apps/*`, shared packages in `packages/*`.
- Server: Bun + Hono + Drizzle ORM + Postgres (`apps/server`). Stores uploaded PDFs as base64 text in Postgres for simplicity/compatibility.
- Web: React 19 + Vite + react-pdf (`apps/web`). Uploads a PDF to the server, then renders the stored copy via its `/pdf/:id` URL.

### Data flow and API contract

- Upload: `POST /upload` (multipart/form-data, field `file` must be a PDF). Returns `{ id: number, filename: string }`.
- Fetch PDF: `GET /pdf/:id` streams binary with headers: `Content-Type`, `Content-Disposition: inline`, cache forever.
- Health: `GET /health` for status.
- Code refs: routes in `apps/server/src/routes/index.ts`, DB schema in `apps/server/src/db/schema.ts` (`pdfFilesTable`).

### Dev and build workflows

- Install at root: `bun install` (uses workspace-aware lockfile).
- Run both apps locally: `bun run dev` (Turbo runs `apps/server` and `apps/web` dev scripts).
    - Server dev uses Docker Compose (Postgres + Bun): see `apps/server/docker-compose.yml`. Host port defaults to `3001` mapping container `3000`.
    - Web dev runs Vite on `5173`.
- Lint/types: `bun run lint`, `bun run check-types` at root.
- Server standalone: `bun --cwd apps/server run compose` (or `compose:build`). Non-Compose start: `bun --cwd apps/server run start` (needs `DATABASE_URL`).
- DB tooling: from `apps/server`, run `bunx drizzle-kit studio` with `POSTGRES_*` set (or `DATABASE_URL`) to inspect tables.

### Environment and config

- Server runtime connects via `DATABASE_URL` (used in `apps/server/src/db/index.ts`). Example: `postgres://dev:dev@localhost:5432/dev`.
- Drizzle CLI uses discrete `POSTGRES_*` vars (see `apps/server/drizzle.config.ts`): `POSTGRES_HOST`, `POSTGRES_PORT`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`.
- Web uses `VITE_API_BASE_URL` (default fallback is `http://localhost:3000` in code). When using Docker Compose, set it to `http://localhost:3001` to match the port mapping.

### Server patterns to follow

- Hono app is composed via `registerRoutes(app)` in `apps/server/src/index.ts`; add endpoints inside `apps/server/src/routes/index.ts`.
- Use `zod` for request validation (see `Params` in `/pdf/:id`).
- DB access via Drizzle (node-postgres) using the exported `db`. Avoid binary buffers in DB—convert to/from base64 text like the upload and fetch handlers do.
- CORS is enabled globally with `hono/cors` for `GET, POST, OPTIONS`.

### Web patterns to follow

- Main UI in `apps/web/src/page.tsx`; file uploads via `FileUploader` component and then uses server-returned id to view the canonical stored PDF.
- react-pdf setup: sets `pdfjs.GlobalWorkerOptions.workerSrc` and copies `cmaps`, `standard_fonts`, and `wasm` via `vite-plugin-static-copy` (see `vite.config.ts`). Keep these paths intact for production builds.
- Use `import.meta.env.VITE_API_BASE_URL` when calling the server.

### Examples (copy the style)

- New route: `app.get('/foo', (c) => c.json({ ok: true }))` inside `registerRoutes`.
- Frontend fetch: `const api = import.meta.env.VITE_API_BASE_URL; await fetch(
  `${api}/upload`, { method: 'POST', body: formData }
)`.

### Gotchas

- Port mismatch: Compose maps `3001 -> 3000`; set `VITE_API_BASE_URL` accordingly in web `.env`.
- ESM modules: server uses `type: module`; imports in TS use `.js` extensions (e.g., `./routes/index.js`) to run under Bun—preserve this pattern.
- Large PDFs: DB stores base64 text; avoid very large files to keep memory/latency reasonable.
