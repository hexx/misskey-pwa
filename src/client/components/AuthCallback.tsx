import { useEffect } from 'react'

interface AuthCallbackProps {
  onCallback: () => void
}

export function AuthCallback({ onCallback }: AuthCallbackProps) {
  useEffect(() => {
    onCallback()
  }, [onCallback])

  return (
    <div className="auth-callback">
      <div className="loading-spinner" />
      <p>Completing authentication...</p>
    </div>
  )
}
