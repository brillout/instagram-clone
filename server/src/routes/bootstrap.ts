import { Hono } from 'hono'
import { desc, eq } from 'drizzle-orm'
import { db } from '../db/client.js'
import {
  follows as followsT,
  posts as postsT,
  stories as storiesT,
  storyViews as storyViewsT,
  users as usersT,
} from '../db/schema.js'
import { requireAuth, type AppEnv } from '../lib/auth.js'
import { serializePosts, serializeUsers } from '../lib/serialize.js'

export const bootstrapRoutes = new Hono<AppEnv>()

bootstrapRoutes.use('*', requireAuth)

bootstrapRoutes.get('/', async (c) => {
  const viewerId = c.get('userId')

  const userRows = db.select().from(usersT).all()
  const postRows = db.select().from(postsT).orderBy(desc(postsT.createdAt)).all()
  const storyRows = db.select().from(storiesT).orderBy(desc(storiesT.createdAt)).all()

  const followingRows = db
    .select({ followingId: followsT.followingId })
    .from(followsT)
    .where(eq(followsT.followerId, viewerId))
    .all()

  // Which stories the viewer has already seen (drives the "seen" ring).
  const viewerSeen = new Set(
    db
      .select({ storyId: storyViewsT.storyId })
      .from(storyViewsT)
      .where(eq(storyViewsT.userId, viewerId))
      .all()
      .map((r) => r.storyId),
  )

  const [users, posts] = await Promise.all([
    serializeUsers(userRows),
    serializePosts(postRows, viewerId),
  ])

  const stories = storyRows.map((s) => ({
    id: s.id,
    userId: s.userId,
    image: s.image,
    createdAt: s.createdAt,
    seen: viewerSeen.has(s.id),
  }))

  return c.json({
    users,
    posts,
    stories,
    following: followingRows.map((f) => f.followingId),
  })
})
