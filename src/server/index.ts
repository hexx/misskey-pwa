import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'

const app = new Hono()

// ミドルウェアの設定
app.use('*', logger())
app.use('*', cors({
  origin: ['http://localhost:3000', 'https://misskey-pwa.pages.dev'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}))

// APIルート
app.get('/api/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Misskey APIプロキシルート（認証コールバック処理用）
app.post('/api/auth/callback', async (c) => {
  const body = await c.req.json()
  // MiAuthのコールバック処理（Step 3で実装）
  return c.json({ success: true, data: body })
})

// Reactアプリケーションの配信（本番環境用）
app.get('*', async (c) => {
  // 静的ファイルはビルド時にdistに配置される
  // 開発環境ではViteが処理
  try {
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
