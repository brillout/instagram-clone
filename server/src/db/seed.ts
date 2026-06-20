import { fileURLToPath } from 'node:url'
import path from 'node:path'
import bcrypt from 'bcryptjs'
import { db, runMigrations } from './client.js'
import {
  comments as commentsT,
  follows as followsT,
  likes as likesT,
  postImages as postImagesT,
  posts as postsT,
  saves as savesT,
  stories as storiesT,
  users as usersT,
} from './schema.js'

export const DEMO_PASSWORD = 'password123'

const avatar = (n: number) => `https://i.pravatar.cc/150?img=${n}`
const photo = (seed: string, size = 640) =>
  `https://picsum.photos/seed/${seed}/${size}/${size}`

const now = Date.now()
const minutes = (n: number) => now - n * 60 * 1000
const hours = (n: number) => now - n * 60 * 60 * 1000
const days = (n: number) => now - n * 24 * 60 * 60 * 1000

interface SeedUser {
  id: string
  username: string
  fullName: string
  avatar: string
  bio?: string
  verified?: boolean
  followersBase: number
  followingBase: number
}

const users: SeedUser[] = [
  {
    id: 'u_you',
    username: 'you',
    fullName: 'Your Name',
    avatar: avatar(12),
    bio: '📷 Just here for the photos\n🌍 Exploring the world one shot at a time',
    followersBase: 348,
    followingBase: 295,
  },
  {
    id: 'u_maya',
    username: 'maya.travels',
    fullName: 'Maya Anderson',
    avatar: avatar(5),
    bio: '✈️ Travel & landscape photography\n📍 Currently: Lisbon',
    verified: true,
    followersBase: 128400,
    followingBase: 412,
  },
  {
    id: 'u_leo',
    username: 'leo.cooks',
    fullName: 'Leo Marchetti',
    avatar: avatar(13),
    bio: '🍝 Homemade pasta and good wine',
    followersBase: 54200,
    followingBase: 318,
  },
  {
    id: 'u_aria',
    username: 'aria.design',
    fullName: 'Aria Kim',
    avatar: avatar(9),
    bio: '🎨 Product designer\n✏️ Sketches, type & color',
    verified: true,
    followersBase: 87600,
    followingBase: 540,
  },
  {
    id: 'u_noah',
    username: 'noah.outdoors',
    fullName: 'Noah Bennett',
    avatar: avatar(33),
    bio: '🏔️ Mountains > everything\n🥾 Trail runner',
    followersBase: 23100,
    followingBase: 187,
  },
  {
    id: 'u_zoe',
    username: 'zoe.snaps',
    fullName: 'Zoe Carter',
    avatar: avatar(45),
    bio: '🐶 Dog mom · ☕ coffee addict',
    followersBase: 9800,
    followingBase: 654,
  },
  {
    id: 'u_kai',
    username: 'kai.studio',
    fullName: 'Kai Nakamura',
    avatar: avatar(52),
    bio: '🏙️ Street & architecture',
    followersBase: 41200,
    followingBase: 290,
  },
  {
    id: 'u_ines',
    username: 'ines.blooms',
    fullName: 'Inês Costa',
    avatar: avatar(20),
    bio: '🌸 Florist · plant lady',
    followersBase: 16700,
    followingBase: 401,
  },
]

interface SeedPost {
  id: string
  userId: string
  images: string[]
  caption: string
  location?: string
  createdAt: number
  likedBy: string[]
  savedBy: string[]
  comments: { id: string; userId: string; text: string; createdAt: number }[]
}

