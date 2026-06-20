import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Send,
  Smile,
} from 'lucide-react'
import type { Post as PostType } from '../types'
import { useApp } from '../context/AppContext'
import { useUI } from '../context/UIContext'
import { formatCount, timeAgo, timeAgoLong } from '../utils/time'
import Verified from './Verified'

export default function Post({ post }: { post: PostType }) {
  const { getUser, isLiked, isSaved, toggleLike, toggleSave, addComment } = useApp()
  const { openPost, showToast } = useUI()
  const author = getUser(post.userId)

  const [slide, setSlide] = useState(0)
  const [burst, setBurst] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [draft, setDraft] = useState('')
  const lastTap = useRef(0)

  if (!author) return null

  const liked = isLiked(post)
  const saved = isSaved(post)
  const likeCount = post.likedBy.length

  const handleLikeButton = () => toggleLike(post.id)

  const handleDoubleTap = () => {
    if (!liked) toggleLike(post.id)
    setBurst(true)
    window.setTimeout(() => setBurst(false), 1000)
  }

  const onMediaClick = () => {
    const now = Date.now()
    if (now - lastTap.current < 300) {
      handleDoubleTap()
      lastTap.current = 0
    } else {
      lastTap.current = now
    }
  }

  const submitComment = () => {
    if (!draft.trim()) return
    addComment(post.id, draft)
    setDraft('')
  }

  const onShare = () => showToast('Link copied to clipboard')

  const hasCarousel = post.images.length > 1
  const longCaption = post.caption.length > 130
  const captionText =
    longCaption && !expanded ? post.caption.slice(0, 130).trimEnd() : post.caption

  return (
    <article className="post">
      <header className="post-head">
        <Link to={`/${author.username}`} className="post-head-avatar">
          <img src={author.avatar} alt="" />
        </Link>
        <div className="post-head-meta">
          <span className="post-head-user">
            <Link to={`/${author.username}`} className="link-bold">
              {author.username}
            </Link>
            {author.verified && <Verified />}
            <span className="dot">•</span>
            <span className="time">{timeAgo(post.createdAt)}</span>
          </span>
          {post.location && <span className="post-head-location">{post.location}</span>}
        </div>
        <button className="icon-btn" aria-label="More options">
          <MoreHorizontal size={20} />
        </button>
      </header>

      <div className="post-media" onClick={onMediaClick}>
        <div
          className="post-track"
          style={{ transform: `translateX(-${slide * 100}%)` }}
        >
          {post.images.map((src, i) => (
            <div className="post-slide" key={i}>
              <img src={src} alt={`${author.username}'s post ${i + 1}`} loading="lazy" />
            </div>
          ))}
        </div>

        {hasCarousel && (
          <>
            {slide > 0 && (
              <button
                className="carousel-btn prev"
                onClick={(e) => {
                  e.stopPropagation()
                  setSlide((s) => s - 1)
                }}
                aria-label="Previous image"
              >
                <ChevronLeft size={18} />
              </button>
            )}
            {slide < post.images.length - 1 && (
              <button
                className="carousel-btn next"
                onClick={(e) => {
                  e.stopPropagation()
                  setSlide((s) => s + 1)
                }}
                aria-label="Next image"
              >
                <ChevronRight size={18} />
              </button>
            )}
            <span className="carousel-count">
              {slide + 1}/{post.images.length}
            </span>
            <div className="carousel-dots">
              {post.images.map((_, i) => (
                <span key={i} className={`carousel-dot ${i === slide ? 'active' : ''}`} />
              ))}
            </div>
          </>
        )}

        {burst && (
          <div className="like-burst">
            <Heart size={96} fill="#fff" strokeWidth={0} />
          </div>
        )}
      </div>

      <div className="post-actions">
        <div className="left">
          <button
            className="icon-btn"
            onClick={handleLikeButton}
            aria-label={liked ? 'Unlike' : 'Like'}
          >
            <Heart
              size={24}
              strokeWidth={1.8}
              className={liked ? 'heart-active' : ''}
            />
          </button>
          <button
            className="icon-btn"
            onClick={() => openPost(post.id)}
            aria-label="Comment"
          >
            <MessageCircle size={24} strokeWidth={1.8} style={{ transform: 'scaleX(-1)' }} />
          </button>
          <button className="icon-btn" onClick={onShare} aria-label="Share">
            <Send size={24} strokeWidth={1.8} />
          </button>
        </div>
        <div className="spacer" />
        <button
          className="icon-btn"
          onClick={() => toggleSave(post.id)}
          aria-label={saved ? 'Remove from saved' : 'Save'}
        >
          <Bookmark size={24} strokeWidth={1.8} className={saved ? 'saved-active' : ''} />
        </button>
      </div>

      <div className="post-body">
        {likeCount > 0 && (
          <div className="post-likes">{formatCount(likeCount)} likes</div>
        )}

        {post.caption && (
          <div className="post-caption">
            <Link to={`/${author.username}`} className="author">
              {author.username}
            </Link>
            {captionText}
            {longCaption && !expanded && (
              <button className="caption-more" onClick={() => setExpanded(true)}>
                {' '}
                … more
              </button>
            )}
          </div>
        )}

        {post.comments.length > 0 && (
          <button className="post-comments-link" onClick={() => openPost(post.id)}>
            View all {post.comments.length}{' '}
            {post.comments.length === 1 ? 'comment' : 'comments'}
          </button>
        )}

        {post.comments.slice(-2).map((comment) => {
          const cu = getUser(comment.userId)
          if (!cu) return null
          return (
            <div className="post-comment" key={comment.id}>
              <Link to={`/${cu.username}`} className="author">
                {cu.username}
              </Link>
              <span>{comment.text}</span>
            </div>
          )
        })}

        <div className="post-time-small">{timeAgoLong(post.createdAt)}</div>
      </div>

      <div className="add-comment">
        <Smile size={24} strokeWidth={1.6} className="muted" />
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submitComment()}
          placeholder="Add a comment…"
          aria-label="Add a comment"
        />
        {draft.trim() && (
          <button className="btn-text" onClick={submitComment}>
            Post
          </button>
        )}
      </div>
    </article>
  )
}
