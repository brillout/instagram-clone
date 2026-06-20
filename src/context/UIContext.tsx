import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from 'react'

interface UIContextValue {
  /** Post id currently open in the detail modal, or null. */
  detailPostId: string | null
  openPost: (postId: string) => void
  closePost: () => void

  createOpen: boolean
  openCreate: () => void
  closeCreate: () => void

  searchOpen: boolean
  toggleSearch: () => void
  closeSearch: () => void

  /** Index into the stories array for the story viewer, or null. */
  storyIndex: number | null
  openStory: (index: number) => void
  closeStory: () => void

  toast: string | null
  showToast: (message: string) => void
}

const UIContext = createContext<UIContextValue | null>(null)

export function UIProvider({ children }: { children: ReactNode }) {
  const [detailPostId, setDetailPostId] = useState<string | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [storyIndex, setStoryIndex] = useState<number | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const toastTimer = useRef<number | undefined>(undefined)

  const showToast = useCallback((message: string) => {
    setToast(message)
    window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(null), 2600)
  }, [])

  const value: UIContextValue = {
    detailPostId,
    openPost: setDetailPostId,
    closePost: () => setDetailPostId(null),
    createOpen,
    openCreate: () => setCreateOpen(true),
    closeCreate: () => setCreateOpen(false),
    searchOpen,
    toggleSearch: () => setSearchOpen((s) => !s),
    closeSearch: () => setSearchOpen(false),
    storyIndex,
    openStory: setStoryIndex,
    closeStory: () => setStoryIndex(null),
    toast,
    showToast,
  }

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useUI(): UIContextValue {
  const ctx = useContext(UIContext)
  if (!ctx) throw new Error('useUI must be used within a UIProvider')
  return ctx
}
