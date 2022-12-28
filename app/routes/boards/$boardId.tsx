import type { LoaderArgs } from '@remix-run/node'
import { Response } from '@remix-run/node'
import { json } from '@remix-run/node'
import { Link, useLoaderData } from '@remix-run/react'
import { z } from 'zod'
import { db } from '~/db.server'

const paramsSchema = z.object({
  boardId: z.string(),
})

export async function loader({ params }: LoaderArgs) {
  const { boardId } = paramsSchema.parse(params)

  const [board, boards] = await Promise.all([
    db.board.findUnique({
      where: { id: boardId },
      select: {
        id: true,
        name: true,
        columns: {
          select: {
            id: true,
            name: true,
            tasks: {
              select: {
                id: true,
                title: true,
                subtasks: { select: { isComplete: true } },
              },
              orderBy: { position: 'asc' },
            },
          },
          orderBy: { position: 'asc' },
        },
      },
    }),
    db.board.findMany({
      select: { id: true, name: true },
      orderBy: { position: 'asc' },
    }),
  ])

  if (!board) throw new Response('Board not found', { status: 404 })

  return json({ board, boards })
}

export default function Board() {
  const { board, boards } = useLoaderData<typeof loader>()

  return (
    <div>
      <header>
        <h1>{board.name}</h1>
      </header>
      <nav>
        <h2>All boards ({boards.length})</h2>
        <ol>
          {boards.map((board) => (
            <li key={board.id}>
              <Link to={`/boards/${board.id}`}>{board.name}</Link>
            </li>
          ))}
        </ol>
        {board.columns.length ? (
          <ol>
            {board.columns.map((column) => (
              <li key={column.id}>
                <h2>{column.name}</h2>
                {column.tasks.length ? (
                  <ol>
                    {column.tasks.map((task) => {
                      const totalSubtasks = task.subtasks.length
                      const completedSubtasks = task.subtasks.filter(
                        (subtask) => subtask.isComplete
                      ).length

                      return (
                        <li key={task.id}>
                          <h3>{task.title}</h3>
                          {totalSubtasks ? (
                            <p>
                              {completedSubtasks} of {totalSubtasks} subtasks
                            </p>
                          ) : null}
                        </li>
                      )
                    })}
                  </ol>
                ) : null}
              </li>
            ))}
          </ol>
        ) : (
          <EmptyBoard />
        )}
      </nav>
    </div>
  )
}

function EmptyBoard() {
  return <p>This board is empty. Create a new column to get started.</p>
}
