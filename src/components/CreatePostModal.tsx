import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ImagePlus, Loader2, MapPin } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useUI } from '../context/UIContext'
import Modal from './Modal'

interface Item {
  id: string
  url: string
  file?: File
}

/** A sample photo so the demo works even without picking a file. */
const SAMPLE_IMAGE = 'https://picsum.photos/seed/create-' + Math.floor(Math.random() * 999) + '/640/640'

export default function CreatePostModal() {
  const { currentUser, addPost } = useApp()
  const { closeCreate, showToast } = useUI()
  const navigate = useNavigate()
  const fileInput = useRef<HTMLInputElement>(null)

  const [items, setItems] = useState<Item[]>([])
  const [caption, setCaption] = useState('')
  const [location, setLocation] = useState('')
  const [sharing, setSharing] = useState(false)

  const itemsRef = useRef(items)
  itemsRef.current = items

  // Revoke any object URLs we created when the modal unmounts.
  useEffect(() => {
    return () => {
      for (const item of itemsRef.current) {
        if (item.file) URL.revokeObjectURL(item.url)
      }
    }
  }, [])

  const onFiles = (files: FileList | null) => {
    if (!files) return
    const next: Item[] = Array.from(files)
      .filter((f) => f.type.startsWith('image/'))
      .map((file) => ({
        id: crypto.randomUUID(),
        url: URL.createObjectURL(file),
        file,
      }))
    if (next.length) setItems((prev) => [...prev, ...next])
  }

  const share = async () => {
    if (items.length === 0 || sharing) return
    setSharing(true)
    try {
      await addPost({
        files: items.filter((i) => i.file).map((i) => i.file as File),
        imageUrls: items.filter((i) => !i.file).map((i) => i.url),
        caption,
        location: location.trim() || undefined,
      })
      showToast('Your post has been shared.')
      closeCreate()
      navigate(`/${currentUser.username}`)
    } catch {
      showToast('Could not share your post.')
      setSharing(false)
    }
  }

  const composing = items.length > 0

  return (
    <Modal onClose={closeCreate}>
      <div className="create-modal">
        <div className="create-head">
          {composing && !sharing ? (
            <button className="icon-btn" onClick={() => setItems([])} aria-label="Back">
              <ChevronLeft size={24} />
            </button>
          ) : (
            <span style={{ width: 24 }} />
          )}
          <span className="title">Create new post</span>
          {composing ? (
            <button className="btn-text" onClick={share} disabled={sharing}>
              {sharing ? 'Sharing…' : 'Share'}
            </button>
          ) : (
            <span style={{ width: 40 }} />
          )}
        </div>

        <div className="create-body">
          {!composing ? (
            <div
              className="create-drop"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault()
                onFiles(e.dataTransfer.files)
              }}
            >
              <ImagePlus size={88} strokeWidth={1} className="muted" />
              <p>Drag photos here</p>
              <button className="btn-primary" onClick={() => fileInput.current?.click()}>
                Select from computer
              </button>
              <button
                className="btn-secondary"
                onClick={() =>
                  setItems([{ id: crypto.randomUUID(), url: SAMPLE_IMAGE }])
                }
              >
                Use a sample photo
              </button>
              <input
                ref={fileInput}
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={(e) => onFiles(e.target.files)}
              />
            </div>
          ) : (
            <>
              <div className="create-preview">
                <img src={items[0].url} alt="Selected" />
                {sharing && (
                  <div className="create-uploading">
                    <Loader2 size={40} className="spin" />
                  </div>
                )}
              </div>
              <div className="create-side">
                <div className="create-author">
                  <img className="avatar" src={currentUser.avatar} alt="" />
                  {currentUser.username}
                </div>
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Write a caption…"
                  maxLength={2200}
                  autoFocus
                />
                <div className="field">
                  <input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Add location"
                  />
                  <MapPin size={18} className="muted" />
                </div>
                {items.length > 1 && (
                  <div className="thumbs">
                    {items.map((item) => (
                      <img key={item.id} src={item.url} alt="" />
                    ))}
                  </div>
                )}
                <div className="thumbs">
                  <button
                    className="btn-secondary"
                    onClick={() => fileInput.current?.click()}
                  >
                    Add more
                  </button>
                  <input
                    ref={fileInput}
                    type="file"
                    accept="image/*"
                    multiple
                    hidden
                    onChange={(e) => onFiles(e.target.files)}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </Modal>
  )
}
