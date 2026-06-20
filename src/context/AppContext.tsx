import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Comment, Post, Story, User } from '../types'
import {
  CURRENT_USER_ID,
  initialFollowing,
  posts as seedPosts,
  stories as seedStories,
  users as seedUsers,
} from '../data/seed'

const STORAGE_KEY = 'instagram-clone:v1'

interface PersistedState {
  posts: Post[]
  stories: Story[]
  following: string[]
}

interface AppContextValue {
  currentUser: User
  users: User[]
  posts: Post[]
  stories: Story[]
  following: string[]
  getUser: (id: string) => User | undefined
  getUserByUsername: (username: string) => User | undefined
  postsByUser: (userId: string) => Post[]
  savedPosts: Post[]
  isLiked: (post: Post) => boolean
  isSaved: (post: Post) => boolean
  isFollowing: (userId: string) => boolean
  toggleLike: (postId: string) => void
  toggleSave: (postId: string) => void
  toggleFollow: (userId: string) => void
  addComment: (postId: string, text: string) => void
  addPost: (input: { images: string[]; caption: string; location?: string }) => Post
  markStorySeen: (storyId: string) => void
}

const AppContext = createContext<AppContextValue | null>(null)

function loadState(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<PersistedState>
      if (Array.isArray(parsed.posts) && Array.isArray(parsed.stories)) {
        return {
          posts: parsed.posts,
          stories: parsed.stories,
          following: parsed.following ?? initialFollowing,
        }
      }
    }
  } catch {
    /* corrupt storage — fall back to seed */
  }
  return { posts: seedPosts, stories: seedStories, following: initialFollowing }
}

let idCounter = 0
const uid = (prefix: string) =>
  `${prefix}_${Date.now().toString(36)}_${(idCounter++).toString(36)}`

export function AppProvider({ children }: { children: ReactNode }) {
  const [{ posts, stories, following }, setState] = useState(loadState)

  // Users are static (no signup flow) so they live outside persisted state.
  const users = seedUsers

  useEffect(() => {
    const data: PersistedState = { posts, stories, following }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch {
      /* storage full or unavailable — ignore */
    }
  }, [posts, stories, following])

  const currentUser = useMemo(
    () => users.find((u) => u.id === CURRENT_USER_ID)!,
    [users],
  )

  const getUser = useCallback((id: string) => users.find((u) => u.id === id), [users])
  const getUserByUsername = useCallback(
    (username: string) => users.find((u) => u.username === username),
    [users],
  )

  const postsByUser = useCallback(
    (userId: string) => posts.filter((p) => p.userId === userId),
    [posts],
  )

  const savedPosts = useMemo(
    () => posts.filter((p) => p.savedBy.includes(CURRENT_USER_ID)),
    [posts],
  )

  const isLiked = useCallback((post: Post) => post.likedBy.includes(CURRENT_USER_ID), [])
  const isSaved = useCallback((post: Post) => post.savedBy.includes(CURRENT_USER_ID), [])
  const isFollowing = useCallback(
    (userId: string) => following.includes(userId),
    [following],
  )

  const updatePost = useCallback((postId: string, updater: (p: Post) => Post) => {
    setState((prev) => ({
      ...prev,
      posts: prev.posts.map((p) => (p.id === postId ? updater(p) : p)),
    }))
  }, [])

  const toggleLike = useCallback(
    (postId: string) => {
      updatePost(postId, (p) => {
        const liked = p.likedBy.includes(CURRENT_USER_ID)
        return {
          ...p,
          likedBy: liked
            ? p.likedBy.filter((id) => id !== CURRENT_USER_ID)
            : [...p.likedBy, CURRENT_USER_ID],
        }
      })
    },
    [updatePost],
  )

  const toggleSave = useCallback(
    (postId: string) => {
      updatePost(postId, (p) => {
        const saved = p.savedBy.includes(CURRENT_USER_ID)
        return {
          ...p,
          savedBy: saved
            ? p.savedBy.filter((id) => id !== CURRENT_USER_ID)
            : [...p.savedBy, CURRENT_USER_ID],
        }
      })
    },
    [updatePost],
  )

  const addComment = useCallback(
    (postId: string, text: string) => {
      const trimmed = text.trim()
      if (!trimmed) return
      const comment: Comment = {
        id: uid('c'),
        userId: CURRENT_USER_ID,
        text: trimmed,
        createdAt: Date.now(),
        likes: 0,
      }
      updatePost(postId, (p) => ({ ...p, comments: [...p.comments, comment] }))
    },
    [updatePost],
  )

  const toggleFollow = useCallback((userId: string) => {
    if (userId === CURRENT_USER_ID) return
    setState((prev) => ({
      ...prev,
      following: prev.following.includes(userId)
        ? prev.following.filter((id) => id !== userId)
        : [...prev.following, userId],
    }))
  }, [])

  const addPost = useCallback(
    (input: { images: string[]; caption: string; location?: string }) => {
      const post: Post = {
        id: uid('p'),
        userId: CURRENT_USER_ID,
        images: input.images,
        caption: input.caption,
        location: input.location,
        createdAt: Date.now(),
        likedBy: [],
        savedBy: [],
        comments: [],
      }
      setState((prev) => ({ ...prev, posts: [post, ...prev.posts] }))
      return post
    },
    [],
  )

  const markStorySeen = useCallback((storyId: string) => {
    setState((prev) => ({
      ...prev,
      stories: prev.stories.map((s) => (s.id === storyId ? { ...s, seen: true } : s)),
    }))
  }, [])

  const value: AppContextValue = {
    currentUser,
    users,
    posts,
    stories,
    following,
    getUser,
    getUserByUsername,
    postsByUser,
    savedPosts,
    isLiked,
    isSaved,
    isFollowing,
    toggleLike,
    toggleSave,
    toggleFollow,
    addComment,
    addPost,
    markStorySeen,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useApp(): AppContextValue {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within an AppProvider')
  return ctx
}
