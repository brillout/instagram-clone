import { NavLink } from 'react-router-dom'
import { Compass, Home, PlusSquare, Search } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useUI } from '../context/UIContext'

export function MobileHeader() {
  const { openCreate, toggleSearch } = useUI()
  return (
    <header className="mobile-header">
      <span className="logo">Instagram</span>
      <div className="actions">
        <button className="icon-btn" onClick={openCreate} aria-label="Create">
          <PlusSquare size={24} strokeWidth={1.6} />
        </button>
        <button className="icon-btn" onClick={toggleSearch} aria-label="Search">
          <Search size={24} strokeWidth={1.6} />
        </button>
      </div>
    </header>
  )
}

export function MobileTabBar() {
  const { currentUser } = useApp()
  const { openCreate } = useUI()
  return (
    <nav className="mobile-tabbar">
      <NavLink to="/" end aria-label="Home">
        {({ isActive }) => (
          <Home size={26} strokeWidth={1.7} fill={isActive ? 'currentColor' : 'none'} />
        )}
      </NavLink>
      <NavLink to="/explore" aria-label="Explore">
        {({ isActive }) => <Compass size={26} strokeWidth={isActive ? 2.4 : 1.7} />}
      </NavLink>
      <button className="icon-btn" onClick={openCreate} aria-label="Create">
        <PlusSquare size={26} strokeWidth={1.7} />
      </button>
      <NavLink to={`/${currentUser.username}`} aria-label="Profile">
        <img className="tab-avatar avatar" src={currentUser.avatar} alt="" />
      </NavLink>
    </nav>
  )
}
