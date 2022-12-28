import type { ComponentProps, ReactNode } from 'react'
import { createContext, useContext } from 'react'
import { useRef } from 'react'
import type { AriaModalOverlayProps } from 'react-aria'
import { useOverlayTrigger } from 'react-aria'
import { Overlay, useModalOverlay } from 'react-aria'
import type { OverlayTriggerState, OverlayTriggerProps } from 'react-stately'
import { useOverlayTriggerState } from 'react-stately'
import { Button } from '../Button'
import { Dialog } from '../Dialog'

type ModalProps = {
  state: OverlayTriggerState
  children: ReactNode
} & AriaModalOverlayProps
export function Modal({ state, children, ...props }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const { modalProps, underlayProps } = useModalOverlay(props, state, modalRef)

  return (
    <Overlay>
      <div
        style={{
          position: 'fixed',
          zIndex: 100,
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        {...underlayProps}
      >
        <div {...modalProps} ref={modalRef}>
          {children}
        </div>
      </div>
    </Overlay>
  )
}

type OverlayContextType = ReturnType<
  typeof useOverlayTrigger
>['overlayProps'] & { role: 'dialog' }
const OverlayContext = createContext<OverlayContextType | null>(null)

function useOverlayContext() {
  const context = useContext(OverlayContext)
  if (!context) {
    throw new Error('useOverlayContext must be used within a ModalTrigger')
  }
  return context
}

type ModalTriggerProps = OverlayTriggerProps & {
  children: ReactNode
}
export function ModalTrigger({ children, ...props }: ModalTriggerProps) {
  const state = useOverlayTriggerState(props)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const { triggerProps, overlayProps } = useOverlayTrigger(
    { type: 'dialog' },
    state,
    triggerRef
  )
  console.log(overlayProps)

  return (
    <OverlayContext.Provider value={overlayProps}>
      <Button {...triggerProps} ref={triggerRef}>
        Open Modal
      </Button>
      {state.isOpen ? <Modal state={state}>{children}</Modal> : null}
    </OverlayContext.Provider>
  )
}

type ModalDialogProps = ComponentProps<typeof Dialog>
export function ModalDialog(props: ModalDialogProps) {
  const overlayProps = useOverlayContext()

  return <Dialog {...overlayProps} {...props} />
}
