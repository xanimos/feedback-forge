import type { Page} from '@playwright/test';

import { expect, test } from '@playwright/test'

test.describe('Admin', () => {
  let page: Page

  test.beforeAll(async ({ browser }, testInfo) => {
    const context = await browser.newContext()
    page = await context.newPage()
  })

  test('should render admin panel logo', async () => {
    await page.goto('/admin')

    // login
    await page.fill('#field-email', 'dev@payloadcms.com')
    await page.fill('#field-password', 'test')
    await page.click('.form-submit button')

    // should show dashboard
    await expect(page).toHaveTitle(/Dashboard/)
    await expect(page.locator('.graphic-icon')).toBeVisible()
  })

})

