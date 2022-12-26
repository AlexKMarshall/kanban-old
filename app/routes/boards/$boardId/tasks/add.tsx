import type { ActionArgs, LoaderArgs } from '@remix-run/node'
import { redirect } from '@remix-run/node'
import { json } from '@remix-run/node'
import { Form, useActionData, useLoaderData } from '@remix-run/react'
import { db } from '~/db.server'
import { z } from 'zod'

const paramsSchema = z.object({
  boardId: z.string().min(1),
})

export async function loader({ params }: LoaderArgs) {
  const { boardId } = paramsSchema.parse(params)

  const columns = await db.column.findMany({
    select: { id: true, name: true },
    where: { boardId },
  })

  return json({ columns })
}

const addTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  columnId: z.string().uuid(),
})

export async function action({ params, request }: ActionArgs) {
  const { boardId } = paramsSchema.parse(params)

  const formData = await request.formData()
  console.log(Object.fromEntries(formData))

  const safeParse = addTaskSchema.safeParse(Object.fromEntries(formData))

  if (!safeParse.success) {
    return json({
      error: safeParse.error.flatten(),
    })
  }

  const { title, description, columnId } = safeParse.data

  await db.column.findFirstOrThrow({ where: { id: columnId, boardId } })

  await db.$transaction(async (tx) => {
    const taskAggregate = await tx.task.aggregate({
      _max: { position: true },
      where: { columnId },
    })

    const currentMaxPosition = taskAggregate._max.position ?? 0

    return await tx.task.create({
      data: {
        title,
        description,
        columnId,
        position: currentMaxPosition + 1,
      },
    })
  })

  return redirect(`/boards/${boardId}`)
}

export default function TaskAdd() {
  const { columns } = useLoaderData<typeof loader>()
  const data = useActionData<typeof action>()

  const formError = data?.error.formErrors.join(',')

  return (
    <Form method="post">
      <div>
        <label htmlFor="title">Title</label>
        <input
          type="text"
          name="title"
          id="title"
          placeholder="e.g. Take coffee break"
          aria-invalid={Boolean(data?.error.fieldErrors.title)}
          aria-errormessage={
            data?.error.fieldErrors.title ? 'title-error' : undefined
          }
          required
        />
        {data?.error.fieldErrors.title ? (
          <p id="title-error">{data.error.fieldErrors.title.join(',')}</p>
        ) : null}
      </div>
      <div>
        <label htmlFor="description">Description</label>
        <textarea
          name="description"
          id="description"
          placeholder="e.g. It’s always good to take a break. This 15 minute break will 
        recharge the batteries a little."
          aria-invalid={Boolean(data?.error.fieldErrors.description)}
          aria-errormessage={
            data?.error.fieldErrors.description
              ? 'description-error'
              : undefined
          }
        />
        {data?.error.fieldErrors.description ? (
          <p id="description-error">
            {data.error.fieldErrors.description.join(',')}
          </p>
        ) : null}
      </div>
      <div>
        <label htmlFor="status">Status</label>
        <select
          name="columnId"
          id="status"
          aria-invalid={Boolean(data?.error.fieldErrors.columnId)}
          aria-errormessage={
            data?.error.fieldErrors.columnId ? 'columnId-error' : undefined
          }
          required
        >
          {columns.map((column) => (
            <option key={column.id} value={column.id}>
              {column.name}
            </option>
          ))}
        </select>
        {data?.error.fieldErrors.columnId ? (
          <p id="columnId-error">{data.error.fieldErrors.columnId.join(',')}</p>
        ) : null}
      </div>
      <button type="submit">Create Task</button>
      {formError ? <p>{formError}</p> : null}
    </Form>
  )
}
