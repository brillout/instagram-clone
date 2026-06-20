export interface User {
  id: string
  username: string
  fullName: string
  avatar: string
  bio?: string
  verified?: boolean
  followers: number
  following: number
}

export interface Comment {
  id: string
  userId: string
  text: string
  createdAt: number
  likes: number
}

export interface Post {
  id: string
  userId: string
  /** One or more image URLs (carousel support). */
  images: string[]
  caption: string
  location?: string
  createdAt: number
  likedBy: string[]
  savedBy: string[]
  comments: Comment[]
}

export interface Story {
  id: string
  userId: string
  image: string
  createdAt: number
  seen: boolean
}
