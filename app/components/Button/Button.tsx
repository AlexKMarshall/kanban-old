import type { ReactNode } from 'react'
import { forwardRef, useRef } from 'react'
import type { AriaButtonProps } from 'react-aria'
import { useButton } from 'react-aria'
import { mergeRefs } from '~/merge-refs'

type ButtonProps = AriaButtonProps & {
  children: ReactNode
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button({ children, ...props }, ref) {
    const buttonRef = useRef<HTMLButtonElement>(null)
    const { buttonProps } = useButton(props, buttonRef)

    return (
      <button {...buttonProps} ref={mergeRefs([buttonRef, ref])}>
        {children}
      </button>
    )
  }
)
