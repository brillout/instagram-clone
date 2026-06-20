import { inArray } from 'drizzle-orm'
import { db } from '../db/client.js'
import {
  comments as commentsT,
  follows as followsT,
  likes as likesT,
  postImages as postImagesT,
  posts as postsT,
  saves as savesT,
  users as usersT,
} from '../db/schema.js'

export interface UserDTO {
  id: string
  username: string
  fullName: string
  avatar: string
  bio?: string
  verified?: boolean
  followers: number
  following: number
}

export interface CommentDTO {
  id: string
  userId: string
  text: string
  createdAt: number
  likes: number
}

export interface PostDTO {
  id: string
  userId: string
  images: string[]
  caption: string
  location?: string
  createdAt: number
  likedBy: string[]
  savedBy: string[]
  comments: CommentDTO[]
}

type UserRow = typeof usersT.$inferSelect

/** Serialize users, batching follower/following counts in one pass. */
export async function serializeUsers(rows: UserRow[]): Promise<UserDTO[]> {
  if (rows.length === 0) return []
  const ids = rows.map((r) => r.id)
  const follows = await db
    .select({ followerId: followsT.followerId, followingId: followsT.followingId })
    .from(followsT)

  const followerCount = new Map<string, number>()
  const followingCount = new Map<string, number>()
  for (const f of follows) {
    followerCount.set(f.followingId, (followerCount.get(f.followingId) ?? 0) + 1)
    followingCount.set(f.followerId, (followingCount.get(f.followerId) ?? 0) + 1)
  }
  void ids

  return rows.map((r) => ({
    id: r.id,
    username: r.username,
    fullName: r.fullName,
    avatar: r.avatar,
    bio: r.bio ?? undefined,
    verified: r.verified || undefined,
    followers: r.followersBase + (followerCount.get(r.id) ?? 0),
    following: r.followingBase + (followingCount.get(r.id) ?? 0),
  }))
}

export async function serializeUser(row: UserRow): Promise<UserDTO> {
  return (await serializeUsers([row]))[0]
}

/**
 * Assemble full Post DTOs (images, comments, likes, save-state) for a set of
 * post rows, from the perspective of `viewerId`. Batched to avoid N+1 queries.
 */
export async function serializePosts(
  rows: (typeof postsT.$inferSelect)[],
  viewerId: string,
): Promise<PostDTO[]> {
  if (rows.length === 0) return []
  const ids = rows.map((r) => r.id)

  const [images, comments, likes, saves] = await Promise.all([
    db.select().from(postImagesT).where(inArray(postImagesT.postId, ids)),
    db.select().from(commentsT).where(inArray(commentsT.postId, ids)),
    db.select().from(likesT).where(inArray(likesT.postId, ids)),
    db.select().from(savesT).where(inArray(savesT.postId, ids)),
  ])

  const imagesByPost = new Map<string, { url: string; position: number }[]>()
  for (const img of images) {
    const list = imagesByPost.get(img.postId) ?? []
    list.push({ url: img.url, position: img.position })
    imagesByPost.set(img.postId, list)
  }

  const commentsByPost = new Map<string, CommentDTO[]>()
  for (const cm of comments) {
    const list = commentsByPost.get(cm.postId) ?? []
    list.push({
      id: cm.id,
      userId: cm.userId,
      text: cm.text,
      createdAt: cm.createdAt,
      likes: 0,
    })
    commentsByPost.set(cm.postId, list)
  }

  const likesByPost = new Map<string, string[]>()
  for (const lk of likes) {
    const list = likesByPost.get(lk.postId) ?? []
    list.push(lk.userId)
    likesByPost.set(lk.postId, list)
  }

  const savedByViewer = new Set(
    saves.filter((s) => s.userId === viewerId).map((s) => s.postId),
  )

  return rows.map((p) => ({
    id: p.id,
    userId: p.userId,
    images: (imagesByPost.get(p.id) ?? [])
      .sort((a, b) => a.position - b.position)
      .map((i) => i.url),
    caption: p.caption,
    location: p.location ?? undefined,
    createdAt: p.createdAt,
    likedBy: likesByPost.get(p.id) ?? [],
    savedBy: savedByViewer.has(p.id) ? [viewerId] : [],
    comments: (commentsByPost.get(p.id) ?? []).sort(
      (a, b) => a.createdAt - b.createdAt,
    ),
  }))
}
