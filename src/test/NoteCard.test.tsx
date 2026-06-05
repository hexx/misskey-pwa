import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { NoteCard } from '../client/components/NoteCard'
import type { MisskeyNote } from '../client/types/misskey'

const mockNote: MisskeyNote = {
  id: '1',
  createdAt: new Date().toISOString(),
  text: 'This is a test note',
  cw: null,
  user: {
    id: 'user1',
    name: 'Test User',
    username: 'testuser',
    host: null,
    avatarUrl: 'https://example.com/avatar.png',
    avatarBlurhash: null,
    isAdmin: false,
    isModerator: false,
    isBot: false,
    isCat: false,
    emojis: {},
    onlineStatus: 'online',
  },
  userId: 'user1',
  replyId: null,
  renoteId: null,
  reply: null,
  renote: null,
  visibility: 'public',
  localOnly: false,
  reactions: { '👍': 5, '❤️': 3 },
  reactionEmojis: {},
  emojis: {},
  fileIds: [],
  files: [],
  replyCount: 2,
  renoteCount: 1,
}

describe('NoteCard Component', () => {
  it('renders note text', () => {
    render(<NoteCard note={mockNote} />)
    expect(screen.getByText('This is a test note')).toBeInTheDocument()
  })

  it('renders user information', () => {
    render(<NoteCard note={mockNote} />)
    expect(screen.getByText('Test User')).toBeInTheDocument()
    expect(screen.getByText(/@testuser/)).toBeInTheDocument()
  })

  it('renders avatar image', () => {
    render(<NoteCard note={mockNote} />)
    const avatar = screen.getByAltText('testuser')
    expect(avatar).toHaveAttribute('src', 'https://example.com/avatar.png')
  })

  it('renders reaction count', () => {
    render(<NoteCard note={mockNote} />)
    expect(screen.getByText('8')).toBeInTheDocument()
  })

  it('renders reply count', () => {
    render(<NoteCard note={mockNote} />)
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('renders renote count', () => {
    render(<NoteCard note={mockNote} />)
    expect(screen.getByText('1')).toBeInTheDocument()
  })

  it('renders CW when present', () => {
    const noteWithCW: MisskeyNote = {
      ...mockNote,
      cw: 'Sensitive content',
      text: 'Hidden text',
    }
    
    render(<NoteCard note={noteWithCW} />)
    expect(screen.getByText('Sensitive content')).toBeInTheDocument()
    expect(screen.getByText('Show more')).toBeInTheDocument()
  })

  it('renders file attachments', () => {
    const noteWithFile: MisskeyNote = {
      ...mockNote,
      files: [
        {
          id: 'file1',
          createdAt: new Date().toISOString(),
          name: 'test.png',
          type: 'image/png',
          md5: 'abc123',
          size: 1024,
          url: 'https://example.com/test.png',
          thumbnailUrl: 'https://example.com/thumb.png',
          comment: null,
          blurhash: null,
          isSensitive: false,
        },
      ],
    }
    
    render(<NoteCard note={noteWithFile} />)
    const image = screen.getByAltText('test.png')
    expect(image).toHaveAttribute('src', 'https://example.com/thumb.png')
  })

  it('renders renote content', () => {
    const noteWithRenote: MisskeyNote = {
      ...mockNote,
      renote: {
        ...mockNote,
        id: '2',
        text: 'This is a renote',
      },
    }
    
    render(<NoteCard note={noteWithRenote} />)
    expect(screen.getByText('This is a renote')).toBeInTheDocument()
    expect(screen.getByText('🔁 Renote')).toBeInTheDocument()
  })
})
