import { style } from '@vanilla-extract/css'

export const header = style({
  display: 'flex',
  alignItems: 'center',
  gap: 20,
  padding: 20,
})

export const main = style({
  overflow: 'auto',
})

export const columnList = style({
  display: 'grid',
  gridAutoColumns: 280,
  gridAutoFlow: 'column',
})
