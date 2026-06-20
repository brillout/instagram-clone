import { useCallback, useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useUI } from '../context/UIContext'
import { timeAgo } from '../utils/time'
import Modal from './Modal'

const STORY_DURATION = 5000

export default function StoryViewer() {
  const { stories, getUser, markStorySeen } = useApp()
  const { storyIndex, openStory, closeStory } = useUI()
  const [index, setIndex] = useState(storyIndex ?? 0)

  useEffect(() => {
    if (storyIndex !== null) setIndex(storyIndex)
  }, [storyIndex])

  const story = stories[index]

  const goNext = useCallback(() => {
    if (index < stories.length - 1) {
      setIndex((i) => i + 1)
    } else {
      closeStory()
    }
  }, [index, stories.length, closeStory])

  const goPrev = useCallback(() => {
    setIndex((i) => Math.max(0, i - 1))
  }, [])

  // Mark seen + auto-advance timer (restarts whenever the story changes).
  useEffect(() => {
    if (!story) return
    markStorySeen(story.id)
    const timer = window.setTimeout(goNext, STORY_DURATION)
    return () => window.clearTimeout(timer)
  }, [story, markStorySeen, goNext])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goNext()
      if (e.key === 'ArrowLeft') goPrev()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [goNext, goPrev])

  if (storyIndex === null || !story) return null
  const user = getUser(story.userId)
  if (!user) return null

  return (
    <Modal onClose={closeStory}>
      <div className="story-viewer">
        <div className="story-progress">
          {/* key forces the fill animation to restart on each story */}
          <div className="bar" key={story.id} />
        </div>
        <div className="story-viewer-head">
          <img src={user.avatar} alt="" />
          <span className="name">{user.username}</span>
          <span className="time">{timeAgo(story.createdAt)}</span>
        </div>

        <img className="bg" src={story.image} alt={`${user.username}'s story`} />

        <button
          className="story-nav left"
          onClick={() => openStory(index - 1)}
          disabled={index === 0}
          aria-label="Previous story"
        />
        <button className="story-nav right" onClick={goNext} aria-label="Next story" />

        {index > 0 && (
          <button
            className="carousel-btn prev"
            style={{ top: '50%' }}
            onClick={goPrev}
            aria-label="Previous"
          >
            <ChevronLeft size={18} />
          </button>
        )}
        {index < stories.length - 1 && (
          <button
            className="carousel-btn next"
            style={{ top: '50%' }}
            onClick={goNext}
            aria-label="Next"
          >
            <ChevronRight size={18} />
          </button>
        )}
      </div>
    </Modal>
  )
}
