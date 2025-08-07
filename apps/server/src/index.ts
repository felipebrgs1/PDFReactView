import { Hono } from 'hono'
import postgres from 'postgres'
import { drizzle } from 'drizzle-orm/postgres-js'
import { pgTable, serial, varchar, text, timestamp } from 'drizzle-orm/pg-core'
import { eq } from 'drizzle-orm'
import { Buffer } from 'node:buffer'

// Initialize Postgres connection and Drizzle ORM
// Initialize Postgres connection from environment
const databaseUrl = process.env.DATABASE_URL || 'postgresql://dev:dev@postgres:5432/dev'
if (!databaseUrl) throw new Error('DATABASE_URL environment variable is required')
const sql = postgres(databaseUrl)
export const db = drizzle(sql)

// Define PDF table schema
export const pdfs = pgTable('pdfs', {
	id: serial('id').primaryKey(),
	name: varchar('name', { length: 255 }),
	mimeType: varchar('mime_type', { length: 255 }),
	data: text('data'),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

const app = new Hono()

// Upload PDF (expects JSON with base64-encoded data)
app.post('/pdf', async (c) => {
	const { name, mimeType, data } = await c.req.json()
	const [inserted] = await db.insert(pdfs).values({ name, mimeType, data }).returning()
	return c.json({ id: inserted.id })
})

// Get PDF by ID
app.get('/pdf/:id', async (c) => {
	const id = Number(c.req.param('id'))
	const pdf = await db.select().from(pdfs).where(eq(pdfs.id, id)).get()
	if (!pdf) return c.text('Not found', 404)
	const buffer = Buffer.from(pdf.data, 'base64')
	return c.body(buffer, 200, { 'Content-Type': pdf.mimeType })
})

// Root endpoint
app.get('/', (c) => c.text('Hono!'))

export default app