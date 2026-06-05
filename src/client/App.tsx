import { useState, useEffect } from 'react'
import { LoginForm } from './components/LoginForm'
import { AuthCallback } from './components/AuthCallback'
import { Timeline } from './components/Timeline'
import { useAuth } from './hooks/useAuth'

function App() {
  const { 
    isAuthenticated, 
    isLoading, 
    user, 
    instanceUrl,
    misskeyService,
    error,
    startMiAuth, 
    handleMiAuthCallback, 
    logout 
  } = useAuth()
  
  const [currentPath, setCurrentPath] = useState(window.location.pathname)

  // URLの変更を監視
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname)
    }
    
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  // 認証コールバックページの処理
  if (currentPath === '/auth/callback') {
    return <AuthCallback onCallback={handleMiAuthCallback} />
  }

  // 未認証の場合はログインフォームを表示
  if (!isAuthenticated) {
    return (
      <div className="app">
        <header>
          <h1>Misskey PWA Client</h1>
        </header>
        <main>
          <LoginForm 
            onLogin={startMiAuth}
            isLoading={isLoading}
            error={error}
          />
        </main>
      </div>
    )
  }

  // 認証済みの場合はメインアプリを表示
  return (
    <div className="app">
      <header>
        <div className="header-content">
          <h1>Misskey PWA Client</h1>
          <div className="user-info">
            {user?.avatarUrl && (
              <img 
                src={user.avatarUrl} 
                alt={user.username} 
                className="avatar"
              />
            )}
            <div className="user-details">
              <span className="display-name">
                {user?.name || user?.username}
              </span>
              <span className="instance">
                @{user?.username}@{instanceUrl ? new URL(instanceUrl).hostname : ''}
              </span>
            </div>
            <button onClick={logout} className="logout-btn">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main>
        {misskeyService && <Timeline misskeyService={misskeyService} />}
      </main>

      <footer>
        <p>Powered by Misskey, React, and Hono</p>
      </footer>
    </div>
  )
}

export default App
