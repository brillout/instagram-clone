# Instagram Clone

A polished, responsive **Instagram clone** built with React, TypeScript and Vite.
It recreates the core Instagram experience — a photo feed, stories, profiles,
explore, search, and post creation — as a fully client-side single-page app.
All interactions (likes, comments, saves, follows, new posts) persist to
`localStorage`, so the app feels real without needing a backend.

## Features

- **📰 Home feed** — posts with multi-image carousels, captions, likes,
  comments and timestamps.
- **❤️ Likes** — like/unlike with an animated heart, plus **double-tap the
  photo** to like (with the signature heart burst).
- **💬 Comments** — read all comments in the post detail view and add your own
  inline or from the modal.
- **🔖 Save & 👤 Follow** — bookmark posts to your *Saved* tab and follow/unfollow
  suggested accounts.
- **🟣 Stories** — a stories tray with gradient rings and a full-screen story
  viewer that auto-advances with a progress bar and keyboard navigation.
- **🧭 Explore** — a discovery grid with a masonry-style layout and hover stats.
- **👤 Profiles** — avatar, bio, post/follower/following stats, verified badges,
  and Posts / Saved / Tagged tabs with a post grid.
- **➕ Create post** — drag-and-drop or pick an image (downscaled client-side to
  a data URL so your posts survive a page reload), add a caption and location.
- **🔍 Search** — a slide-in search panel with live username/name filtering.
- **🌗 Light & dark mode** — theme toggle that respects your system preference
  and is remembered across visits.
- **📱 Fully responsive** — a desktop sidebar layout that adapts down to a mobile
  layout with a top bar and bottom tab bar.

## Tech stack

| Concern         | Choice                                      |
| --------------- | ------------------------------------------- |
| Framework       | [React 18](https://react.dev)               |
| Language        | [TypeScript](https://www.typescriptlang.org) (strict) |
| Build tool      | [Vite 5](https://vite.dev)                  |
| Routing         | [React Router 6](https://reactrouter.com)   |
| Icons           | [lucide-react](https://lucide.dev)          |
| State           | React Context + `localStorage` persistence  |
| Styling         | Hand-written CSS with design tokens (CSS variables) |

No backend, no database, no API keys — everything runs in the browser.

## Getting started

```bash
# install dependencies
npm install

# start the dev server (http://localhost:5173)
npm run dev

# type-check and build for production
npm run build

# preview the production build
npm run preview
```

## Project structure

```
src/
├── main.tsx              # App entry: Router + providers
├── App.tsx              # Layout shell, routes and modal mounting
├── index.css           # Design tokens + all component styles
├── types.ts            # Shared domain types (User, Post, Story, …)
├── data/seed.ts        # Seed users, posts and stories
├── context/
│   ├── AppContext.tsx  # Domain state + actions, persisted to localStorage
│   └── UIContext.tsx   # Transient UI state (modals, toasts)
├── hooks/useTheme.ts   # Light/dark theme with system + storage awareness
├── utils/
│   ├── time.ts         # Relative time + count formatting helpers
│   └── image.ts        # Client-side image downscaling for uploads
├── pages/
│   ├── Home.tsx        # Stories + feed + suggestions
│   ├── Explore.tsx     # Discovery grid
│   └── Profile.tsx     # Profile header + tabbed post grid
└── components/         # Sidebar, Post, Stories, modals, etc.
```

## Data & persistence

- The app ships with seed data (`src/data/seed.ts`) for 8 users, their posts and
  stories.
- Your changes (likes, saves, comments, follows, new posts) are stored under the
  `instagram-clone:v1` key in `localStorage`. Clear that key (or your site data)
  to reset back to the seed state.
- Demo avatars come from [pravatar.cc](https://pravatar.cc) and demo photos from
  [picsum.photos](https://picsum.photos); both are loaded client-side. Photos you
  upload yourself are downscaled and embedded as data URLs so they persist
  locally.

## Notes

This project is an educational UI clone built for demonstration purposes and is
not affiliated with Instagram or Meta. Instagram is a trademark of Meta
Platforms, Inc.
