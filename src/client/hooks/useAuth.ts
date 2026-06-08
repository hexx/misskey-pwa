import { useState, useCallback } from 'react'
import { MisskeyService } from '../lib/misskey'
import type { MisskeyUser } from '../types/misskey'

interface AuthState {
  isAuthenticated: boolean
  isLoading: boolean
  user: MisskeyUser | null
  instanceUrl: string | null
  token: string | null
  error: string | null
}

const STORAGE_KEY = 'misskey-auth'

export function useAuth() {
  const [state, setState] = useState<AuthState>(() => {
    // ローカルストレージから認証情報を復元
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        return {
          isAuthenticated: true,
          isLoading: false,
          user: parsed.user,
          instanceUrl: parsed.instanceUrl,
          token: parsed.token,
          error: null,
        }
      } catch {
        return {
          isAuthenticated: false,
          isLoading: false,
          user: null,
          instanceUrl: null,
          token: null,
          error: null,
        }
      }
    }
    return {
      isAuthenticated: false,
      isLoading: false,
      user: null,
      instanceUrl: null,
      token: null,
      error: null,
    }
  })

  const [misskeyService, setMisskeyService] = useState<MisskeyService | null>(() => {
    if (state.instanceUrl && state.token) {
      return new MisskeyService(state.instanceUrl, state.token)
    }
    return null
  })

  // MiAuthフローを開始
  const startMiAuth = useCallback(async (instanceUrl: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const service = new MisskeyService(instanceUrl)
      const sessionId = MisskeyService.generateSessionId()
      const callbackUrl = `${window.location.origin}/auth/callback`
      const authUrl = service.getMiAuthUrl(sessionId, callbackUrl)

      // セッションIDを保存
      sessionStorage.setItem('miauth-session', JSON.stringify({
        sessionId,
        instanceUrl,
      }))

      // MiAuthページにリダイレクト
      window.location.href = authUrl
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Authentication failed',
      }))
    }
  }, [])

  // MiAuthコールバックを処理
  const handleMiAuthCallback = useCallback(async () => {
    const savedSession = sessionStorage.getItem('miauth-session')
    if (!savedSession) {
      return
    }

    const { sessionId, instanceUrl } = JSON.parse(savedSession)
    const service = new MisskeyService(instanceUrl)

    setState(prev => ({ ...prev, isLoading: true }))

    try {
      const result = await service.checkMiAuthSession(sessionId)

      if (result) {
        service.setInstance(instanceUrl, result.token)
        
        const authData = {
          user: result.user,
          instanceUrl,
          token: result.token,
        }

        localStorage.setItem(STORAGE_KEY, JSON.stringify(authData))
        sessionStorage.removeItem('miauth-session')

        setState({
          isAuthenticated: true,
          isLoading: false,
          user: result.user,
          instanceUrl,
          token: result.token,
          error: null,
        })

        setMisskeyService(service)
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Authentication failed',
        }))
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Authentication failed',
      }))
    }
  }, [])

  // ログアウト
  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    sessionStorage.removeItem('miauth-session')
    
    setState({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      instanceUrl: null,
      token: null,
      error: null,
    })

    setMisskeyService(null)
  }, [])

  return {
    ...state,
    misskeyService,
    startMiAuth,
    handleMiAuthCallback,
    logout,
  }
}
