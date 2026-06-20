import { useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  Bookmark,
  Grid3x3,
  Heart,
  Layers,
  LogOut,
  MessageCircle,
  UserSquare,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { useUI } from '../context/UIContext'
import { formatCount } from '../utils/time'
import type { Post } from '../types'
import Verified from '../components/Verified'

type Tab = 'posts' | 'saved' | 'tagged'

function PhotoGrid({ posts, emptyLabel }: { posts: Post[]; emptyLabel: string }) {
  const { openPost } = useUI()

  if (posts.length === 0) {
    return (
      <div className="empty-state">
        <div className="ring">
          <Grid3x3 size={28} strokeWidth={1.2} />
        </div>
        <h2>{emptyLabel}</h2>
      </div>
    )
  }

  return (
    <div className="grid">
      {posts.map((post) => (
        <button key={post.id} className="grid-item" onClick={() => openPost(post.id)}>
          <img src={post.images[0]} alt={post.caption.slice(0, 40)} loading="lazy" />
          {post.images.length > 1 && (
            <span className="grid-multi">
              <Layers size={20} fill="#fff" />
            </span>
          )}
          <div className="grid-overlay">
            <span className="stat">
              <Heart size={20} fill="#fff" strokeWidth={0} />
              {formatCount(post.likedBy.length)}
            </span>
            <span className="stat">
              <MessageCircle size={20} fill="#fff" strokeWidth={0} />
              {post.comments.length}
            </span>
          </div>
        </button>
      ))}
    </div>
  )
}

export default function Profile() {
  const { username } = useParams<{ username: string }>()
  const {
    currentUser,
    getUserByUsername,
    postsByUser,
    savedPosts,
    isFollowing,
    toggleFollow,
  } = useApp()
  const { logout } = useAuth()
  const [tab, setTab] = useState<Tab>('posts')

  const user = username ? getUserByUsername(username) : undefined

  if (!user) {
    return (
      <div className="page">
        <div className="empty-state">
          <h2>Sorry, this page isn't available.</h2>
          <p>
            The link you followed may be broken, or the page may have been removed.
          </p>
        </div>
      </div>
    )
  }

  const isMe = user.id === currentUser.id
  const userPosts = postsByUser(user.id)
  const following = isFollowing(user.id)

  return (
    <div className="page">
      <header className="profile-header">
        <div className="profile-avatar-wrap">
          <img className="profile-avatar avatar" src={user.avatar} alt={user.username} />
        </div>
        <div className="profile-info">
          <div className="profile-info-top">
            <h1 className="profile-username">
              {user.username}
              {user.verified && <Verified size={18} />}
            </h1>
            <div className="profile-actions">
              {isMe ? (
                <>
                  <button className="btn-secondary">Edit profile</button>
                  <button className="btn-secondary" onClick={() => void logout()}>
                    <LogOut size={16} strokeWidth={2} style={{ marginRight: 6 }} />
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <button
                    className={following ? 'btn-secondary' : 'btn-primary'}
                    onClick={() => toggleFollow(user.id)}
                  >
                    {following ? 'Following' : 'Follow'}
                  </button>
                  <button className="btn-secondary">Message</button>
                </>
              )}
            </div>
          </div>

          <ul className="profile-stats">
            <li>
              <span>{userPosts.length}</span> posts
            </li>
            <li>
              <span>{formatCount(user.followers)}</span> followers
            </li>
            <li>
              <span>{formatCount(user.following)}</span> following
            </li>
          </ul>

          <div className="profile-bio">
            <div className="name">{user.fullName}</div>
            {user.bio}
          </div>
        </div>
      </header>

      <nav className="profile-tabs">
        <button
          className={`profile-tab ${tab === 'posts' ? 'active' : ''}`}
          onClick={() => setTab('posts')}
        >
          <Grid3x3 size={12} /> Posts
        </button>
        {isMe && (
          <button
            className={`profile-tab ${tab === 'saved' ? 'active' : ''}`}
            onClick={() => setTab('saved')}
          >
            <Bookmark size={12} /> Saved
          </button>
        )}
        <button
          className={`profile-tab ${tab === 'tagged' ? 'active' : ''}`}
          onClick={() => setTab('tagged')}
        >
          <UserSquare size={12} /> Tagged
        </button>
      </nav>

      {tab === 'posts' && (
        <PhotoGrid posts={userPosts} emptyLabel={isMe ? 'Share Photos' : 'No Posts Yet'} />
      )}
      {tab === 'saved' && isMe && (
        <PhotoGrid posts={savedPosts} emptyLabel="Save Photos" />
      )}
      {tab === 'tagged' && <PhotoGrid posts={[]} emptyLabel="No Photos" />}
    </div>
  )
}
