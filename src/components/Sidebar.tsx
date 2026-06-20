import { NavLink, useLocation } from 'react-router-dom'
import {
  Compass,
  Home,
  Instagram,
  Menu,
  Moon,
  PlusSquare,
  Search,
  Sun,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useUI } from '../context/UIContext'

interface SidebarProps {
  theme: 'light' | 'dark'
  onToggleTheme: () => void
}

export default function Sidebar({ theme, onToggleTheme }: SidebarProps) {
  const { currentUser } = useApp()
  const { openCreate, toggleSearch, searchOpen } = useUI()
  const location = useLocation()

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <span className="logo">Instagram</span>
        <Instagram className="sidebar-logo-mark" size={26} strokeWidth={1.5} />
      </div>

      <nav className="sidebar-nav">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `nav-item ${isActive && !searchOpen ? 'active' : ''}`
          }
        >
          <Home
            className="nav-icon"
            size={26}
            strokeWidth={location.pathname === '/' && !searchOpen ? 2.4 : 1.6}
            fill={location.pathname === '/' && !searchOpen ? 'currentColor' : 'none'}
          />
          <span className="nav-label">Home</span>
        </NavLink>

        <button
          className={`nav-item ${searchOpen ? 'active' : ''}`}
          onClick={toggleSearch}
        >
          <Search
            className="nav-icon"
            size={26}
            strokeWidth={searchOpen ? 2.4 : 1.6}
          />
          <span className="nav-label">Search</span>
        </button>

        <NavLink
          to="/explore"
          className={({ isActive }) =>
            `nav-item ${isActive && !searchOpen ? 'active' : ''}`
          }
        >
          <Compass
            className="nav-icon"
            size={26}
            strokeWidth={location.pathname === '/explore' && !searchOpen ? 2.4 : 1.6}
          />
          <span className="nav-label">Explore</span>
        </NavLink>

        <button className="nav-item" onClick={openCreate}>
          <PlusSquare className="nav-icon" size={26} strokeWidth={1.6} />
          <span className="nav-label">Create</span>
        </button>

        <NavLink
          to={`/${currentUser.username}`}
          className={({ isActive }) =>
            `nav-item ${isActive && !searchOpen ? 'active' : ''}`
          }
        >
          <img className="nav-icon nav-avatar avatar" src={currentUser.avatar} alt="" />
          <span className="nav-label">Profile</span>
        </NavLink>
      </nav>

      <button className="nav-item" onClick={onToggleTheme}>
        {theme === 'dark' ? (
          <Sun className="nav-icon" size={26} strokeWidth={1.6} />
        ) : (
          <Moon className="nav-icon" size={26} strokeWidth={1.6} />
        )}
        <span className="nav-label">{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
      </button>
      <button className="nav-item">
        <Menu className="nav-icon" size={26} strokeWidth={1.6} />
        <span className="nav-label">More</span>
      </button>
    </aside>
  )
}
