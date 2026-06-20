import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { useTheme } from './hooks/useTheme'
import { useUI } from './context/UIContext'
import Sidebar from './components/Sidebar'
import { MobileHeader, MobileTabBar } from './components/MobileNav'
import SearchPanel from './components/SearchPanel'
import CreatePostModal from './components/CreatePostModal'
import PostDetailModal from './components/PostDetailModal'
import StoryViewer from './components/StoryViewer'
import Home from './pages/Home'
import Explore from './pages/Explore'
import Profile from './pages/Profile'

export default function App() {
  const { theme, toggle } = useTheme()
  const {
    searchOpen,
    closeSearch,
    createOpen,
    detailPostId,
    storyIndex,
    toast,
  } = useUI()
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
      <Sidebar theme={theme} onToggleTheme={toggle} />
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
