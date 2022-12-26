import { redirect } from '@remix-run/node'

export function loader() {
  return redirect('/boards')
}

export default function Index() {
  return null
}
