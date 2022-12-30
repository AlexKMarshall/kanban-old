import type { LoaderArgs } from '@remix-run/node'
import { Response } from '@remix-run/node'
import { json } from '@remix-run/node'
import { Link, useLoaderData } from '@remix-run/react'
import { z } from 'zod'
import { db } from '~/db.server'
import { routeStyles, sprinkles } from '~/styles'

const styles = routeStyles.$boardId

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
    <div className={styles.pageLayout}>
      <header className={styles.header}>
        <picture className={styles.logo}>
          <source srcSet="/assets/logo-dark.svg" media="(min-width: 768px)" />
          <img
            src="/assets/logo-mobile.svg"
            alt="Kanban logo - 3 vertical purple lines"
          />
        </picture>
        <h1 className={styles.heading}>{board.name}</h1>
      </header>
      <nav
        className={sprinkles({ display: { mobile: 'none', tablet: 'block' } })}
      >
        <h2
          className={sprinkles({
            fontSize: 'xs',
            fontWeight: 'bold',
            letterSpacing: 'wide',
            textTransform: 'uppercase',
          })}
        >
          All boards ({boards.length})
        </h2>
        <ol>
          {boards.map((board) => (
            <li key={board.id}>
              <Link
                to={`/boards/${board.id}`}
                className={sprinkles({ fontSize: 'm', fontWeight: 'bold' })}
              >
                {board.name}
              </Link>
            </li>
          ))}
        </ol>
      </nav>

      <main className={styles.main}>
        {board.columns.length ? (
          <ol className={styles.columnList}>
            {board.columns.map((column) => (
              <li key={column.id}>
                <h2
                  className={sprinkles({
                    fontSize: 'xs',
                    fontWeight: 'bold',
                    letterSpacing: 'wide',
                    textTransform: 'uppercase',
                  })}
                >
                  {column.name} ({column.tasks.length})
                </h2>
                {column.tasks.length ? (
                  <ol>
                    {column.tasks.map((task) => {
                      const totalSubtasks = task.subtasks.length
                      const completedSubtasks = task.subtasks.filter(
                        (subtask) => subtask.isComplete
                      ).length
                      return (
                        <li key={task.id}>
                          <h3
                            className={sprinkles({
                              fontSize: 'm',
                              fontWeight: 'bold',
                            })}
                          >
                            {task.title}
                          </h3>
                          {totalSubtasks ? (
                            <p
                              className={sprinkles({
                                fontSize: 'xs',
                                fontWeight: 'bold',
                              })}
                            >
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
      </main>
    </div>
  )
}

function EmptyBoard() {
  return (
    <p className={sprinkles({ fontSize: 'l', fontWeight: 'bold' })}>
      This board is empty. Create a new column to get started.
    </p>
  )
}
