import type { LoaderArgs } from '@remix-run/node'
import { Response } from '@remix-run/node'
import { json } from '@remix-run/node'
import { Link, Outlet, useLoaderData } from '@remix-run/react'
import { useId } from 'react'
import { db } from '~/db.server'

const groupById = <T extends { id: string }>(array: T[]) =>
  array.reduce<Record<string, T>>((acc, item) => {
    acc[item.id] = item
    return acc
  }, {})

export const loader = async ({ params }: LoaderArgs) => {
  const { boardId } = params

  if (!boardId) {
    throw new Response('Board ID is required', { status: 400 })
  }

  const board = await db.board.findUnique({
    where: { id: boardId },
    select: {
      id: true,
      name: true,
      columns: { select: { id: true }, orderBy: { position: 'asc' } },
    },
  })
  if (!board) throw new Response('Board not found', { status: 404 })
  const columnsArray = await db.column.findMany({
    where: { boardId },
    select: {
      id: true,
      name: true,
      tasks: { select: { id: true }, orderBy: { position: 'asc' } },
    },
  })

  const columns = groupById(columnsArray)

  const tasksArray = await db.task.findMany({
    where: { columnId: { in: columnsArray.map((c) => c.id) } },
    select: {
      id: true,
      title: true,
      subtasks: { select: { isComplete: true } },
    },
  })
  const tasks = groupById(tasksArray)

  return json({ board, columns, tasks })
}

export default function BoardId() {
  const { board, columns, tasks } = useLoaderData<typeof loader>()
  const headingId = useId()
  return (
    <main>
      <h1 id={headingId}>{board.name}</h1>
      <Outlet />
      {board.columns.length === 0 ? (
        <BoardEmptyState />
      ) : (
        <>
          <ol aria-labelledby={headingId}>
            {board.columns.map(({ id: columnId }) => {
              const column = columns[columnId]
              return <Column column={column} tasks={tasks} key={columnId} />
            })}
          </ol>
          <Link to="columns/add">New Column</Link>
        </>
      )}
    </main>
  )
}

function BoardEmptyState() {
  return (
    <div>
      <p>This board is empty. Create a new column to get started.</p>
      <Link to="columns/add">Add New Column</Link>
    </div>
  )
}

type ColumnProps = {
  column: { id: string; name: string; tasks: { id: string }[] }
  tasks: {
    [taskId: string]: {
      id: string
      title: string
      subtasks: { isComplete: boolean }[]
    }
  }
}

function Column({ column, tasks }: ColumnProps) {
  const headingId = useId()

  return (
    <li aria-labelledby={headingId}>
      <h2 id={headingId}>
        {column.name} ({column.tasks.length})
      </h2>
      <ol aria-labelledby={headingId}>
        {column.tasks.map(({ id: taskId }) => {
          const task = tasks[taskId]

          return <Task task={task} key={taskId} />
        })}
      </ol>
    </li>
  )
}

type TaskProps = {
  task: {
    id: string
    title: string
    subtasks: { isComplete: boolean }[]
  }
}
function Task({ task }: TaskProps) {
  const headingId = useId()
  const totalSubTasks = task.subtasks.length
  const completedSubTasks = task.subtasks.filter((s) => s.isComplete).length

  return (
    <li aria-labelledby={headingId}>
      <h3 id={headingId}>
        <Link to={`tasks/${task.id}`}>{task.title}</Link>
      </h3>
      {totalSubTasks > 0 && (
        <p>
          {completedSubTasks} of {totalSubTasks} subtasks
        </p>
      )}
    </li>
  )
}
