import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MisskeyService } from '../client/lib/misskey'

describe('MisskeyService', () => {
  let service: MisskeyService

  beforeEach(() => {
    service = new MisskeyService()
  })

  describe('generateSessionId', () => {
    it('generates a 32 character string', () => {
      const sessionId = MisskeyService.generateSessionId()
      expect(sessionId).toHaveLength(32)
    })

    it('generates unique session IDs', () => {
      const id1 = MisskeyService.generateSessionId()
      const id2 = MisskeyService.generateSessionId()
      expect(id1).not.toBe(id2)
    })
  })

  describe('setInstance', () => {
    it('sets instance URL', () => {
      service.setInstance('https://misskey.io')
      expect(service.getInstanceUrl()).toBe('https://misskey.io')
    })

    it('removes trailing slash from URL', () => {
      service.setInstance('https://misskey.io/')
      expect(service.getInstanceUrl()).toBe('https://misskey.io')
    })
  })

  describe('getMiAuthUrl', () => {
    it('generates correct MiAuth URL', () => {
      service.setInstance('https://misskey.io')
      const url = service.getMiAuthUrl('testsession123', 'https://example.com/callback')
      
      expect(url).toContain('https://misskey.io/miauth/testsession123')
      expect(url).toContain('callback=')
      expect(url).toContain('name=')
    })

    it('includes custom app name', () => {
      service.setInstance('https://misskey.io')
      const url = service.getMiAuthUrl('test', 'https://example.com/callback', 'My App')
      
      expect(url).toContain('name=My+App')
    })
  })

  describe('checkMiAuthSession', () => {
    it('returns null when session is not authenticated', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ ok: false }),
      })

      service.setInstance('https://misskey.io')
      const result = await service.checkMiAuthSession('testsession')
      
      expect(result).toBeNull()
    })

    it('returns token and user when authenticated', async () => {
      const mockUser = {
        id: 'user1',
        username: 'testuser',
        name: 'Test User',
      }

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          ok: true,
          token: 'testtoken123',
          user: mockUser,
        }),
      })

      service.setInstance('https://misskey.io')
      const result = await service.checkMiAuthSession('testsession')
      
      expect(result).toEqual({
        token: 'testtoken123',
        user: mockUser,
      })
    })

    it('returns null on fetch error', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))

      service.setInstance('https://misskey.io')
      const result = await service.checkMiAuthSession('testsession')
      
      expect(result).toBeNull()
    })
  })
})
