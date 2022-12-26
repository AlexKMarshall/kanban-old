import type { LoaderArgs } from '@remix-run/node'
import { json } from '@remix-run/node'
import { Response } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { db } from '~/db.server'

export async function loader({ params }: LoaderArgs) {
  const { taskId } = params

  if (!taskId) {
    throw new Response('Task ID is required', { status: 400 })
  }

  const task = await db.task.findUnique({
    where: { id: taskId },
    select: {
      title: true,
      description: true,
    },
  })

  if (!task) {
    throw new Response('Task not found', { status: 404 })
  }

  return json({ task })
}

export default function TaskId() {
  const { task } = useLoaderData<typeof loader>()

  return (
    <div>
      <h2>{task.title}</h2>
      <p>{task.description}</p>
    </div>
  )
}
