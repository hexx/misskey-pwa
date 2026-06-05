import { NoteCard } from './NoteCard'
import { NoteForm } from './NoteForm'
import { useTimeline } from '../hooks/useTimeline'
import type { MisskeyService } from '../lib/misskey'

interface TimelineProps {
  misskeyService: MisskeyService
}

export function Timeline({ misskeyService }: TimelineProps) {
  const {
    notes,
    isLoading,
    error,
    hasMore,
    loadMore,
    postNote,
    refresh,
  } = useTimeline(misskeyService, {
    limit: 20,
    enableStreaming: true,
  })

  const handlePostNote = async (text: string, options?: {
    visibility?: 'public' | 'home' | 'followers' | 'specified'
    cw?: string
  }) => {
    await postNote(text, options)
  }

  return (
    <div className="timeline">
      <div className="timeline-header">
        <h2>Timeline</h2>
        <button 
          className="refresh-btn" 
          onClick={refresh}
          disabled={isLoading}
        >
          🔄 Refresh
        </button>
      </div>

      <NoteForm 
        onSubmit={handlePostNote}
        isPosting={isLoading}
      />

      {error && (
        <div className="timeline-error">
          <p>Error: {error}</p>
          <button onClick={refresh}>Try Again</button>
        </div>
      )}

      <div className="notes-list">
        {notes.map((note) => (
          <NoteCard key={note.id} note={note} />
        ))}
      </div>

      {isLoading && (
        <div className="loading-indicator">
          <div className="loading-spinner" />
          <p>Loading notes...</p>
        </div>
      )}

      {hasMore && !isLoading && (
        <button 
          className="load-more-btn"
          onClick={loadMore}
        >
          Load More
        </button>
      )}

      {!hasMore && notes.length > 0 && (
        <div className="end-of-timeline">
          <p>You've reached the end</p>
        </div>
      )}

      {notes.length === 0 && !isLoading && !error && (
        <div className="empty-timeline">
          <p>No notes yet</p>
          <p>Follow some users or post your first note!</p>
        </div>
      )}
    </div>
  )
}
