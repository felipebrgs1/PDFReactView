import type { Hono } from 'hono'

export function registerRoutes(app: Hono) {
  app.get('/', (c) => c.text('Hono up'))
  app.get('/health', (c) =>
    c.json({
      status: 'ok',
      port: Number(process.env.PORT ?? 3000),
      env: process.env.NODE_ENV ?? 'development',
    })
  )
}
