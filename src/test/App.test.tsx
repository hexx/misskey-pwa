import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from '../client/App'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      store = {}
    }),
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

describe('App Component', () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
  })

  it('renders the app title', () => {
    render(<App />)
    expect(screen.getByText('Misskey PWA Client')).toBeInTheDocument()
  })

  it('shows login form when not authenticated', () => {
    render(<App />)
    expect(screen.getByText('Login to Misskey')).toBeInTheDocument()
    expect(screen.getByLabelText('Instance URL')).toBeInTheDocument()
  })

  it('shows login button', () => {
    render(<App />)
    expect(screen.getByText('Login with MiAuth')).toBeInTheDocument()
  })

  it('shows help text', () => {
    render(<App />)
    expect(screen.getByText(/MiAuth is a secure authentication method/)).toBeInTheDocument()
  })

  it('shows default instance URL', () => {
    render(<App />)
    const input = screen.getByLabelText('Instance URL')
    expect(input).toHaveValue('https://misskey.io')
  })
})
