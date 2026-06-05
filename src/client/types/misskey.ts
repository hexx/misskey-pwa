export interface MisskeyUser {
  id: string
  name: string | null
  username: string
  host: string | null
  avatarUrl: string | null
  avatarBlurhash: string | null
  isAdmin: boolean
  isModerator: boolean
  isBot: boolean
  isCat: boolean
  emojis: Record<string, string>
  onlineStatus: 'online' | 'active' | 'offline' | 'unknown'
}

export interface MisskeyNote {
  id: string
  createdAt: string
  text: string | null
  cw: string | null
  user: MisskeyUser
  userId: string
  replyId: string | null
  renoteId: string | null
  reply: MisskeyNote | null
  renote: MisskeyNote | null
  visibility: 'public' | 'home' | 'followers' | 'specified'
  localOnly: boolean
  reactions: Record<string, number>
  reactionEmojis: Record<string, string>
  emojis: Record<string, string>
  fileIds: string[]
  files: MisskeyFile[]
  replyCount: number
  renoteCount: number
  uri?: string
  url?: string
}

export interface MisskeyFile {
  id: string
  createdAt: string
  name: string
  type: string
  md5: string
  size: number
  url: string
  thumbnailUrl: string | null
  comment: string | null
  blurhash: string | null
  isSensitive: boolean
}

export interface MiAuthSession {
  sessionId: string
  instanceUrl: string
  token?: string
  user?: MisskeyUser
  status: 'pending' | 'authenticated' | 'error'
}

export interface MisskeyInstance {
  name: string
  description: string
  url: string
  version: string
  iconUrl: string | null
  themeColor: string | null
}
