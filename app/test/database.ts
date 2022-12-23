import { PrismaClient } from '@prisma/client'
import { db } from '~/db.server'
import { getNewSeedData } from './factories'
import defaultSeedData from './seed-data.json'

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
