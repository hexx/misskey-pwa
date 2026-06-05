import { APIClient } from 'misskey-js/api'
import type { MisskeyUser, MisskeyNote } from '../types/misskey'

export class MisskeyService {
  private client: APIClient | null = null
  private instanceUrl: string = ''

  constructor(instanceUrl?: string, token?: string) {
    if (instanceUrl) {
      this.setInstance(instanceUrl, token)
    }
  }

  setInstance(url: string, token?: string) {
    // URLを正規化
    this.instanceUrl = url.replace(/\/$/, '')
    
    this.client = new APIClient({
      origin: this.instanceUrl,
      credential: token || undefined,
    })
  }

  getInstanceUrl(): string {
    return this.instanceUrl
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

  // MiAuth URLを生成
  getMiAuthUrl(sessionId: string, callbackUrl: string, name: string = 'Misskey PWA Client'): string {
    const params = new URLSearchParams({
      name,
      callback: callbackUrl,
    })
    return `${this.instanceUrl}/miauth/${sessionId}?${params.toString()}`
  }

  // MiAuthの認証結果を確認
  async checkMiAuthSession(sessionId: string): Promise<{
    token: string
    user: MisskeyUser
  } | null> {
    try {
      const response = await fetch(`${this.instanceUrl}/api/miauth/${sessionId}/check`, {
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

  // ノート一覧を取得（タイムライン）
  async getTimeline(limit: number = 20, untilId?: string): Promise<MisskeyNote[]> {
    if (!this.client) {
      throw new Error('Client not initialized')
    }

    const params: Record<string, unknown> = { limit }
    if (untilId) {
      params.untilId = untilId
    }

    const response = await this.client.request('notes/timeline', params)
    return response as unknown as MisskeyNote[]
  }

  // ノートを投稿
  async postNote(text: string, options?: {
    visibility?: 'public' | 'home' | 'followers' | 'specified'
    cw?: string
    replyId?: string
    renoteId?: string
  }): Promise<MisskeyNote> {
    if (!this.client) {
      throw new Error('Client not initialized')
    }

    const params: Record<string, unknown> = { text }
    if (options) {
      Object.assign(params, options)
    }

    const response = await this.client.request('notes/create', params)
    return (response as { createdNote: MisskeyNote }).createdNote
  }

  // ユーザー情報を取得
  async getMe(): Promise<MisskeyUser> {
    if (!this.client) {
      throw new Error('Client not initialized')
    }

    const response = await this.client.request('i', {})
    return response as unknown as MisskeyUser
  }

  // インスタンス情報を取得
  async getInstanceInfo(): Promise<Record<string, unknown>> {
    if (!this.client) {
      throw new Error('Client not initialized')
    }

    const response = await this.client.request('meta', {})
    return response as Record<string, unknown>
  }
}
