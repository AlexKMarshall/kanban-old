import { PrismaClient } from '@prisma/client'
import { db } from '~/db.server'
import { getNewSeedData } from './factories'
import defaultSeedData from './seed-data.json'
import { randomUUID } from 'node:crypto'
import { execSync } from 'node:child_process'
import url from 'node:url'
import path from 'node:path'
import fsPromises from 'node:fs/promises'

const DATABASE_URL_FORMAT = 'file:./test/{{uuid}}.db'

export function generateDatabaseUrl() {
  return DATABASE_URL_FORMAT.replace('{{uuid}}', randomUUID())
}

export function migrateDatabase(url: string) {
  return execSync(`pnpm turbo db:push -- --accept-data-loss`, {
    env: { ...process.env, NODE_ENV: 'test', DATABASE_URL: url },
  })
}

export function getPrismaClient(url?: string) {
  if (!url) return db

  return new PrismaClient({
    datasources: {
      db: {
        url,
      },
    },
  })
}

export async function seedDatabase(
  seedData = getNewSeedData(defaultSeedData),
  db = getPrismaClient()
) {
  const boards = seedData.boards
  const columns = boards.flatMap(({ id: boardId, columns }) =>
    columns.map((column, position) => ({ ...column, position, boardId }))
  )
  const tasks = columns.flatMap(({ id: columnId, tasks }) =>
    tasks.map((task, position) => ({ ...task, position, columnId }))
  )
  const subtasks = tasks.flatMap(({ id: taskId, subtasks }) =>
    subtasks.map((subtask, position) => ({ ...subtask, position, taskId }))
  )

  await Promise.all(
    boards.map(({ columns, ...board }) => db.board.create({ data: board }))
  )
  await Promise.all(
    columns.map(({ tasks, ...column }) => db.column.create({ data: column }))
  )
  await Promise.all(
    tasks.map(({ subtasks, ...task }) => db.task.create({ data: task }))
  )
  await Promise.all(
    subtasks.map((subtask) => db.subtask.create({ data: subtask }))
  )
}

export async function truncateDatabase(db = getPrismaClient()) {
  const tables: { name: string }[] =
    await db.$queryRaw`SELECT name FROM sqlite_schema WHERE type = 'table'`

  await Promise.all(
    tables.map(({ name }) => db.$executeRawUnsafe(`DELETE FROM ${name}`))
  )
}

export async function prepareDatabase() {
  const databaseUrl = generateDatabaseUrl()
  await migrateDatabase(databaseUrl)
  const client = getPrismaClient(databaseUrl)
  return { databaseUrl, client }
}

export async function removeDatabase(databaseUrl: string) {
  const relativePath = url.fileURLToPath(databaseUrl)
  const fullPath = path.join(__dirname, '../../prisma', relativePath)
  return fsPromises.unlink(fullPath)
}
