import { useApp } from '../context/AppContext'
import Stories from '../components/Stories'
import Post from '../components/Post'
import Suggestions from '../components/Suggestions'

export default function Home() {
  const { posts } = useApp()

  return (
    <div className="home">
      <div className="home-feed">
        <Stories />
        {posts.map((post) => (
          <Post key={post.id} post={post} />
        ))}
      </div>
      <Suggestions />
    </div>
  )
}
