import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import Verified from './Verified'

const FOOTER_LINKS = [
  'About',
  'Help',
  'Press',
  'API',
  'Jobs',
  'Privacy',
  'Terms',
  'Locations',
  'Language',
]

export default function Suggestions() {
  const { currentUser, users, isFollowing, toggleFollow } = useApp()

  const suggestions = users.filter(
    (u) => u.id !== currentUser.id && !isFollowing(u.id),
  )

  return (
    <aside className="home-aside">
      <Link to={`/${currentUser.username}`} className="aside-me">
        <img className="avatar" src={currentUser.avatar} alt="" />
        <div className="meta">
          <div className="username">{currentUser.username}</div>
          <div className="name">{currentUser.fullName}</div>
        </div>
        <button className="btn-text" style={{ fontSize: 12 }}>
          Switch
        </button>
      </Link>

      <div className="aside-head">
        <span>Suggested for you</span>
        <button>See All</button>
      </div>

      {suggestions.map((user) => (
        <div className="suggestion" key={user.id}>
          <Link to={`/${user.username}`}>
            <img className="avatar" src={user.avatar} alt="" />
          </Link>
          <div className="meta">
            <Link to={`/${user.username}`} className="username link-bold">
              {user.username}
              {user.verified && <Verified />}
            </Link>
            <div className="sub">Suggested for you</div>
          </div>
          <button className="btn-text" onClick={() => toggleFollow(user.id)}>
            Follow
          </button>
        </div>
      ))}

      <footer className="aside-footer">
        <div>
          {FOOTER_LINKS.map((link, i) => (
            <span key={link}>
              <a href="#">{link}</a>
              {i < FOOTER_LINKS.length - 1 && <span className="dot">·</span>}
            </span>
          ))}
        </div>
        <div className="aside-copyright">© 2026 Instagram clone</div>
      </footer>
    </aside>
  )
}
