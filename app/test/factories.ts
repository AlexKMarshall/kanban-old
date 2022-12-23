import type { PartialDeep } from 'type-fest'
import { faker } from '@faker-js/faker'

function getEmptyArray(length: number) {
  return Array.from({ length }, () => undefined)
}

type Subtask = {
  id: string
  title: string
  isComplete: boolean
}
export function getNewSubtask(overrides?: PartialDeep<Subtask>) {
  return {
    id: faker.datatype.uuid(),
    title: faker.lorem.sentence(),
    isComplete: faker.datatype.boolean(),
    ...overrides,
  }
}

type Task = {
  id: string
  title: string
  description?: string
  subtasks: Subtask[]
}

export function getNewTask({
  subtasks: subtasksOverrides,
  ...overrides
}: PartialDeep<Task> = {}) {
  const subtasks = (
    subtasksOverrides ??
    getEmptyArray(faker.datatype.number({ min: 0, max: 5 }))
  ).map(getNewSubtask)

  return {
    id: faker.datatype.uuid(),
    title: faker.lorem.sentence(),
    description: faker.helpers.maybe(faker.lorem.paragraph),
    subtasks,
    ...overrides,
  }
}

type Column = {
  id: string
  name: string
  tasks: Task[]
}

export function getNewColumn({
  tasks: tasksOverrides,
  ...overrides
}: PartialDeep<Column> = {}) {
  const tasks = (
    tasksOverrides ?? getEmptyArray(faker.datatype.number({ min: 0, max: 5 }))
  ).map(getNewTask)

  return {
    id: faker.datatype.uuid(),
    name: faker.lorem.words(),
    tasks,
    ...overrides,
  }
}

type Board = {
  id: string
  name: string
  columns: Column[]
}

export function getNewBoard({
  columns: columnsOverrides,
  ...overrides
}: PartialDeep<Board> = {}) {
  const columns = (
    columnsOverrides ?? getEmptyArray(faker.datatype.number({ min: 0, max: 5 }))
  ).map(getNewColumn)

  return {
    id: faker.datatype.uuid(),
    name: faker.lorem.words(),
    columns,
    ...overrides,
  }
}

type SeedData = {
  boards: Board[]
}
export function getNewSeedData({
  boards: boardsOverrides,
}: PartialDeep<SeedData> = {}) {
  const boards = (
    boardsOverrides ?? getEmptyArray(faker.datatype.number({ min: 0, max: 5 }))
  ).map(getNewBoard)

  return {
    boards,
  }
}
