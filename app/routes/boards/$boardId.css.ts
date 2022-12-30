import { style } from '@vanilla-extract/css'
import { sprinkles } from '~/styles'

export const pageLayout = style({
  display: 'grid',
  gridTemplateColumns: 'auto 1fr',
  gridTemplateRows: 'auto 1fr',
})

export const logo = style({
  marginBlock: 16,
  marginInlineStart: 16,
  marginInlineEnd: 16,
  alignSelf: 'center',
  '@media': {
    'screen and (min-width: 768px)': {
      marginInlineStart: 24,
      marginInlineEnd: 24,
    },
    'screen and (min-width: 1024px)': {
      marginBlock: 24,
      marginInlineEnd: 32,
    },
  },
})

export const heading = style(
  {
    marginBlock: 16,
    alignSelf: 'center',
    lineHeight: 1.25,
    '@media': {
      'screen and (min-width: 768px)': {
        marginInlineStart: 24,
      },
      'screen and (min-width: 1024px)': {
        marginBlock: 24,
        marginInlineEnd: 32,
      },
    },
  },
  sprinkles({
    fontSize: { mobile: 'l', tablet: 'xl', desktop: '2xl' },
    fontWeight: 'bold',
  })
)

export const header = style({
  display: 'contents',
})

export const main = style({
  overflow: 'auto',
  gridColumnStart: 1,
  gridColumnEnd: -1,
  '@media': {
    'screen and (min-width: 768px)': {
      gridColumnStart: 2,
    },
  },
})

export const columnList = style({
  display: 'grid',
  gridAutoColumns: 280,
  gridAutoFlow: 'column',
  gap: 24,
})
