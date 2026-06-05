import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { NoteForm } from '../client/components/NoteForm'

describe('NoteForm Component', () => {
  it('renders textarea', () => {
    const mockSubmit = vi.fn()
    render(<NoteForm onSubmit={mockSubmit} isPosting={false} />)
    
    expect(screen.getByPlaceholderText("What's on your mind?")).toBeInTheDocument()
  })

  it('renders submit button', () => {
    const mockSubmit = vi.fn()
    render(<NoteForm onSubmit={mockSubmit} isPosting={false} />)
    
    expect(screen.getByText('Post')).toBeInTheDocument()
  })

  it('renders visibility buttons', () => {
    const mockSubmit = vi.fn()
    render(<NoteForm onSubmit={mockSubmit} isPosting={false} />)
    
    expect(screen.getByTitle('Public')).toBeInTheDocument()
    expect(screen.getByTitle('Home')).toBeInTheDocument()
    expect(screen.getByTitle('Followers')).toBeInTheDocument()
    expect(screen.getByTitle('Direct')).toBeInTheDocument()
  })

  it('renders CW button', () => {
    const mockSubmit = vi.fn()
    render(<NoteForm onSubmit={mockSubmit} isPosting={false} />)
    
    expect(screen.getByText('CW')).toBeInTheDocument()
  })

  it('submits note text', async () => {
    const mockSubmit = vi.fn().mockResolvedValue(undefined)
    render(<NoteForm onSubmit={mockSubmit} isPosting={false} />)
    
    const textarea = screen.getByPlaceholderText("What's on your mind?")
    fireEvent.change(textarea, { target: { value: 'Hello, Misskey!' } })
    
    const submitButton = screen.getByText('Post')
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith('Hello, Misskey!', {
        visibility: 'public',
        cw: undefined,
      })
    })
  })

  it('clears textarea after successful submission', async () => {
    const mockSubmit = vi.fn().mockResolvedValue(undefined)
    render(<NoteForm onSubmit={mockSubmit} isPosting={false} />)
    
    const textarea = screen.getByPlaceholderText("What's on your mind?")
    fireEvent.change(textarea, { target: { value: 'Hello, Misskey!' } })
    
    const submitButton = screen.getByText('Post')
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(textarea).toHaveValue('')
    })
  })

  it('shows character count', () => {
    const mockSubmit = vi.fn()
    render(<NoteForm onSubmit={mockSubmit} isPosting={false} />)
    
    const textarea = screen.getByPlaceholderText("What's on your mind?")
    fireEvent.change(textarea, { target: { value: 'Hello' } })
    
    expect(screen.getByText('5 / 3000')).toBeInTheDocument()
  })

  it('shows CW input when CW button is clicked', () => {
    const mockSubmit = vi.fn()
    render(<NoteForm onSubmit={mockSubmit} isPosting={false} />)
    
    const cwButton = screen.getByText('CW')
    fireEvent.click(cwButton)
    
    expect(screen.getByPlaceholderText('Content warning (optional)')).toBeInTheDocument()
  })

  it('disables submit button when posting', () => {
    const mockSubmit = vi.fn()
    render(<NoteForm onSubmit={mockSubmit} isPosting={true} />)
    
    const submitButton = screen.getByText('Posting...')
    expect(submitButton).toBeDisabled()
  })

  it('disables submit button when text is empty', () => {
    const mockSubmit = vi.fn()
    render(<NoteForm onSubmit={mockSubmit} isPosting={false} />)
    
    const submitButton = screen.getByText('Post')
    expect(submitButton).toBeDisabled()
  })

  it('changes visibility', () => {
    const mockSubmit = vi.fn()
    render(<NoteForm onSubmit={mockSubmit} isPosting={false} />)
    
    const textarea = screen.getByPlaceholderText("What's on your mind?")
    fireEvent.change(textarea, { target: { value: 'Hello' } })
    
    const homeButton = screen.getByTitle('Home')
    fireEvent.click(homeButton)
    
    const submitButton = screen.getByText('Post')
    fireEvent.click(submitButton)
    
    expect(mockSubmit).toHaveBeenCalledWith('Hello', {
      visibility: 'home',
      cw: undefined,
    })
  })
})
