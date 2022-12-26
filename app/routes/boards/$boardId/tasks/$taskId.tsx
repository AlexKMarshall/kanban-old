import type { LoaderArgs } from '@remix-run/node'
import { json } from '@remix-run/node'
import { Response } from '@remix-run/node'
import { Form, useLoaderData } from '@remix-run/react'
import { db } from '~/db.server'

export async function loader({ params }: LoaderArgs) {
  const { taskId, boardId } = params
  if (!boardId) {
    throw new Response('Board ID is required', { status: 400 })
  }
  if (!taskId) {
    throw new Response('Task ID is required', { status: 400 })
  }

  const task = await db.task.findUnique({
    where: { id: taskId },
    select: {
      title: true,
      description: true,
      subtasks: {
        select: {
          id: true,
          title: true,
          isComplete: true,
        },
      },
      column: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  })
  const columns = await db.column.findMany({
    select: {
      id: true,
      name: true,
    },
    where: { boardId },
  })

  if (!task) {
    throw new Response('Task not found', { status: 404 })
  }

  return json({ task, columns })
}

export default function TaskId() {
  const { task, columns } = useLoaderData<typeof loader>()

  const totalSubtasks = task.subtasks.length
  const completedSubtasks = task.subtasks.filter((s) => s.isComplete).length

  return (
    <div>
      <h2>{task.title}</h2>
      <p>{task.description}</p>
      <Form>
        {totalSubtasks > 0 ? (
          <fieldset>
            <legend>
              Subtasks ({completedSubtasks} of {totalSubtasks})
            </legend>
            <ol>
              {task.subtasks.map((subtask) => (
                <li key={subtask.id}>
                  <input
                    id={subtask.id}
                    type="checkbox"
                    defaultChecked={subtask.isComplete}
                  />
                  <label htmlFor={subtask.id}>{subtask.title}</label>
                </li>
              ))}
            </ol>
          </fieldset>
        ) : null}
        <label htmlFor="status">Current Status</label>
        <select id="status" defaultValue={task.column.id}>
          {columns.map((column) => (
            <option key={column.id} value={column.id}>
              {column.name}
            </option>
          ))}
        </select>
      </Form>
    </div>
  )
}
