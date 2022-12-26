import { test, expect } from '~/test/fixtures'

test('add a task', async ({ seedData, page }) => {
  const [board] = seedData.boards
  const [column] = board.columns

  await page.getByRole('link', { name: board.name }).click()
  await page.getByRole('link', { name: /add new task/i }).click()

  await page.getByRole('textbox', { name: /title/i }).type('New Task')
  await page
    .getByRole('textbox', { name: /description/i })
    .type('New Task Description')
  await page
    .getByRole('combobox', { name: /status/i })
    .selectOption(column.name)
  await page.getByRole('button', { name: /create task/i }).click()

  await expect(page.getByRole('heading', { name: /new task/i })).toBeVisible()
})
