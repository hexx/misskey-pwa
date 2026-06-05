import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { LoginForm } from '../client/components/LoginForm'

describe('LoginForm Component', () => {
  it('renders login form title', () => {
    const mockLogin = vi.fn()
    render(<LoginForm onLogin={mockLogin} isLoading={false} error={null} />)
    
    expect(screen.getByText('Login to Misskey')).toBeInTheDocument()
  })

  it('renders instance URL input', () => {
    const mockLogin = vi.fn()
    render(<LoginForm onLogin={mockLogin} isLoading={false} error={null} />)
    
    expect(screen.getByLabelText('Instance URL')).toBeInTheDocument()
  })

  it('renders default instance URL', () => {
    const mockLogin = vi.fn()
    render(<LoginForm onLogin={mockLogin} isLoading={false} error={null} />)
    
    const input = screen.getByLabelText('Instance URL')
    expect(input).toHaveValue('https://misskey.io')
  })

  it('renders submit button', () => {
    const mockLogin = vi.fn()
    render(<LoginForm onLogin={mockLogin} isLoading={false} error={null} />)
    
    expect(screen.getByText('Login with MiAuth')).toBeInTheDocument()
  })

  it('calls onLogin with instance URL', () => {
    const mockLogin = vi.fn()
    render(<LoginForm onLogin={mockLogin} isLoading={false} error={null} />)
    
    const input = screen.getByLabelText('Instance URL')
    fireEvent.change(input, { target: { value: 'https://misskey.example.com' } })
    
    const submitButton = screen.getByText('Login with MiAuth')
    fireEvent.click(submitButton)
    
    expect(mockLogin).toHaveBeenCalledWith('https://misskey.example.com')
  })

  it('shows loading state', () => {
    const mockLogin = vi.fn()
    render(<LoginForm onLogin={mockLogin} isLoading={true} error={null} />)
    
    expect(screen.getByText('Connecting...')).toBeInTheDocument()
    expect(screen.getByText('Connecting...')).toBeDisabled()
  })

  it('shows error message', () => {
    const mockLogin = vi.fn()
    render(<LoginForm onLogin={mockLogin} isLoading={false} error="Connection failed" />)
    
    expect(screen.getByText('Connection failed')).toBeInTheDocument()
  })

  it('disables input when loading', () => {
    const mockLogin = vi.fn()
    render(<LoginForm onLogin={mockLogin} isLoading={true} error={null} />)
    
    const input = screen.getByLabelText('Instance URL')
    expect(input).toBeDisabled()
  })

  it('renders help text', () => {
    const mockLogin = vi.fn()
    render(<LoginForm onLogin={mockLogin} isLoading={false} error={null} />)
    
    expect(screen.getByText(/MiAuth is a secure authentication method/)).toBeInTheDocument()
  })
})
