import { test, expect } from '~/test/fixtures'

test('create new column', async ({ seedData, page }) => {
  const [board] = seedData.boards

  await page.getByRole('link', { name: board.name }).click()

  await page.getByRole('link', { name: /new column/i }).click()

  const newColumnName = 'The New Column'
  await page.getByRole('textbox', { name: /column name/i }).type(newColumnName)
  await page.getByRole('button', { name: /create new column/i }).click()

  expect(await page.getByRole('heading', { name: newColumnName })).toBeVisible()
})
