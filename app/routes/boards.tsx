import { json } from '@remix-run/node'
import { Link, Outlet, useLoaderData } from '@remix-run/react'
import { useId } from 'react'
import { db } from '~/db.server'

export const loader = async () => {
  const boards = await db.board.findMany({ orderBy: { position: 'asc' } })

  return json({ boards })
}

export default function Boards() {
  const { boards } = useLoaderData<typeof loader>()
  const headingId = useId()

  return (
    <div>
      <div>
        <nav aria-labelledby={headingId}>
          <h2 id={headingId}>All boards ({boards.length})</h2>
          <ol>
            {boards.map((board) => (
              <li key={board.id}>
                <Link to={`${board.id}`}>{board.name}</Link>
              </li>
            ))}
          </ol>
        </nav>
        <Link to="add">Create New Board</Link>
      </div>
      <Outlet />
    </div>
  )
}
