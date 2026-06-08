import type { MisskeyUser, MisskeyNote } from '../types/misskey'

// プロキシのベースURL（開発環境と本番環境で異なる）
const getProxyBaseUrl = (): string => {
  // 開発環境ではViteの開発サーバーを使用
  if (import.meta.env.DEV) {
    return ''
  }
  // 本番環境では同じオリジンのプロキシを使用
  return window.location.origin
}

export class MisskeyService {
  private instanceHost: string = ''
  private token: string | null = null
  private proxyBaseUrl: string = ''

  constructor(instanceUrl?: string, token?: string) {
    this.proxyBaseUrl = getProxyBaseUrl()
    if (instanceUrl) {
      this.setInstance(instanceUrl, token)
    }
  }

  setInstance(url: string, token?: string) {
    // URLからホスト名のみを抽出
    try {
      const urlObj = new URL(url)
      this.instanceHost = urlObj.host
    } catch {
      // URLでない場合はそのまま使用
      this.instanceHost = url.replace(/^https?:\/\//, '').replace(/\/$/, '')
    }
    this.token = token || null
  }

  getInstanceUrl(): string {
    return `https://${this.instanceHost}`
  }

  getInstanceHost(): string {
    return this.instanceHost
  }

  // プロキシ経由でAPIリクエストを送信
  private async proxyRequest(endpoint: string, body?: Record<string, unknown>): Promise<unknown> {
    const url = `${this.proxyBaseUrl}/api/proxy/${this.instanceHost}${endpoint}`
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }
    
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: body ? JSON.stringify(body) : undefined,
    })
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }))
      throw new Error(error.error || `API request failed: ${response.status}`)
    }
    
    return response.json()
  }

  // MiAuth用のセッションIDを生成
  static generateSessionId(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  // MiAuth URLを生成（直接インスタンスにリダイレクト）
  getMiAuthUrl(sessionId: string, callbackUrl: string, name: string = 'Misskey PWA Client'): string {
    const params = new URLSearchParams({
      name,
      callback: callbackUrl,
    })
    return `${this.getInstanceUrl()}/miauth/${sessionId}?${params.toString()}`
  }

  // MiAuthの認証結果を確認（プロキシ経由）
  async checkMiAuthSession(sessionId: string): Promise<{
    token: string
    user: MisskeyUser
  } | null> {
    try {
      const url = `${this.proxyBaseUrl}/api/miauth/${this.instanceHost}/${sessionId}/check`
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to check MiAuth session')
      }

      const data = await response.json()

      if (data.ok && data.token) {
        this.token = data.token
        return {
          token: data.token,
          user: data.user,
        }
      }

      return null
    } catch (error) {
      console.error('MiAuth check error:', error)
      return null
    }
  }

  // ノート一覧を取得（タイムライン）- プロキシ経由
  async getTimeline(limit: number = 20, untilId?: string): Promise<MisskeyNote[]> {
    const params: Record<string, unknown> = { limit }
    if (untilId) {
      params.untilId = untilId
    }

    const response = await this.proxyRequest('/notes/timeline', params)
    return response as MisskeyNote[]
  }

  // ノートを投稿 - プロキシ経由
  async postNote(text: string, options?: {
    visibility?: 'public' | 'home' | 'followers' | 'specified'
    cw?: string
    replyId?: string
    renoteId?: string
  }): Promise<MisskeyNote> {
    const params: Record<string, unknown> = { text }
    if (options) {
      Object.assign(params, options)
    }

    const response = await this.proxyRequest('/notes/create', params) as { createdNote: MisskeyNote }
    return response.createdNote
  }

  // ユーザー情報を取得 - プロキシ経由
  async getMe(): Promise<MisskeyUser> {
    const response = await this.proxyRequest('/i', {})
    return response as MisskeyUser
  }

  // インスタンス情報を取得 - プロキシ経由
  async getInstanceInfo(): Promise<Record<string, unknown>> {
    const response = await this.proxyRequest('/meta', {})
    return response as Record<string, unknown>
  }

  // SSEストリーミング接続を取得
  getStreamingUrl(channel: string = 'homeTimeline'): string {
    if (!this.token) {
      throw new Error('Authentication required for streaming')
    }
    return `${this.proxyBaseUrl}/api/streaming/${this.instanceHost}?channel=${channel}&i=${encodeURIComponent(this.token)}`
  }
}
