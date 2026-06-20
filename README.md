# Instagram Clone

A polished, **full-stack Instagram clone**. A React + TypeScript single-page
app talks to a Hono + Drizzle + SQLite REST API with real multi-user
authentication. Sign up or log in, then browse a feed, post photos, like,
comment, save, follow, and watch stories — all persisted server-side in a
SQLite database.

## Features

### App
- **🔐 Authentication** — sign up, log in and log out with hashed passwords
  (bcrypt) and JWT sessions stored in an httpOnly cookie.
- **📰 Home feed** — posts with multi-image carousels, captions, likes,
  comments and timestamps.
- **❤️ Likes** — like/unlike with an animated heart, plus **double-tap the
  photo** to like.
- **💬 Comments** — read all comments in the post detail view and add your own.
- **🔖 Save & 👤 Follow** — bookmark posts to your *Saved* tab and follow/unfollow
  other accounts (follower counts update live).
- **🟣 Stories** — a stories tray with gradient rings and a full-screen story
  viewer that auto-advances; “seen” state persists per user.
- **🧭 Explore** & **👤 Profiles** — a discovery grid and per-user profiles with
  Posts / Saved / Tagged tabs.
- **➕ Create post** — drag-and-drop or pick images; they’re uploaded to the
  server and served back. A “sample photo” option works with no file.
- **🔍 Search**, **🌗 light/dark mode**, and a **fully responsive** layout
  (desktop sidebar → mobile top + bottom bars).

### Backend
- REST API with cookie-based auth, optimistic-friendly toggle endpoints, and
  multipart image uploads saved to disk.
- A typed **Drizzle ORM** schema with proper relations (users, posts, images,
  comments, likes, saves, follows, stories, story views) and SQL migrations.
- Auto-seeds a demo dataset (8 users, 7 posts, 7 stories) on first run.

## Tech stack

| Layer    | Choice                                                        |
| -------- | ------------------------------------------------------------- |
| Frontend | [React 18](https://react.dev), [TypeScript](https://www.typescriptlang.org), [Vite 5](https://vite.dev), [React Router 6](https://reactrouter.com), [lucide-react](https://lucide.dev) |
| Backend  | [Hono](https://hono.dev), [Drizzle ORM](https://orm.drizzle.team), [better-sqlite3](https://github.com/WiseLibs/better-sqlite3), [bcryptjs](https://github.com/dcodeIO/bcrypt.js), [Zod](https://zod.dev) |
| Auth     | JWT (HS256) in an httpOnly cookie                             |
| Database | SQLite (file-based, zero external services)                  |

## Getting started

```bash
# 1. install dependencies for both the web app and the server
npm run setup        # = npm install && npm --prefix server install

# 2. run the API (port 3001) and the Vite dev server (port 5173) together
npm run dev
```

Then open **http://localhost:5173**. The Vite dev server proxies `/api` to the
backend, so everything is same-origin and session cookies just work.

You can also run the two sides separately:

```bash
npm run dev:api      # Hono API on http://localhost:3001
npm run dev:web      # Vite dev server on http://localhost:5173
```

### Demo accounts

The database is seeded with demo users — all with the password
**`password123`**. Log in as any of them, or click **“Use a demo account”** on
the login screen:

| Username        | Notes              |
| --------------- | ------------------ |
| `you`           | the “main” account |
| `maya.travels`  | verified, traveler |
| `leo.cooks`     | food               |
| `aria.design`   | verified, design   |
| `noah.outdoors` · `zoe.snaps` · `kai.studio` · `ines.blooms` | more creators |

Or **sign up** for a brand-new account.

## API overview

All routes are under `/api`. Authenticated routes require the session cookie set
by login/signup.

| Method | Route                       | Description                          |
| ------ | --------------------------- | ------------------------------------ |
| POST   | `/auth/signup`              | Create an account & start a session  |
| POST   | `/auth/login`               | Log in                               |
| POST   | `/auth/logout`              | Log out                              |
| GET    | `/auth/me`                  | Current user (or `null`)             |
| GET    | `/bootstrap`                | Users, posts, stories & following    |
| POST   | `/posts`                    | Create a post (multipart upload)     |
| POST   | `/posts/:id/like`           | Toggle like                          |
| POST   | `/posts/:id/save`           | Toggle save                          |
| POST   | `/posts/:id/comments`       | Add a comment                        |
| POST   | `/users/:id/follow`         | Toggle follow                        |
| POST   | `/stories/:id/seen`         | Mark a story seen                    |

## Project structure

```
.
├── index.html, vite.config.ts      # web app (Vite) — proxies /api → :3001
├── src/
│   ├── api/client.ts               # fetch wrapper (credentials: include)
│   ├── context/
│   │   ├── AuthContext.tsx         # session: login / signup / logout / me
│   │   ├── AppContext.tsx          # API-backed data + optimistic mutations
│   │   └── UIContext.tsx           # modals, story viewer, toasts
│   ├── pages/                      # Auth, Home, Explore, Profile
│   └── components/                 # Sidebar, Post, Stories, modals, …
└── server/                         # Hono + Drizzle + SQLite API
    ├── drizzle/                    # generated SQL migrations
    └── src/
        ├── index.ts                # app entry: migrate, seed, serve
        ├── db/{schema,client,seed}.ts
        ├── lib/{auth,serialize,uploads}.ts
        └── routes/{auth,bootstrap,posts,users,stories}.ts
```

## Database & persistence

- The SQLite file lives at `server/data.db` (git-ignored). Migrations in
  `server/drizzle/` are applied automatically on startup, and the demo data is
  seeded only when the database is empty.
- To reset: stop the server, delete `server/data.db*`, and restart — it will
  re-create and re-seed.
- Regenerate migrations after changing the schema with
  `npm --prefix server run db:generate`.
- Uploaded images are written to `server/uploads/` and served from
  `/api/uploads/...`. Demo avatars/photos use [pravatar.cc](https://pravatar.cc)
  and [picsum.photos](https://picsum.photos), loaded client-side.

## Notes

This project is an educational clone built for demonstration purposes and is not
affiliated with Instagram or Meta. Instagram is a trademark of Meta Platforms,
Inc. The default `JWT_SECRET` is for local development only — set a real one
(see `server/.env.example`) before deploying anywhere.
