import { Hono } from 'hono'
import { and, eq } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '../db/client.js'
import {
  comments as commentsT,
  likes as likesT,
  postImages as postImagesT,
  posts as postsT,
  saves as savesT,
} from '../db/schema.js'
import { requireAuth, type AppEnv } from '../lib/auth.js'
import { serializePosts, type CommentDTO } from '../lib/serialize.js'
import { saveUploadedImage } from '../lib/uploads.js'

export const postRoutes = new Hono<AppEnv>()

postRoutes.use('*', requireAuth)

/** Create a post from uploaded files and/or external image URLs (multipart). */
postRoutes.post('/', async (c) => {
  const viewerId = c.get('userId')
  const body = await c.req.parseBody({ all: true })

  const caption = typeof body.caption === 'string' ? body.caption : ''
  const location =
    typeof body.location === 'string' && body.location.trim()
      ? body.location.trim()
      : null

  // Files arrive under "images"; bare strings are treated as external URLs.
  const raw = body.images
  const entries = Array.isArray(raw) ? raw : raw !== undefined ? [raw] : []

  const urls: string[] = []
  for (const entry of entries) {
    if (entry instanceof File) {
      const url = await saveUploadedImage(entry)
      if (url) urls.push(url)
    } else if (typeof entry === 'string' && entry.trim()) {
      urls.push(entry.trim())
    }
  }

  if (urls.length === 0) {
    return c.json({ error: 'At least one image is required' }, 400)
  }

  const postId = crypto.randomUUID()
  const createdAt = Date.now()
  db.insert(postsT)
    .values({ id: postId, userId: viewerId, caption, location, createdAt })
    .run()
  db.insert(postImagesT)
    .values(
      urls.map((url, position) => ({
        id: crypto.randomUUID(),
        postId,
        url,
        position,
      })),
    )
    .run()

  const row = db.select().from(postsT).where(eq(postsT.id, postId)).get()!
  const [post] = await serializePosts([row], viewerId)
  return c.json({ post }, 201)
})

/** Toggle a like on a post. */
postRoutes.post('/:id/like', (c) => {
  const viewerId = c.get('userId')
  const postId = c.req.param('id')
  const post = db.select({ id: postsT.id }).from(postsT).where(eq(postsT.id, postId)).get()
  if (!post) return c.json({ error: 'Post not found' }, 404)

  const existing = db
    .select()
    .from(likesT)
    .where(and(eq(likesT.postId, postId), eq(likesT.userId, viewerId)))
    .get()

  if (existing) {
    db.delete(likesT)
      .where(and(eq(likesT.postId, postId), eq(likesT.userId, viewerId)))
      .run()
    return c.json({ liked: false })
  }
  db.insert(likesT).values({ postId, userId: viewerId, createdAt: Date.now() }).run()
  return c.json({ liked: true })
})

/** Toggle a save/bookmark on a post. */
postRoutes.post('/:id/save', (c) => {
  const viewerId = c.get('userId')
  const postId = c.req.param('id')
  const post = db.select({ id: postsT.id }).from(postsT).where(eq(postsT.id, postId)).get()
  if (!post) return c.json({ error: 'Post not found' }, 404)

  const existing = db
    .select()
    .from(savesT)
    .where(and(eq(savesT.postId, postId), eq(savesT.userId, viewerId)))
    .get()

  if (existing) {
    db.delete(savesT)
      .where(and(eq(savesT.postId, postId), eq(savesT.userId, viewerId)))
      .run()
    return c.json({ saved: false })
  }
  db.insert(savesT).values({ postId, userId: viewerId, createdAt: Date.now() }).run()
  return c.json({ saved: true })
})

const commentSchema = z.object({ text: z.string().trim().min(1).max(1000) })

/** Add a comment to a post. */
postRoutes.post('/:id/comments', async (c) => {
  const viewerId = c.get('userId')
  const postId = c.req.param('id')
  const post = db.select({ id: postsT.id }).from(postsT).where(eq(postsT.id, postId)).get()
  if (!post) return c.json({ error: 'Post not found' }, 404)

  const parsed = commentSchema.safeParse(await c.req.json().catch(() => null))
  if (!parsed.success) return c.json({ error: 'Comment cannot be empty' }, 400)

  const comment: CommentDTO = {
    id: crypto.randomUUID(),
    userId: viewerId,
    text: parsed.data.text,
    createdAt: Date.now(),
    likes: 0,
  }
  db.insert(commentsT)
    .values({
      id: comment.id,
      postId,
      userId: viewerId,
      text: comment.text,
      createdAt: comment.createdAt,
    })
    .run()

  return c.json({ comment }, 201)
})
