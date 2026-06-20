import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { runMigrations } from './db/client.js'
import { seedDatabase } from './db/seed.js'
import { authRoutes } from './routes/auth.js'
import { bootstrapRoutes } from './routes/bootstrap.js'
import { postRoutes } from './routes/posts.js'
import { storyRoutes } from './routes/stories.js'
import { userRoutes } from './routes/users.js'

runMigrations()
seedDatabase()

const app = new Hono()

// Allow the Vite dev origin to call the API directly with cookies (in the
// normal setup Vite proxies /api, so requests are same-origin and this is a
// no-op).
app.use(
  '/api/*',
  cors({
    origin: (origin) => (origin?.startsWith('http://localhost') ? origin : ''),
    credentials: true,
  }),
)

app.get('/api/health', (c) => c.json({ ok: true }))

// Serve uploaded images from the on-disk uploads directory.
app.use(
  '/api/uploads/*',
  serveStatic({
    root: './',
    rewriteRequestPath: (path) => path.replace(/^\/api/, ''),
  }),
)

app.route('/api/auth', authRoutes)
app.route('/api/bootstrap', bootstrapRoutes)
app.route('/api/posts', postRoutes)
app.route('/api/users', userRoutes)
app.route('/api/stories', storyRoutes)

const port = Number(process.env.PORT ?? 3001)
serve({ fetch: app.fetch, port }, (info) => {
  console.log(`🚀 API listening on http://localhost:${info.port}`)
})
