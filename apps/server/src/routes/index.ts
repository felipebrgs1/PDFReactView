import type { Hono } from 'hono'
import { cors } from 'hono/cors'
import { z } from 'zod'
import { db } from '../db/index.js'
import { eq } from 'drizzle-orm'
import { pdfFilesTable } from '../db/schema.js'

export function registerRoutes(app: Hono) {
  // CORS
  app.use('*', cors({ origin: '*', allowMethods: ['GET', 'POST', 'OPTIONS'] }))

  app.get('/', (c) => c.text('Hono up'))
  app.get('/health', (c) =>
    c.json({
      status: 'ok',
      port: Number(process.env.PORT ?? 3000),
      env: process.env.NODE_ENV ?? 'development',
    })
  )

  // Upload PDF via multipart/form-data
  app.post('/upload', async (c) => {
    const form = await c.req.parseBody()
    const file = form['file']

    if (!(file instanceof File)) {
      return c.json({ error: 'file is required' }, 400)
    }

    // Validate mime
    if (file.type !== 'application/pdf') {
      return c.json({ error: 'Only PDF files are allowed' }, 400)
    }

  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  const base64 = buffer.toString('base64')

    const insertedArr = await db
      .insert(pdfFilesTable)
  .values({ filename: file.name, mimeType: file.type, data: base64 })
      .returning({ id: pdfFilesTable.id, filename: pdfFilesTable.filename })

    const inserted = insertedArr[0]
    if (!inserted) return c.json({ error: 'Failed to save file' }, 500)

    return c.json(inserted)
  })

  // Get PDF by id (binary)
  app.get('/pdf/:id', async (c) => {
    const Params = z.object({ id: z.coerce.number().int().positive() })
    const { id } = Params.parse(c.req.param())

    const rows = await db
      .select()
      .from(pdfFilesTable)
      .where(eq(pdfFilesTable.id, id))
      .limit(1)

    const row = rows[0]
    if (!row) return c.json({ error: 'Not found' }, 404)

  const raw = Buffer.from(row.data, 'base64')
  // Build a safe Content-Disposition with ASCII fallback + RFC 5987 utf-8 filename*
  const originalName = row.filename ?? 'file.pdf'
  // Remove diacritics then strip/replace anything non-ASCII-safe for header value
  const asciiFallback = originalName
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\x20-\x7E]/g, '_') // keep visible ASCII only
    .replace(/["\\]/g, '') // drop quotes/backslashes to keep quoted-string safe
  const encodedUtf8 = encodeURIComponent(originalName)

  return new Response(raw, {
      headers: {
        'Content-Type': row.mimeType,
        // Example: inline; filename="fallback.pdf"; filename*=UTF-8''real%20ñame.pdf
        'Content-Disposition': `inline; filename="${asciiFallback}"; filename*=UTF-8''${encodedUtf8}`,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  })
}
