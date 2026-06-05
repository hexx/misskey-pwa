import type { MisskeyNote } from '../types/misskey'

interface NoteCardProps {
  note: MisskeyNote
}

export function NoteCard({ note }: NoteCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    
    if (seconds < 60) return 'just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    
    return date.toLocaleDateString()
  }

  const formatText = (text: string) => {
    // 改行を<br>に変換
    return text.split('\n').map((line, i) => (
      <span key={i}>
        {line}
        {i < text.split('\n').length - 1 && <br />}
      </span>
    ))
  }

  return (
    <article className="note-card">
      <div className="note-header">
        <div className="note-user">
          {note.user.avatarUrl && (
            <img 
              src={note.user.avatarUrl} 
              alt={note.user.username}
              className="note-avatar"
            />
          )}
          <div className="note-user-info">
            <span className="note-display-name">
              {note.user.name || note.user.username}
            </span>
            <span className="note-username">
              @{note.user.username}
              {note.user.host && <span>@{note.user.host}</span>}
            </span>
          </div>
        </div>
        <time className="note-time" dateTime={note.createdAt}>
          {formatDate(note.createdAt)}
        </time>
      </div>

      {note.cw && (
        <div className="note-cw">
          <span className="cw-text">{note.cw}</span>
          <button className="cw-toggle">Show more</button>
        </div>
      )}

      {note.text && (
        <div className="note-text">
          {formatText(note.text)}
        </div>
      )}

      {note.files && note.files.length > 0 && (
        <div className="note-files">
          {note.files.map((file) => (
            <div key={file.id} className="note-file">
              {file.type.startsWith('image/') ? (
                <img 
                  src={file.thumbnailUrl || file.url} 
                  alt={file.name}
                  loading="lazy"
                />
              ) : (
                <a href={file.url} target="_blank" rel="noopener noreferrer">
                  📎 {file.name}
                </a>
              )}
            </div>
          ))}
        </div>
      )}

      {note.renote && (
        <div className="note-renote">
          <div className="renote-header">
            <span>🔁 Renote</span>
          </div>
          <NoteCard note={note.renote} />
        </div>
      )}

      <div className="note-actions">
        <button className="note-action" title="Reply">
          💬 {note.replyCount > 0 && <span>{note.replyCount}</span>}
        </button>
        <button className="note-action" title="Renote">
          🔁 {note.renoteCount > 0 && <span>{note.renoteCount}</span>}
        </button>
        <button className="note-action" title="Reaction">
          ❤️ {Object.values(note.reactions).reduce((a, b) => a + b, 0) > 0 && (
            <span>{Object.values(note.reactions).reduce((a, b) => a + b, 0)}</span>
          )}
        </button>
      </div>
    </article>
  )
}
