import { Hono } from 'hono'
import { registerRoutes } from './routes/index.js'

const app = new Hono()

registerRoutes(app)

// Start server only when executed directly
const port = Number(process.env.PORT ?? 3000)
if (import.meta.main) {
	Bun.serve({
		port,
		fetch: app.fetch,
	})
	// eslint-disable-next-line no-console
	console.log(`Server running at http://localhost:${port}`)
}

export default app