import { test as base, expect } from '@playwright/test'
import {
  prepareDatabase,
  removeDatabase,
  seedDatabase,
  truncateDatabase,
} from './database'
import { getNewSeedData } from './factories'
import { startServer } from './server'
import seedData from './seed-data.json'

type TestFixtures = {
  seedData: ReturnType<typeof getNewSeedData>
}

type WorkerFixtures = {
  database: Awaited<ReturnType<typeof prepareDatabase>>
  server: { port: number }
}

const test = base.extend<TestFixtures, WorkerFixtures>({
  database: [
    async ({}, use) => {
      const database = await prepareDatabase()
      await use(database)
      await removeDatabase(database.databaseUrl)
    },
    { scope: 'worker' },
  ],
  server: [
    async ({ database }, use, workerInfo) => {
      const port = 3100 + workerInfo.workerIndex
      const server = await startServer({
        databaseUrl: database.databaseUrl,
        port,
      })
      await use({
        port,
      })
      await server.stop()
    },
    { scope: 'worker', auto: true },
  ],
  seedData: async ({}, use) => {
    await use(getNewSeedData(seedData))
  },
  baseURL: async ({ server }, use) => {
    await use(`http://localhost:${server.port}`)
  },
  page: async ({ seedData, page: pageBase, database, baseURL }, use) => {
    await truncateDatabase(database.client)
    await seedDatabase(seedData, database.client)
    await pageBase.goto(baseURL ?? '/')
    await use(pageBase)
  },
})

export { test, expect }
