import { sql } from 'drizzle-orm'
import {
  integer,
  primaryKey,
  sqliteTable,
  text,
} from 'drizzle-orm/sqlite-core'

const now = sql`(unixepoch() * 1000)`

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  username: text('username').notNull().unique(),
  fullName: text('full_name').notNull(),
  passwordHash: text('password_hash').notNull(),
  avatar: text('avatar').notNull(),
  bio: text('bio'),
  verified: integer('verified', { mode: 'boolean' }).notNull().default(false),
  /** Display-only base counts so seed accounts look established. */
  followersBase: integer('followers_base').notNull().default(0),
  followingBase: integer('following_base').notNull().default(0),
  createdAt: integer('created_at').notNull().default(now),
})

export const posts = sqliteTable('posts', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  caption: text('caption').notNull().default(''),
  location: text('location'),
  createdAt: integer('created_at').notNull().default(now),
})

export const postImages = sqliteTable('post_images', {
  id: text('id').primaryKey(),
  postId: text('post_id')
    .notNull()
    .references(() => posts.id, { onDelete: 'cascade' }),
  url: text('url').notNull(),
  position: integer('position').notNull().default(0),
})

export const comments = sqliteTable('comments', {
  id: text('id').primaryKey(),
  postId: text('post_id')
    .notNull()
    .references(() => posts.id, { onDelete: 'cascade' }),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  text: text('text').notNull(),
  createdAt: integer('created_at').notNull().default(now),
})

export const likes = sqliteTable(
  'likes',
  {
    postId: text('post_id')
      .notNull()
      .references(() => posts.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    createdAt: integer('created_at').notNull().default(now),
  },
  (t) => ({ pk: primaryKey({ columns: [t.postId, t.userId] }) }),
)

export const saves = sqliteTable(
  'saves',
  {
    postId: text('post_id')
      .notNull()
      .references(() => posts.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    createdAt: integer('created_at').notNull().default(now),
  },
  (t) => ({ pk: primaryKey({ columns: [t.postId, t.userId] }) }),
)

export const follows = sqliteTable(
  'follows',
  {
    followerId: text('follower_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    followingId: text('following_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    createdAt: integer('created_at').notNull().default(now),
  },
  (t) => ({ pk: primaryKey({ columns: [t.followerId, t.followingId] }) }),
)

export const stories = sqliteTable('stories', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  image: text('image').notNull(),
  createdAt: integer('created_at').notNull().default(now),
})

export const storyViews = sqliteTable(
  'story_views',
  {
    storyId: text('story_id')
      .notNull()
      .references(() => stories.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
  },
  (t) => ({ pk: primaryKey({ columns: [t.storyId, t.userId] }) }),
)
