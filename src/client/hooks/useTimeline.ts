import { useState, useEffect, useCallback, useRef } from 'react'
import { MisskeyService } from '../lib/misskey'
import type { MisskeyNote } from '../types/misskey'

interface UseTimelineOptions {
  limit?: number
  enableStreaming?: boolean
}

export function useTimeline(
  misskeyService: MisskeyService | null,
  options: UseTimelineOptions = {}
) {
  const { limit = 20, enableStreaming = false } = options
  
  const [notes, setNotes] = useState<MisskeyNote[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const lastNoteIdRef = useRef<string | null>(null)
  const wsRef = useRef<WebSocket | null>(null)

  // タイムラインを取得
  const fetchTimeline = useCallback(async (untilId?: string) => {
    if (!misskeyService) {
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const newNotes = await misskeyService.getTimeline(limit, untilId)
      
      if (untilId) {
        // 追加読み込み
        setNotes(prev => [...prev, ...newNotes])
      } else {
        // 初回読み込み
        setNotes(newNotes)
      }

      if (newNotes.length > 0) {
        lastNoteIdRef.current = newNotes[newNotes.length - 1].id
      }

      setHasMore(newNotes.length >= limit)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch timeline')
    } finally {
      setIsLoading(false)
    }
  }, [misskeyService, limit])

  // さらに読み込む
  const loadMore = useCallback(() => {
    if (lastNoteIdRef.current && !isLoading) {
      fetchTimeline(lastNoteIdRef.current)
    }
  }, [fetchTimeline, isLoading])

  // ノートを投稿
  const postNote = useCallback(async (text: string, options?: {
    visibility?: 'public' | 'home' | 'followers' | 'specified'
    cw?: string
  }) => {
    if (!misskeyService) {
      throw new Error('Not authenticated')
    }

    try {
      const newNote = await misskeyService.postNote(text, options)
      // 投稿後、タイムラインを更新
      setNotes(prev => [newNote, ...prev])
      return newNote
    } catch (err) {
      throw err
    }
  }, [misskeyService])

  // WebSocketストリーミング（オプション）
  useEffect(() => {
    if (!enableStreaming || !misskeyService) {
      return
    }

    const instanceUrl = misskeyService.getInstanceUrl()
    if (!instanceUrl) {
      return
    }

    // WebSocket接続を確立
    const wsUrl = instanceUrl.replace(/^http/, 'ws') + '/streaming'
    
    try {
      const ws = new WebSocket(wsUrl)
      wsRef.current = ws

      ws.onopen = () => {
        console.log('WebSocket connected')
        // タイムラインチャンネルに接続
        ws.send(JSON.stringify({
          type: 'connect',
          body: {
            channel: 'homeTimeline',
            id: 'timeline',
          },
        }))
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          
          if (data.type === 'channel' && data.body?.type === 'note') {
            const newNote = data.body.body as MisskeyNote
            setNotes(prev => [newNote, ...prev.slice(0, limit - 1)])
          }
        } catch {
          // メッセージのパースに失敗した場合は無視
        }
      }

      ws.onerror = (error) => {
        console.error('WebSocket error:', error)
      }

      ws.onclose = () => {
        console.log('WebSocket disconnected')
      }
    } catch {
      console.error('Failed to connect WebSocket')
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close()
        wsRef.current = null
      }
    }
  }, [enableStreaming, misskeyService, limit])

  // 初回読み込み
  useEffect(() => {
    fetchTimeline()
  }, [fetchTimeline])

  return {
    notes,
    isLoading,
    error,
    hasMore,
    loadMore,
    postNote,
    refresh: () => fetchTimeline(),
  }
}
