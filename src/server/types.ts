export interface Env {
  ASSETS?: {
    fetch: (input: RequestInfo, init?: RequestInit) => Promise<Response>
  }
  NODE_ENV?: string
}
