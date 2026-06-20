import type { Context, MiddlewareHandler } from 'hono'
import { deleteCookie, getCookie, setCookie } from 'hono/cookie'
import { sign, verify } from 'hono/jwt'
import bcrypt from 'bcryptjs'

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-insecure-secret-change-me'
const COOKIE_NAME = 'ig_token'
const MAX_AGE = 60 * 60 * 24 * 7 // 7 days

export type AppEnv = { Variables: { userId: string } }

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export async function issueSession(c: Context, userId: string) {
  const exp = Math.floor(Date.now() / 1000) + MAX_AGE
  const token = await sign({ sub: userId, exp }, JWT_SECRET, 'HS256')
  setCookie(c, COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'Lax',
    path: '/',
    maxAge: MAX_AGE,
  })
}

export function clearSession(c: Context) {
  deleteCookie(c, COOKIE_NAME, { path: '/' })
}

/** Read & verify the session cookie, returning the user id or null. */
export async function getSessionUserId(c: Context): Promise<string | null> {
  const token = getCookie(c, COOKIE_NAME)
  if (!token) return null
  try {
    const payload = await verify(token, JWT_SECRET, 'HS256')
    return typeof payload.sub === 'string' ? payload.sub : null
  } catch {
    return null
  }
}

/** Middleware that rejects unauthenticated requests with 401. */
export const requireAuth: MiddlewareHandler<AppEnv> = async (c, next) => {
  const userId = await getSessionUserId(c)
  if (!userId) return c.json({ error: 'Not authenticated' }, 401)
  c.set('userId', userId)
  await next()
}
