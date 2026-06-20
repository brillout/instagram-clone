import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ImagePlus, Loader2, MapPin } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useUI } from '../context/UIContext'
import { fileToScaledDataUrl } from '../utils/image'
import Modal from './Modal'

/** A couple of stock images so the demo works even without picking a file. */
const SAMPLE_IMAGES = [
  'https://picsum.photos/seed/create-a/640/640',
  'https://picsum.photos/seed/create-b/640/640',
  'https://picsum.photos/seed/create-c/640/640',
]

export default function CreatePostModal() {
  const { currentUser, addPost } = useApp()
  const { closeCreate, showToast } = useUI()
  const navigate = useNavigate()
  const fileInput = useRef<HTMLInputElement>(null)

  const [images, setImages] = useState<string[]>([])
  const [caption, setCaption] = useState('')
  const [location, setLocation] = useState('')
  const [processing, setProcessing] = useState(false)

  const onFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    const imageFiles = Array.from(files).filter((f) => f.type.startsWith('image/'))
    if (imageFiles.length === 0) return
    setProcessing(true)
    try {
      const urls = await Promise.all(imageFiles.map(fileToScaledDataUrl))
      setImages((prev) => [...prev, ...urls])
    } catch {
      showToast('Could not process that image.')
    } finally {
      setProcessing(false)
    }
  }

  const share = () => {
    if (images.length === 0) return
    addPost({ images, caption, location: location.trim() || undefined })
    showToast('Your post has been shared.')
    closeCreate()
    navigate(`/${currentUser.username}`)
  }

  const composing = images.length > 0

  return (
    <Modal onClose={closeCreate}>
      <div className="create-modal">
        <div className="create-head">
          {composing ? (
            <button className="icon-btn" onClick={() => setImages([])} aria-label="Back">
              <ChevronLeft size={24} />
            </button>
          ) : (
            <span style={{ width: 24 }} />
          )}
          <span className="title">{composing ? 'Create new post' : 'Create new post'}</span>
          {composing ? (
            <button className="btn-text" onClick={share}>
              Share
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
              {processing ? (
                <Loader2 size={56} className="muted spin" />
              ) : (
                <ImagePlus size={88} strokeWidth={1} className="muted" />
              )}
              <p>{processing ? 'Processing…' : 'Drag photos here'}</p>
              <button
                className="btn-primary"
                disabled={processing}
                onClick={() => fileInput.current?.click()}
              >
                Select from computer
              </button>
              <button
                className="btn-secondary"
                onClick={() => setImages([SAMPLE_IMAGES[0]])}
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
                <img src={images[0]} alt="Selected" />
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
                {images.length > 1 && (
                  <div className="thumbs">
                    {images.map((src, i) => (
                      <img key={i} src={src} alt={`Selected ${i + 1}`} />
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
