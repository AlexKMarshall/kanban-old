import type { ActionArgs } from '@remix-run/node'
import { json } from '@remix-run/node'
import { redirect } from '@remix-run/node'
import { Form, useActionData } from '@remix-run/react'
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

  const safeParse = addColumnSchema.safeParse(Object.fromEntries(formData))

  if (!safeParse.success) {
    return json({
      error: safeParse.error.flatten(),
    })
  }

  const existingColumn = await db.column.findFirst({
    where: { boardId, name: safeParse.data.name },
  })

  if (existingColumn) {
    return json({
      error: {
        fieldErrors: {
          name: ['Column with this name already exists'],
        },
        formErrors: [],
      },
    })
  }

  const { name } = safeParse.data

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
  const data = useActionData<typeof action>()

  const formError = data?.error.formErrors.join(',')

  return (
    <Form method="post">
      <h2>Add New Column</h2>
      <div>
        <label htmlFor="name">Column Name</label>
        <input
          type="text"
          id="name"
          name="name"
          aria-invalid={Boolean(data?.error.fieldErrors.name)}
          aria-errormessage={
            data?.error.fieldErrors.name ? 'name-error' : undefined
          }
          required
        />
        {data?.error.fieldErrors.name ? (
          <p id="name-error">{data.error.fieldErrors.name.join(',')}</p>
        ) : null}
      </div>
      <button type="submit">Create New Column</button>
      {formError ? <p>{formError}</p> : null}
    </Form>
  )
}
