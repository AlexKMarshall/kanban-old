import type { ActionArgs } from '@remix-run/node'
import { redirect } from '@remix-run/node'
import { Form } from '@remix-run/react'
import { db } from '~/db.server'
import * as z from 'zod'

const paramsSchema = z.object({
  boardId: z.string().min(1),
})

const addColumnSchema = z.object({
  name: z.string().min(1),
})

export async function action({ params, request }: ActionArgs) {
  const { boardId } = paramsSchema.parse(params)
  const formData = await request.formData()

  const { name } = addColumnSchema.parse(Object.fromEntries(formData))

  await db.$transaction(async (tx) => {
    const columnAggregate = await tx.column.aggregate({
      _max: { position: true },
      where: { boardId },
    })

    const currentMaxPosition = columnAggregate._max.position ?? 0

    return await tx.column.create({
      data: {
        name,
        boardId,
        position: currentMaxPosition + 1,
      },
    })
  })

  return redirect(`/boards/${boardId}`)
}

export default function AddColumn() {
  return (
    <Form method="post">
      <h1>Add New Column</h1>
      <label htmlFor="name">Column Name</label>
      <input type="text" id="name" name="name" />
      <button type="submit">Create New Column</button>
    </Form>
  )
}
