import { json, redirect } from '@remix-run/node'
import { db } from '~/db.server'

export async function loader() {
  const firstBoard = await db.board.findFirst({
    select: { id: true },
    orderBy: { position: 'asc' },
  })

  if (firstBoard) {
    return redirect(firstBoard.id)
  }

  return json({ message: 'No boards found' })
}

export default function NoBoards() {
  return <div>No boards found</div>
}
