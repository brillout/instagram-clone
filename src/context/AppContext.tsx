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
import { api } from '../api/client'
import { useAuth } from './AuthContext'
import { useUI } from './UIContext'

export interface NewPostInput {
  files: File[]
  imageUrls: string[]
  caption: string
  location?: string
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
  addPost: (input: NewPostInput) => Promise<Post>
  markStorySeen: (storyId: string) => void
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const { showToast } = useUI()
  const meId = user!.id

  const [users, setUsers] = useState<User[]>([])
  const [posts, setPosts] = useState<Post[]>([])
  const [stories, setStories] = useState<Story[]>([])
  const [following, setFollowing] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    api
      .get('/bootstrap')
      .then((data) => {
        if (cancelled) return
        setUsers(data.users)
        setPosts(data.posts)
        setStories(data.stories)
        setFollowing(data.following)
      })
      .catch(() => showToast('Failed to load feed'))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [meId, showToast])

  // The signed-in user, always present in the bootstrapped users list.
  const currentUser = useMemo(
    () => users.find((u) => u.id === meId) ?? user!,
    [users, meId, user],
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
    () => posts.filter((p) => p.savedBy.includes(meId)),
    [posts, meId],
  )

  const isLiked = useCallback((post: Post) => post.likedBy.includes(meId), [meId])
  const isSaved = useCallback((post: Post) => post.savedBy.includes(meId), [meId])
  const isFollowing = useCallback((id: string) => following.includes(id), [following])

  const toggleLike = useCallback(
    (postId: string) => {
      let prev: Post | undefined
      setPosts((list) =>
        list.map((p) => {
          if (p.id !== postId) return p
          prev = p
          const liked = p.likedBy.includes(meId)
          return {
            ...p,
            likedBy: liked
              ? p.likedBy.filter((id) => id !== meId)
              : [...p.likedBy, meId],
          }
        }),
      )
      api.post(`/posts/${postId}/like`).catch(() => {
        showToast('Could not update like')
        setPosts((list) => list.map((p) => (p.id === postId && prev ? prev : p)))
      })
    },
    [meId, showToast],
  )

  const toggleSave = useCallback(
    (postId: string) => {
      let prev: Post | undefined
      setPosts((list) =>
        list.map((p) => {
          if (p.id !== postId) return p
          prev = p
          const saved = p.savedBy.includes(meId)
          return {
            ...p,
            savedBy: saved
              ? p.savedBy.filter((id) => id !== meId)
              : [...p.savedBy, meId],
          }
        }),
      )
      api.post(`/posts/${postId}/save`).catch(() => {
        showToast('Could not update saved')
        setPosts((list) => list.map((p) => (p.id === postId && prev ? prev : p)))
      })
    },
    [meId, showToast],
  )

  const toggleFollow = useCallback(
    (userId: string) => {
      if (userId === meId) return
      const wasFollowing = following.includes(userId)
      // Optimistically update the follow list and both users' counts.
      setFollowing((list) =>
        wasFollowing ? list.filter((id) => id !== userId) : [...list, userId],
      )
      setUsers((list) =>
        list.map((u) => {
          if (u.id === userId) {
            return { ...u, followers: u.followers + (wasFollowing ? -1 : 1) }
          }
          if (u.id === meId) {
            return { ...u, following: u.following + (wasFollowing ? -1 : 1) }
          }
          return u
        }),
      )
      api.post(`/users/${userId}/follow`).catch(() => {
        showToast('Could not update follow')
        setFollowing((list) =>
          wasFollowing ? [...list, userId] : list.filter((id) => id !== userId),
        )
        setUsers((list) =>
          list.map((u) => {
            if (u.id === userId) {
              return { ...u, followers: u.followers + (wasFollowing ? 1 : -1) }
            }
            if (u.id === meId) {
              return { ...u, following: u.following + (wasFollowing ? 1 : -1) }
            }
            return u
          }),
        )
      })
    },
    [meId, following, showToast],
  )

  const addComment = useCallback(
    (postId: string, text: string) => {
      const trimmed = text.trim()
      if (!trimmed) return
      api
        .post(`/posts/${postId}/comments`, { text: trimmed })
        .then(({ comment }: { comment: Comment }) => {
          setPosts((list) =>
            list.map((p) =>
              p.id === postId ? { ...p, comments: [...p.comments, comment] } : p,
            ),
          )
        })
        .catch(() => showToast('Could not post comment'))
    },
    [showToast],
  )

  const addPost = useCallback(async (input: NewPostInput): Promise<Post> => {
    const form = new FormData()
    form.append('caption', input.caption)
    if (input.location) form.append('location', input.location)
    for (const file of input.files) form.append('images', file)
    for (const url of input.imageUrls) form.append('images', url)
    const { post } = await api.upload('/posts', form)
    setPosts((list) => [post, ...list])
    return post
  }, [])

  const markStorySeen = useCallback((storyId: string) => {
    setStories((list) =>
      list.map((s) => (s.id === storyId ? { ...s, seen: true } : s)),
    )
    api.post(`/stories/${storyId}/seen`).catch(() => {})
  }, [])

  if (loading) {
    return (
      <div className="app-splash">
        <div className="spinner" />
      </div>
    )
  }

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
