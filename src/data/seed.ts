import type { Post, Story, User } from '../types'

/**
 * Avatars use pravatar.cc (deterministic faces) and post images use
 * picsum.photos seeded URLs — both are stable client-side placeholder
 * services, so the demo looks real without bundling binary assets.
 */
const avatar = (n: number) => `https://i.pravatar.cc/150?img=${n}`
const photo = (seed: string, size = 640) =>
  `https://picsum.photos/seed/${seed}/${size}/${size}`

export const CURRENT_USER_ID = 'u_you'

export const users: User[] = [
  {
    id: CURRENT_USER_ID,
    username: 'you',
    fullName: 'Your Name',
    avatar: avatar(12),
    bio: '📷 Just here for the photos\n🌍 Exploring the world one shot at a time',
    followers: 348,
    following: 295,
  },
  {
    id: 'u_maya',
    username: 'maya.travels',
    fullName: 'Maya Anderson',
    avatar: avatar(5),
    bio: '✈️ Travel & landscape photography\n📍 Currently: Lisbon',
    verified: true,
    followers: 128400,
    following: 412,
  },
  {
    id: 'u_leo',
    username: 'leo.cooks',
    fullName: 'Leo Marchetti',
    avatar: avatar(13),
    bio: '🍝 Homemade pasta and good wine',
    followers: 54200,
    following: 318,
  },
  {
    id: 'u_aria',
    username: 'aria.design',
    fullName: 'Aria Kim',
    avatar: avatar(9),
    bio: '🎨 Product designer\n✏️ Sketches, type & color',
    verified: true,
    followers: 87600,
    following: 540,
  },
  {
    id: 'u_noah',
    username: 'noah.outdoors',
    fullName: 'Noah Bennett',
    avatar: avatar(33),
    bio: '🏔️ Mountains > everything\n🥾 Trail runner',
    followers: 23100,
    following: 187,
  },
  {
    id: 'u_zoe',
    username: 'zoe.snaps',
    fullName: 'Zoe Carter',
    avatar: avatar(45),
    bio: '🐶 Dog mom · ☕ coffee addict',
    followers: 9800,
    following: 654,
  },
  {
    id: 'u_kai',
    username: 'kai.studio',
    fullName: 'Kai Nakamura',
    avatar: avatar(52),
    bio: '🏙️ Street & architecture',
    followers: 41200,
    following: 290,
  },
  {
    id: 'u_ines',
    username: 'ines.blooms',
    fullName: 'Inês Costa',
    avatar: avatar(20),
    bio: '🌸 Florist · plant lady',
    followers: 16700,
    following: 401,
  },
]

const now = Date.now()
const minutes = (n: number) => now - n * 60 * 1000
const hours = (n: number) => now - n * 60 * 60 * 1000
const days = (n: number) => now - n * 24 * 60 * 60 * 1000

export const posts: Post[] = [
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
      { id: 'c1', userId: 'u_zoe', text: 'This is unreal 😍', createdAt: hours(1), likes: 4 },
      { id: 'c2', userId: 'u_kai', text: 'The light here is perfect', createdAt: minutes(40), likes: 1 },
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
    comments: [
      { id: 'c3', userId: 'u_ines', text: 'Save me a plate! 🤤', createdAt: hours(4), likes: 2 },
    ],
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
      { id: 'c4', userId: 'u_aria', text: 'Those colors though', createdAt: hours(8), likes: 0 },
      { id: 'c5', userId: 'u_maya', text: 'Adding this to my list immediately', createdAt: hours(7), likes: 3 },
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
    comments: [
      { id: 'c6', userId: 'u_leo', text: 'Best boy 🥹', createdAt: hours(20), likes: 5 },
    ],
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
    comments: [
      { id: 'c7', userId: 'u_aria', text: 'Composition is so clean 👏', createdAt: days(2), likes: 2 },
    ],
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

export const stories: Story[] = [
  { id: 's1', userId: 'u_maya', image: photo('story-maya', 480), createdAt: hours(3), seen: false },
  { id: 's2', userId: 'u_leo', image: photo('story-leo', 480), createdAt: hours(4), seen: false },
  { id: 's3', userId: 'u_aria', image: photo('story-aria', 480), createdAt: hours(6), seen: false },
  { id: 's4', userId: 'u_noah', image: photo('story-noah', 480), createdAt: hours(7), seen: true },
  { id: 's5', userId: 'u_zoe', image: photo('story-zoe', 480), createdAt: hours(8), seen: false },
  { id: 's6', userId: 'u_kai', image: photo('story-kai', 480), createdAt: hours(10), seen: true },
  { id: 's7', userId: 'u_ines', image: photo('story-ines', 480), createdAt: hours(12), seen: false },
]

/** Usernames the current user already follows in the seed state. */
export const initialFollowing = ['u_maya', 'u_leo', 'u_noah', 'u_zoe']
