import { json } from '@remix-run/node'
import { Link, Outlet, useLoaderData } from '@remix-run/react'
import { useId } from 'react'
import { db } from '~/db.server'

export const loader = async () => {
  const boards = await db.board.findMany()

  return json({ boards })
}

export default function Boards() {
  const { boards } = useLoaderData<typeof loader>()
  const headingId = useId()

  return (
    <div>
      <nav aria-labelledby={headingId}>
        <h2 id={headingId}>All boards ({boards.length})</h2>
        <ul>
          {boards.map((board) => (
            <li key={board.id}>
              <Link to={`${board.id}`}>{board.name}</Link>
            </li>
          ))}
        </ul>
      </nav>
      <Outlet />
    </div>
  )
}
