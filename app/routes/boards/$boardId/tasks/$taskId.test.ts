import { faker } from '@faker-js/faker'
import { getNewSeedData } from '~/test/factories'
import { test, expect } from '~/test/fixtures'

test.describe('with one task', () => {
  test.use({
    seedData: getNewSeedData({
      boards: [
        {
          columns: [
            {
              tasks: [
                {
                  title: faker.company.catchPhrase(),
                  description: faker.lorem.paragraph(),
                },
              ],
            },
          ],
        },
      ],
    }),
  })

  test('show task detail', async ({ seedData, page }) => {
    const [board] = seedData.boards
    const [column] = board.columns
    const [task] = column.tasks

    await page.getByRole('link', { name: board.name }).click()

    await page.getByRole('link', { name: task.title }).click()

    await expect(
      page.getByRole('heading', { name: task.title, level: 2 })
    ).toBeVisible()
    if (task.description) {
      await expect(page.getByText(task.description)).toBeVisible()
    }
  })
})
