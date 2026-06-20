import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuth } from './context/AuthContext'
import { AppProvider } from './context/AppContext'
import { UIProvider, useUI } from './context/UIContext'
import { useTheme } from './hooks/useTheme'
import Sidebar from './components/Sidebar'
import { MobileHeader, MobileTabBar } from './components/MobileNav'
import SearchPanel from './components/SearchPanel'
import CreatePostModal from './components/CreatePostModal'
import PostDetailModal from './components/PostDetailModal'
import StoryViewer from './components/StoryViewer'
import Home from './pages/Home'
import Explore from './pages/Explore'
import Profile from './pages/Profile'
import Auth from './pages/Auth'

export default function App() {
  const { user, loading } = useAuth()
  // Theme is owned here so it applies app-wide, including the auth screen.
  const { theme, toggle } = useTheme()

  if (loading) {
    return (
      <div className="app-splash">
        <div className="spinner" />
      </div>
    )
  }

  if (!user) return <Auth />

  return (
    <UIProvider>
      <AppProvider>
        <Shell theme={theme} onToggleTheme={toggle} />
      </AppProvider>
    </UIProvider>
  )
}

function Shell({
  theme,
  onToggleTheme,
}: {
  theme: 'light' | 'dark'
  onToggleTheme: () => void
}) {
  const { searchOpen, closeSearch, createOpen, detailPostId, storyIndex, toast } = useUI()
  const location = useLocation()

  // Close the search panel whenever the route changes.
  useEffect(() => {
    closeSearch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname])

  // Scroll to top on navigation.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  return (
    <div className="app" data-nav={searchOpen ? 'collapsed' : 'expanded'}>
      <Sidebar theme={theme} onToggleTheme={onToggleTheme} />
      <MobileHeader />

      {searchOpen && (
        <>
          <div
            onClick={closeSearch}
            style={{ position: 'fixed', inset: 0, zIndex: 98 }}
            aria-hidden
          />
          <SearchPanel />
        </>
      )}

      <main className="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/:username" element={<Profile />} />
        </Routes>
      </main>

      <MobileTabBar />

      {createOpen && <CreatePostModal />}
      {detailPostId && <PostDetailModal />}
      {storyIndex !== null && <StoryViewer />}

      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}
