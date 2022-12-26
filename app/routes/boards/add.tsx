import type { ActionArgs } from '@remix-run/node'
import { json, redirect } from '@remix-run/node'
import { Form } from '@remix-run/react'
import { z } from 'zod'
import { db } from '~/db.server'

const addBoardSchema = z.object({
  name: z.string().min(1),
})

export async function action({ request }: ActionArgs) {
  const formData = await request.formData()

  const safeParse = addBoardSchema.safeParse(Object.fromEntries(formData))

  if (!safeParse.success) {
    return json({
      error: safeParse.error.flatten(),
    })
  }

  const existingBoard = await db.board.findFirst({
    where: { name: safeParse.data.name },
  })

  if (existingBoard) {
    return json({
      error: {
        fieldErrors: {
          name: ['Board with this name already exists'],
        },
        formErrors: [],
      },
    })
  }

  const savedBoard = await db.$transaction(async (tx) => {
    const boardAggregate = await tx.board.aggregate({
      _max: { position: true },
    })

    const currentMaxPosition = boardAggregate._max.position ?? 0

    return await tx.board.create({
      data: {
        name: safeParse.data.name,
        position: currentMaxPosition + 1,
      },
    })
  })

  return redirect(`/boards/${savedBoard.id}`)
}

export default function BoardsAdd() {
  return (
    <Form method="post">
      <h2>Add New Board</h2>
      <label htmlFor="board-name">Name</label>
      <input
        id="board-name"
        name="name"
        type="text"
        placeholder="e.g. Web Design"
      />
      <button type="submit">Create New Board</button>
    </Form>
  )
}
