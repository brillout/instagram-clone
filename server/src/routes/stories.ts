import { Hono } from 'hono'
import { and, eq } from 'drizzle-orm'
import { db } from '../db/client.js'
import { stories as storiesT, storyViews as storyViewsT } from '../db/schema.js'
import { requireAuth, type AppEnv } from '../lib/auth.js'

export const storyRoutes = new Hono<AppEnv>()

storyRoutes.use('*', requireAuth)

/** Mark a story as seen by the current viewer (idempotent). */
storyRoutes.post('/:id/seen', (c) => {
  const viewerId = c.get('userId')
  const storyId = c.req.param('id')

  const story = db.select({ id: storiesT.id }).from(storiesT).where(eq(storiesT.id, storyId)).get()
  if (!story) return c.json({ error: 'Story not found' }, 404)

  const existing = db
    .select()
    .from(storyViewsT)
    .where(and(eq(storyViewsT.storyId, storyId), eq(storyViewsT.userId, viewerId)))
    .get()
  if (!existing) {
    db.insert(storyViewsT).values({ storyId, userId: viewerId }).run()
  }
  return c.json({ ok: true })
})
