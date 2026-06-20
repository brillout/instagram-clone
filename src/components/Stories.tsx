import { Plus } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useUI } from '../context/UIContext'

export default function Stories() {
  const { stories, getUser, currentUser } = useApp()
  const { openStory } = useUI()

  return (
    <div className="stories">
      <div className="story is-you">
        <div className="story-you-wrap">
          <div className="story-ring seen">
            <div className="story-ring-inner">
              <img className="story-avatar" src={currentUser.avatar} alt="" />
            </div>
          </div>
          <span className="story-add">
            <Plus size={14} strokeWidth={3} />
          </span>
        </div>
        <span className="story-name">Your story</span>
      </div>

      {stories.map((story, index) => {
        const user = getUser(story.userId)
        if (!user) return null
        return (
          <button
            key={story.id}
            className="story"
            onClick={() => openStory(index)}
            aria-label={`View ${user.username}'s story`}
          >
            <div className={`story-ring ${story.seen ? 'seen' : ''}`}>
              <div className="story-ring-inner">
                <img className="story-avatar" src={user.avatar} alt="" />
              </div>
            </div>
            <span className="story-name">{user.username}</span>
          </button>
        )
      })}
    </div>
  )
}
