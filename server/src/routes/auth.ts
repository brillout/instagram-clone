import { Hono } from 'hono'
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '../db/client.js'
import { users as usersT } from '../db/schema.js'
import {
  clearSession,
  getSessionUserId,
  hashPassword,
  issueSession,
  verifyPassword,
} from '../lib/auth.js'
import { serializeUser } from '../lib/serialize.js'

const signupSchema = z.object({
  username: z
    .string()
    .trim()
    .regex(/^[a-zA-Z0-9._]{3,20}$/, 'Username must be 3-20 letters, numbers, . or _'),
  fullName: z.string().trim().min(1, 'Full name is required').max(60),
  password: z.string().min(6, 'Password must be at least 6 characters').max(200),
})

const loginSchema = z.object({
  username: z.string().trim().min(1),
  password: z.string().min(1),
})

export const authRoutes = new Hono()

authRoutes.post('/signup', async (c) => {
  const body = await c.req.json().catch(() => null)
  const parsed = signupSchema.safeParse(body)
  if (!parsed.success) {
    return c.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, 400)
  }
  const { username, fullName, password } = parsed.data

  const existing = db
    .select({ id: usersT.id })
    .from(usersT)
    .where(eq(usersT.username, username.toLowerCase()))
    .get()
  if (existing) return c.json({ error: 'That username is already taken' }, 409)

  const id = crypto.randomUUID()
  const passwordHash = await hashPassword(password)
  const row = {
    id,
    username: username.toLowerCase(),
    fullName,
    passwordHash,
    avatar: `https://i.pravatar.cc/150?u=${encodeURIComponent(username.toLowerCase())}`,
    bio: null,
    verified: false,
    followersBase: 0,
    followingBase: 0,
    createdAt: Date.now(),
  }
  db.insert(usersT).values(row).run()

  await issueSession(c, id)
  return c.json({ user: await serializeUser(row) }, 201)
})

authRoutes.post('/login', async (c) => {
  const body = await c.req.json().catch(() => null)
  const parsed = loginSchema.safeParse(body)
  if (!parsed.success) return c.json({ error: 'Invalid input' }, 400)
  const { username, password } = parsed.data

  const user = db
    .select()
    .from(usersT)
    .where(eq(usersT.username, username.toLowerCase()))
    .get()
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return c.json({ error: 'Incorrect username or password' }, 401)
  }

  await issueSession(c, user.id)
  return c.json({ user: await serializeUser(user) })
})

authRoutes.post('/logout', (c) => {
  clearSession(c)
  return c.json({ ok: true })
})

authRoutes.get('/me', async (c) => {
  const userId = await getSessionUserId(c)
  if (!userId) return c.json({ user: null })
  const user = db.select().from(usersT).where(eq(usersT.id, userId)).get()
  if (!user) {
    clearSession(c)
    return c.json({ user: null })
  }
  return c.json({ user: await serializeUser(user) })
})
