import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { Env } from './types'

const app = new Hono<{ Bindings: Env }>()

// ミドルウェアの設定
app.use('*', logger())
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-Misskey-Host'],
}))

// ヘルスチェック
app.get('/api/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Misskey APIプロキシエンドポイント
app.all('/api/proxy/:instance/*', async (c) => {
  const instance = c.req.param('instance')
  const path = c.req.path.replace(`/api/proxy/${instance}`, '')
  
  // インスタンスURLを構築
  const instanceUrl = `https://${instance}`
  const targetUrl = `${instanceUrl}/api${path}`
  
  try {
    // リクエストヘッダーを転送
    const headers = new Headers()
    headers.set('Content-Type', 'application/json')
    
    // Authorizationヘッダーがある場合は転送
    const authHeader = c.req.header('Authorization')
    if (authHeader) {
      headers.set('Authorization', authHeader)
    }
    
    // リクエストボディを取得
    let body: string | undefined
    if (c.req.method !== 'GET' && c.req.method !== 'HEAD') {
      body = await c.req.text()
    }
    
    // Misskey APIにリクエストを転送
    const response = await fetch(targetUrl, {
      method: c.req.method,
      headers,
      body,
    })
    
    // レスポンスを転送
    const data = await response.json()
    return c.json(data, response.status as any)
  } catch (error) {
    console.error('Proxy error:', error)
    return c.json({ error: 'Failed to proxy request' }, 500)
  }
})

// MiAuthセッション確認プロキシ
app.post('/api/miauth/:instance/:session/check', async (c) => {
  const instance = c.req.param('instance')
  const session = c.req.param('session')
  
  const targetUrl = `https://${instance}/api/miauth/${session}/check`
  
  try {
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    const data = await response.json()
    return c.json(data, response.status as any)
  } catch (error) {
    console.error('MiAuth check error:', error)
    return c.json({ error: 'Failed to check MiAuth session' }, 500)
  }
})

// WebSocketストリーミングプロキシ（SSE経由）
app.get('/api/streaming/:instance', async (c) => {
  const instance = c.req.param('instance')
  const channel = c.req.query('channel') || 'homeTimeline'
  const i = c.req.query('i') // 認証トークン
  
  if (!i) {
    return c.json({ error: 'Authentication token required' }, 401)
  }
  
  // SSEストリーミングレスポンスを返す
  return c.stream(async (stream) => {
    const instanceUrl = `wss://${instance}/streaming`
    
    try {
      // WebSocket接続を確立
      // 注意: Cloudflare Workersでは直接WebSocket接続できないため、
      // MisskeyのHTTP-based streaming APIを使用するか、
      // クライアント側で直接WebSocket接続を行う
      
      // 代わりに、ポーリングベースのストリーミングを実装
      let lastNoteId: string | null = null
      
      const pollInterval = setInterval(async () => {
        try {
          const response = await fetch(`https://${instance}/api/notes/timeline`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              i,
              limit: 10,
              sinceId: lastNoteId,
            }),
          })
          
          if (response.ok) {
            const notes = await response.json()
            if (notes.length > 0) {
              lastNoteId = notes[0].id
              
              // SSE形式でデータを送信
              for (const note of notes) {
                stream.write(`data: ${JSON.stringify({ type: 'note', body: note })}\n\n`)
              }
            }
          }
        } catch (error) {
          console.error('Polling error:', error)
        }
      }, 5000) // 5秒間隔でポーリング
      
      // クライアント切断時にクリーンアップ
      stream.onAbort(() => {
        clearInterval(pollInterval)
      })
      
      // 接続を維持
      while (true) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    } catch (error) {
      console.error('Streaming error:', error)
      stream.write(`data: ${JSON.stringify({ error: 'Streaming failed' })}\n\n`)
    }
  },
  {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
})

// Reactアプリケーションの配信（本番環境用）
app.get('*', async (c) => {
  // 静的アセットはWorkers Static Assets機能で配信される
  // ここではSPAのフォールバックとしてindex.htmlを返す
  try {
    // Workers Static Assetsからindex.htmlを取得
    if (c.env?.ASSETS) {
      const response = await c.env.ASSETS.fetch(c.req.url)
      if (response.ok) {
        return response
      }
    }
    
    // フォールバック: index.htmlを返す
    return c.html(`
<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Misskey PWA Client</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/client/main.tsx"></script>
  </body>
</html>
    `)
  } catch {
    return c.text('Not Found', 404)
  }
})

export default app
