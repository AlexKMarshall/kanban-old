import { redirect } from '@remix-run/node'
import { db } from '~/db.server'

export async function loader() {
  const firstBoard = await db.board.findFirst({
    select: { id: true },
    orderBy: { position: 'asc' },
  })

  if (firstBoard) {
    return redirect(firstBoard.id)
  }
}

export default function BoardsIndex() {
  return null
}
