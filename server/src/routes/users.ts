import { Hono } from 'hono'
import { and, eq } from 'drizzle-orm'
import { db } from '../db/client.js'
import { follows as followsT, users as usersT } from '../db/schema.js'
import { requireAuth, type AppEnv } from '../lib/auth.js'

export const userRoutes = new Hono<AppEnv>()

userRoutes.use('*', requireAuth)

/** Toggle following another user. */
userRoutes.post('/:id/follow', (c) => {
  const viewerId = c.get('userId')
  const targetId = c.req.param('id')

  if (targetId === viewerId) {
    return c.json({ error: "You can't follow yourself" }, 400)
  }
  const target = db.select({ id: usersT.id }).from(usersT).where(eq(usersT.id, targetId)).get()
  if (!target) return c.json({ error: 'User not found' }, 404)

  const existing = db
    .select()
    .from(followsT)
    .where(and(eq(followsT.followerId, viewerId), eq(followsT.followingId, targetId)))
    .get()

  if (existing) {
    db.delete(followsT)
      .where(and(eq(followsT.followerId, viewerId), eq(followsT.followingId, targetId)))
      .run()
    return c.json({ following: false })
  }
  db.insert(followsT)
    .values({ followerId: viewerId, followingId: targetId, createdAt: Date.now() })
    .run()
  return c.json({ following: true })
})
