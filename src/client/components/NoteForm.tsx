import { useState, FormEvent } from 'react'

interface NoteFormProps {
  onSubmit: (text: string, options?: {
    visibility?: 'public' | 'home' | 'followers' | 'specified'
    cw?: string
  }) => Promise<void>
  isPosting: boolean
}

export function NoteForm({ onSubmit, isPosting }: NoteFormProps) {
  const [text, setText] = useState('')
  const [visibility, setVisibility] = useState<'public' | 'home' | 'followers' | 'specified'>('public')
  const [showCw, setShowCw] = useState(false)
  const [cw, setCw] = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    
    if (!text.trim() || isPosting) {
      return
    }

    try {
      await onSubmit(text, {
        visibility,
        cw: showCw ? cw : undefined,
      })
      setText('')
      setCw('')
      setShowCw(false)
    } catch (error) {
      console.error('Failed to post note:', error)
    }
  }

  const visibilityOptions = [
    { value: 'public' as const, icon: '🌐', label: 'Public' },
    { value: 'home' as const, icon: '🏠', label: 'Home' },
    { value: 'followers' as const, icon: '👥', label: 'Followers' },
    { value: 'specified' as const, icon: '🔒', label: 'Direct' },
  ]

  return (
    <form className="note-form" onSubmit={handleSubmit}>
      <div className="form-header">
        <div className="visibility-selector">
          {visibilityOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`visibility-btn ${visibility === option.value ? 'active' : ''}`}
              onClick={() => setVisibility(option.value)}
              title={option.label}
            >
              {option.icon}
            </button>
          ))}
        </div>
        <button
          type="button"
          className={`cw-btn ${showCw ? 'active' : ''}`}
          onClick={() => setShowCw(!showCw)}
          title="Content Warning"
        >
          CW
        </button>
      </div>

      {showCw && (
        <input
          type="text"
          className="cw-input"
          placeholder="Content warning (optional)"
          value={cw}
          onChange={(e) => setCw(e.target.value)}
        />
      )}

      <textarea
        className="note-textarea"
        placeholder="What's on your mind?"
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={4}
        disabled={isPosting}
      />

      <div className="form-footer">
        <div className="char-count">
          {text.length > 0 && (
            <span className={text.length > 3000 ? 'limit-exceeded' : ''}>
              {text.length} / 3000
            </span>
          )}
        </div>
        <button 
          type="submit" 
          className="submit-btn"
          disabled={!text.trim() || isPosting || text.length > 3000}
        >
          {isPosting ? 'Posting...' : 'Post'}
        </button>
      </div>
    </form>
  )
}