const posts: SeedPost[] = [
  {
    id: 'p1',
    userId: 'u_maya',
    images: [photo('lisbon-tram'), photo('lisbon-roofs'), photo('lisbon-river')],
    caption:
      'Golden hour over the rooftops of Alfama 🌅 Lisbon never fails to surprise me. Swipe to see the river view →',
    location: 'Lisbon, Portugal',
    createdAt: hours(2),
    likedBy: ['u_leo', 'u_aria', 'u_noah', 'u_zoe', 'u_kai'],
    savedBy: [],
    comments: [
      { id: 'c1', userId: 'u_zoe', text: 'This is unreal 😍', createdAt: hours(1) },
      { id: 'c2', userId: 'u_kai', text: 'The light here is perfect', createdAt: minutes(40) },
    ],
  },
  {
    id: 'p2',
    userId: 'u_leo',
    images: [photo('fresh-pasta')],
    caption: 'Sunday means fresh tagliatelle 🍝 Recipe in my bio. Who is hungry?',
    location: 'Bologna, Italy',
    createdAt: hours(5),
    likedBy: ['u_maya', 'u_ines', 'u_you'],
    savedBy: ['u_you'],
    comments: [{ id: 'c3', userId: 'u_ines', text: 'Save me a plate! 🤤', createdAt: hours(4) }],
  },
  {
    id: 'p3',
    userId: 'u_noah',
    images: [photo('alpine-lake'), photo('mountain-trail')],
    caption: 'Sunrise at 2,400m. Worth every step of the 4am start ⛰️🥾',
    location: 'Dolomites',
    createdAt: hours(9),
    likedBy: ['u_maya', 'u_kai', 'u_you', 'u_aria', 'u_leo', 'u_zoe'],
    savedBy: [],
    comments: [
      { id: 'c4', userId: 'u_aria', text: 'Those colors though', createdAt: hours(8) },
      { id: 'c5', userId: 'u_maya', text: 'Adding this to my list immediately', createdAt: hours(7) },
    ],
  },
  {
    id: 'p4',
    userId: 'u_aria',
    images: [photo('type-poster')],
    caption: 'Playing with grids and warm neutrals today. Type is a kind of music 🎵',
    createdAt: days(1),
    likedBy: ['u_kai', 'u_ines'],
    savedBy: ['u_you'],
    comments: [],
  },
  {
    id: 'p5',
    userId: 'u_zoe',
    images: [photo('happy-dog')],
    caption: 'He found the only sunny spot in the house ☀️🐶 #goldenhour #literally',
    createdAt: days(1),
    likedBy: ['u_maya', 'u_leo', 'u_noah', 'u_you', 'u_ines'],
    savedBy: [],
    comments: [{ id: 'c6', userId: 'u_leo', text: 'Best boy 🥹', createdAt: hours(20) }],
  },
  {
    id: 'p6',
    userId: 'u_kai',
    images: [photo('city-lines'), photo('glass-facade')],
    caption: 'Reflections and hard lines in the financial district. Shot on a grey morning.',
    location: 'Tokyo, Japan',
    createdAt: days(2),
    likedBy: ['u_aria', 'u_maya', 'u_noah'],
    savedBy: [],
    comments: [{ id: 'c7', userId: 'u_aria', text: 'Composition is so clean 👏', createdAt: days(2) }],
  },
  {
    id: 'p7',
    userId: 'u_ines',
    images: [photo('spring-blooms')],
    caption: 'This week’s arrangement: ranunculus, tulips and a little eucalyptus 🌷',
    createdAt: days(3),
    likedBy: ['u_zoe', 'u_aria', 'u_you'],
    savedBy: [],
    comments: [],
  },
]

const stories = [
  { id: 's1', userId: 'u_maya', image: photo('story-maya', 480), createdAt: hours(3) },
  { id: 's2', userId: 'u_leo', image: photo('story-leo', 480), createdAt: hours(4) },
  { id: 's3', userId: 'u_aria', image: photo('story-aria', 480), createdAt: hours(6) },
  { id: 's4', userId: 'u_noah', image: photo('story-noah', 480), createdAt: hours(7) },
  { id: 's5', userId: 'u_zoe', image: photo('story-zoe', 480), createdAt: hours(8) },
  { id: 's6', userId: 'u_kai', image: photo('story-kai', 480), createdAt: hours(10) },
  { id: 's7', userId: 'u_ines', image: photo('story-ines', 480), createdAt: hours(12) },
]

/** The "you" account follows these seed accounts initially. */
const initialFollowing = ['u_maya', 'u_leo', 'u_noah', 'u_zoe']

/** Seed the database with demo content — only if it is currently empty. */
export function seedDatabase() {
  const existing = db.select({ id: usersT.id }).from(usersT).limit(1).get()
  if (existing) return

  const passwordHash = bcrypt.hashSync(DEMO_PASSWORD, 10)

  db.transaction((tx) => {
    tx.insert(usersT)
      .values(
        users.map((u) => ({
          id: u.id,
          username: u.username,
          fullName: u.fullName,
          passwordHash,
          avatar: u.avatar,
          bio: u.bio ?? null,
          verified: u.verified ?? false,
          followersBase: u.followersBase,
          followingBase: u.followingBase,
          createdAt: now,
        })),
      )
      .run()

    for (const p of posts) {
      tx.insert(postsT)
        .values({
          id: p.id,
          userId: p.userId,
          caption: p.caption,
          location: p.location ?? null,
          createdAt: p.createdAt,
        })
        .run()
      tx.insert(postImagesT)
        .values(
          p.images.map((url, position) => ({
            id: `${p.id}_img${position}`,
            postId: p.id,
            url,
            position,
          })),
        )
        .run()
      if (p.comments.length) {
        tx.insert(commentsT)
          .values(
            p.comments.map((cm) => ({
              id: cm.id,
              postId: p.id,
              userId: cm.userId,
              text: cm.text,
              createdAt: cm.createdAt,
            })),
          )
          .run()
      }
      if (p.likedBy.length) {
        tx.insert(likesT)
          .values(p.likedBy.map((userId) => ({ postId: p.id, userId, createdAt: p.createdAt })))
          .run()
      }
      if (p.savedBy.length) {
        tx.insert(savesT)
          .values(p.savedBy.map((userId) => ({ postId: p.id, userId, createdAt: p.createdAt })))
          .run()
      }
    }

    tx.insert(followsT)
      .values(
        initialFollowing.map((followingId) => ({
          followerId: 'u_you',
          followingId,
          createdAt: now,
        })),
      )
      .run()

    tx.insert(storiesT)
      .values(stories.map((s) => ({ id: s.id, userId: s.userId, image: s.image, createdAt: s.createdAt })))
      .run()
  })

  console.log(`🌱 Seeded ${users.length} users, ${posts.length} posts, ${stories.length} stories`)
}

const invokedDirectly =
  process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])
if (invokedDirectly) {
  runMigrations()
  seedDatabase()
}
