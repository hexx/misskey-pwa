import { test, expect } from '@playwright/test'

test.describe('Misskey PWA Client', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should display the app title', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Misskey PWA Client')
  })

  test('should show API health status', async ({ page }) => {
    await expect(page.locator('text=API Status:')).toBeVisible()
    // Wait for the health check to complete
    await expect(page.locator('text=ok')).toBeVisible({ timeout: 5000 })
  })

  test('should display feature cards', async ({ page }) => {
    await expect(page.locator('text=PWA Support')).toBeVisible()
    await expect(page.locator('text=Real-time Updates')).toBeVisible()
    await expect(page.locator('text=Secure Authentication')).toBeVisible()
  })

  test('should have proper meta tags for PWA', async ({ page }) => {
    const viewport = await page.locator('meta[name="viewport"]').getAttribute('content')
    expect(viewport).toContain('width=device-width')
  })

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('.features')).toBeVisible()
  })
})
