import { test, expect } from '~/test/fixtures'

test('create a board', async ({ seedData, page }) => {
  await page.getByRole('link', { name: /create new board/i }).click()

  await page.getByRole('textbox', { name: /name/i }).type('My Board')
  await page.getByRole('button', { name: /create new board/i }).click()

  await expect(page.getByRole('heading', { name: /my board/i })).toBeVisible()
})
