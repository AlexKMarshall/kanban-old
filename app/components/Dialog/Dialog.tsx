import type { ReactNode } from 'react'
import { useRef } from 'react'
import type { AriaDialogProps } from 'react-aria'
import { useDialog } from 'react-aria'

type DialogProps = AriaDialogProps & {
  children: ReactNode
  title: string
}

export function Dialog({ title, children, ...props }: DialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const { dialogProps, titleProps } = useDialog(props, dialogRef)

  return (
    <div {...dialogProps} ref={dialogRef}>
      <h3 {...titleProps}>{title}</h3>
      {children}
    </div>
  )
}
