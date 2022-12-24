import { getNewSeedData } from '~/test/factories'
import { test, expect } from '~/test/fixtures'

test('show lists of tasks', async ({ seedData, page }) => {
  const [board] = seedData.boards

  await page.getByRole('link', { name: board.name }).click()

  await expect(
    page.getByRole('heading', { name: board.name, level: 1 })
  ).toBeVisible()

  // Check that the columns are in the right order
  const columnNames = board.columns.map(({ name }) => new RegExp(name, 'i'))
  const listOfColumns = await page.getByRole('list', { name: board.name })
  // Have to select the level two headings - if we selected the list items
  // it would recurse into the tasks
  await expect(listOfColumns.getByRole('heading', { level: 2 })).toHaveText(
    columnNames
  )

  for (const column of board.columns) {
    const columnList = await page.getByRole('list', { name: column.name })

    const taskTitles = column.tasks.map(({ title }) => new RegExp(title, 'i'))

    await expect(columnList.getByRole('listitem')).toHaveText(taskTitles)
  }
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
