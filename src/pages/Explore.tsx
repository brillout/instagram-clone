import { Heart, MessageCircle, Layers } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useUI } from '../context/UIContext'
import { formatCount } from '../utils/time'

export default function Explore() {
  const { posts } = useApp()
  const { openPost } = useUI()

  // Shuffle deterministically so the grid feels like a discovery feed but is
  // stable across renders.
  const ordered = [...posts].sort((a, b) => (a.id < b.id ? -1 : 1))

  return (
    <div className="page">
      <div className="explore-grid">
        {ordered.map((post, i) => (
          <button
            key={post.id}
            className={`grid-item ${i % 7 === 0 ? 'tall' : ''}`}
            onClick={() => openPost(post.id)}
          >
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
    </div>
  )
}
