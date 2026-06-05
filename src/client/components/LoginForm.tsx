import { useState, FormEvent } from 'react'

interface LoginFormProps {
  onLogin: (instanceUrl: string) => void
  isLoading: boolean
  error: string | null
}

export function LoginForm({ onLogin, isLoading, error }: LoginFormProps) {
  const [instanceUrl, setInstanceUrl] = useState('https://misskey.io')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (instanceUrl.trim()) {
      onLogin(instanceUrl.trim())
    }
  }

  return (
    <div className="login-form">
      <h2>Login to Misskey</h2>
      <p>Enter your Misskey instance URL to get started</p>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="instance-url">Instance URL</label>
          <input
            id="instance-url"
            type="url"
            value={instanceUrl}
            onChange={(e) => setInstanceUrl(e.target.value)}
            placeholder="https://misskey.io"
            required
            disabled={isLoading}
          />
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Connecting...' : 'Login with MiAuth'}
        </button>
      </form>

      <div className="help-text">
        <p>
          MiAuth is a secure authentication method for Misskey.
          You will be redirected to your instance to authorize this app.
        </p>
      </div>
    </div>
  )
}
