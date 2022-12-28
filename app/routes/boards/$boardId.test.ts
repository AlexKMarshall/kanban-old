import { getNewSeedData } from '~/test/factories'
import { test, expect } from '~/test/fixtures'

test.describe('item ordering', () => {
  test.describe('list of boards', () => {
    test.use({
      seedData: getNewSeedData({
        boards: [{ name: 'A' }, { name: 'B' }, { name: 'C' }],
      }),
    })
    test('shows a navigation ordered list of boards', async ({
      seedData,
      page,
    }) => {
      const { boards } = seedData
      const boardNames = boards.map(({ name }) => name)
      const navigation = await page.getByRole('navigation')

      const links = await navigation.getByRole('link')

      await expect(links).toHaveCount(boards.length)
      await expect(links).toHaveText(boardNames)

      for (const boardName of boardNames) {
        await navigation.getByRole('link', { name: boardName }).click()
        await expect(
          page.getByRole('heading', { name: boardName, level: 1 })
        ).toBeVisible()
      }
    })
  })
  test.describe('list of columns', () => {
    // We use empty columns here so we can select list items and not worry about getting the tasks
    test.use({
      seedData: getNewSeedData({
        boards: [
          {
            columns: [
              { name: 'Column A', tasks: [] },
              { name: 'Column B', tasks: [] },
              { name: 'Column C', tasks: [] },
            ],
          },
        ],
      }),
    })
    test('shows ordered list of columns', async ({ seedData, page }) => {
      const [board] = seedData.boards
      const columnNames = board.columns.map(({ name }) => name)

      await page.getByRole('link', { name: board.name }).click()

      // get the list that has a listitem with the first column name
      // This should be the list of all the colums
      const listOfColumns = await page
        .getByRole('list')
        .filter({ has: page.getByText(columnNames[0]) })

      const columnListItems = await listOfColumns.getByRole('listitem')

      await expect(columnListItems).toHaveCount(columnNames.length)
      await expect(columnListItems).toHaveText(columnNames)
    })
  })
  test.describe('list of tasks', () => {
    test.use({
      seedData: getNewSeedData({
        boards: [
          {
            columns: [
              {
                name: 'Column A',
                tasks: [
                  { title: 'Task A' },
                  { title: 'Task B' },
                  { title: 'Task C' },
                ],
              },
            ],
          },
        ],
      }),
    })
    test('shows ordered list of tasks', async ({ seedData, page }) => {
      const [board] = seedData.boards
      const [column] = board.columns
      const taskTitlesRegex = column.tasks.map(
        ({ title }) => new RegExp(title, 'i')
      )

      await page.getByRole('link', { name: board.name }).click()
      const listOfColumns = await page
        .getByRole('list')
        .filter({ has: page.getByText(column.name) })

      const listOfTasks = listOfColumns.getByRole('list')

      const taskListItems = await listOfTasks.getByRole('listitem')

      await expect(taskListItems).toHaveCount(taskTitlesRegex.length)
      await expect(taskListItems).toHaveText(taskTitlesRegex)
    })
  })
})
