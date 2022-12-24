import { getNewSeedData } from '~/test/factories'
import { test, expect } from '~/test/fixtures'

test('show lists of tasks', async ({ seedData, page }) => {
  const [board] = seedData.boards

  await page.getByRole('link', { name: board.name }).click()

  await expect(
    page.getByRole('heading', { name: board.name, level: 1 })
  ).toBeVisible()

  const { columns } = board

  await Promise.all(
    columns.flatMap(({ name, tasks }) => [
      expect(page.getByRole('list', { name })).toBeVisible(),

      ...tasks.flatMap(({ title }) => [
        expect(page.getByRole('listitem', { name: title })).toBeVisible(),
      ]),
    ])
  )
})

test.describe('empty board', () => {
  test.use({ seedData: getNewSeedData({ boards: [{ columns: [] }] }) })

  test('show empty board state', async ({ seedData, page }) => {
    const [board] = seedData.boards

    await page.getByRole('link', { name: board.name }).click()

    await expect(
      page.getByRole('heading', { name: board.name, level: 1 })
    ).toBeVisible()

    await expect(
      page.getByText('This board is empty. Create a new column to get started.')
    ).toBeVisible()
  })
})
