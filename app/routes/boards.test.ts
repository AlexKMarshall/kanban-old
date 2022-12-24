import { test, expect } from '~/test/fixtures'

test('board navigation links', async ({ page, seedData }) => {
  await page.goto('/boards')
  const mainNav = await page.getByRole('navigation', { name: /all boards/i })

  await Promise.all(
    seedData.boards.map(({ name }) =>
      expect(mainNav.getByRole('link', { name })).toBeVisible()
    )
  )
})
