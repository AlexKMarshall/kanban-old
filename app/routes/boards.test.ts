import { test, expect } from '~/test/fixtures'

test('board navigation links', async ({ page, seedData }) => {
  const mainNav = await page.getByRole('navigation', { name: /all boards/i })

  const { boards } = seedData
  const boardNames = boards.map(({ name }) => name)

  const navLinks = mainNav.getByRole('link')

  await expect(navLinks).toHaveText(boardNames)
})
