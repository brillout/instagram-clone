import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useUI } from '../context/UIContext'
import { formatCount } from '../utils/time'
import Verified from './Verified'

export default function SearchPanel() {
  const { users, currentUser } = useApp()
  const { closeSearch } = useUI()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeSearch()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [closeSearch])

  const q = query.trim().toLowerCase()
  const results = q
    ? users.filter(
        (u) =>
          u.id !== currentUser.id &&
          (u.username.toLowerCase().includes(q) ||
            u.fullName.toLowerCase().includes(q)),
      )
    : users.filter((u) => u.id !== currentUser.id).slice(0, 6)

  const go = (username: string) => {
    navigate(`/${username}`)
    closeSearch()
  }

  return (
    <div className="search-panel">
      <h2>Search</h2>
      <div className="search-input-wrap">
        <Search size={16} className="muted" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search"
        />
        {query && (
          <button className="icon-btn" onClick={() => setQuery('')} aria-label="Clear">
            <X size={16} />
          </button>
        )}
      </div>

      <div className="search-results">
        {!q && (
          <div style={{ padding: '4px 24px 12px', fontWeight: 600 }}>Suggested</div>
        )}
        {results.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center' }} className="muted">
            No results found.
          </div>
        ) : (
          results.map((user) => (
            <button
              key={user.id}
              className="search-result"
              onClick={() => go(user.username)}
            >
              <img className="avatar" src={user.avatar} alt="" />
              <div>
                <div className="username">
                  {user.username}
                  {user.verified && <Verified />}
                </div>
                <div className="sub">
                  {user.fullName} · {formatCount(user.followers)} followers
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  )
}
