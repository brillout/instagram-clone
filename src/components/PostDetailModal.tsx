import { useState } from 'react'
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
import { useApp } from '../context/AppContext'
import { useUI } from '../context/UIContext'
import { formatCount, timeAgo, timeAgoLong } from '../utils/time'
import Modal from './Modal'
import Verified from './Verified'

export default function PostDetailModal() {
  const {
    posts,
    getUser,
    isLiked,
    isSaved,
    toggleLike,
    toggleSave,
    addComment,
  } = useApp()
  const { detailPostId, closePost, showToast } = useUI()
  const [slide, setSlide] = useState(0)
  const [draft, setDraft] = useState('')

  const post = posts.find((p) => p.id === detailPostId)
  if (!post) return null
  const author = getUser(post.userId)
  if (!author) return null

  const liked = isLiked(post)
  const saved = isSaved(post)
  const hasCarousel = post.images.length > 1

  const submit = () => {
    if (!draft.trim()) return
    addComment(post.id, draft)
    setDraft('')
  }

  return (
    <Modal onClose={closePost}>
      <div className="detail">
        <div className="detail-media">
          <div className="post-media" style={{ width: '100%', height: '100%' }}>
            <div className="post-track" style={{ transform: `translateX(-${slide * 100}%)` }}>
              {post.images.map((src, i) => (
                <div className="post-slide" key={i}>
                  <img src={src} alt={`${author.username}'s post ${i + 1}`} />
                </div>
              ))}
            </div>
            {hasCarousel && (
              <>
                {slide > 0 && (
                  <button
                    className="carousel-btn prev"
                    onClick={() => setSlide((s) => s - 1)}
                    aria-label="Previous image"
                  >
                    <ChevronLeft size={18} />
                  </button>
                )}
                {slide < post.images.length - 1 && (
                  <button
                    className="carousel-btn next"
                    onClick={() => setSlide((s) => s + 1)}
                    aria-label="Next image"
                  >
                    <ChevronRight size={18} />
                  </button>
                )}
                <div className="carousel-dots">
                  {post.images.map((_, i) => (
                    <span key={i} className={`carousel-dot ${i === slide ? 'active' : ''}`} />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="detail-side">
          <header className="detail-head">
            <Link to={`/${author.username}`} onClick={closePost}>
              <img className="avatar" src={author.avatar} alt="" />
            </Link>
            <Link
              to={`/${author.username}`}
              className="link-bold"
              onClick={closePost}
              style={{ display: 'flex', alignItems: 'center', gap: 4 }}
            >
              {author.username}
              {author.verified && <Verified />}
            </Link>
            <div style={{ flex: 1 }} />
            <button className="icon-btn" aria-label="More options">
              <MoreHorizontal size={20} />
            </button>
          </header>

          <div className="detail-scroll">
            {post.caption && (
              <div className="comment-row">
                <Link to={`/${author.username}`} onClick={closePost}>
                  <img className="avatar" src={author.avatar} alt="" />
                </Link>
                <div className="body">
                  <Link to={`/${author.username}`} className="author" onClick={closePost}>
                    {author.username}
                  </Link>
                  <span style={{ whiteSpace: 'pre-wrap' }}>{post.caption}</span>
                  <div className="meta">
                    <span>{timeAgo(post.createdAt)}</span>
                  </div>
                </div>
              </div>
            )}

            {post.comments.map((comment) => {
              const cu = getUser(comment.userId)
              if (!cu) return null
              return (
                <div className="comment-row" key={comment.id}>
                  <Link to={`/${cu.username}`} onClick={closePost}>
                    <img className="avatar" src={cu.avatar} alt="" />
                  </Link>
                  <div className="body">
                    <Link to={`/${cu.username}`} className="author" onClick={closePost}>
                      {cu.username}
                    </Link>
                    <span>{comment.text}</span>
                    <div className="meta">
                      <span>{timeAgo(comment.createdAt)}</span>
                      {comment.likes > 0 && <span>{comment.likes} likes</span>}
                      <span>Reply</span>
                    </div>
                  </div>
                  <button className="icon-btn" aria-label="Like comment">
                    <Heart size={12} strokeWidth={1.8} />
                  </button>
                </div>
              )
            })}
          </div>

          <div className="detail-foot">
            <div className="post-actions">
              <div className="left">
                <button
                  className="icon-btn"
                  onClick={() => toggleLike(post.id)}
                  aria-label={liked ? 'Unlike' : 'Like'}
                >
                  <Heart size={24} strokeWidth={1.8} className={liked ? 'heart-active' : ''} />
                </button>
                <button className="icon-btn" aria-label="Comment">
                  <MessageCircle size={24} strokeWidth={1.8} style={{ transform: 'scaleX(-1)' }} />
                </button>
                <button
                  className="icon-btn"
                  onClick={() => showToast('Link copied to clipboard')}
                  aria-label="Share"
                >
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

            <div style={{ padding: '0 14px 8px' }}>
              {post.likedBy.length > 0 && (
                <div className="post-likes">{formatCount(post.likedBy.length)} likes</div>
              )}
              <div className="post-time-small">{timeAgoLong(post.createdAt)}</div>
            </div>

            <div className="add-comment">
              <Smile size={24} strokeWidth={1.6} className="muted" />
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && submit()}
                placeholder="Add a comment…"
                aria-label="Add a comment"
              />
              {draft.trim() && (
                <button className="btn-text" onClick={submit}>
                  Post
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  )
}
