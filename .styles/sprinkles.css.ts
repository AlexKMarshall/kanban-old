import { defineProperties, createSprinkles } from '@vanilla-extract/sprinkles'

const responsiveProperties = defineProperties({
  conditions: {
    mobile: {},
    tablet: { '@media': 'screen and (min-width: 768px)' },
    desktop: { '@media': 'screen and (min-width: 1024px)' },
  },
  defaultCondition: 'mobile',
  properties: {
    fontSize: {
      xs: `${12 / 16}rem`,
      s: `${13 / 16}rem`,
      m: `${15 / 16}rem`,
      l: `${18 / 16}rem`,
      xl: `${20 / 16}rem`,
      '2xl': `${24 / 16}rem`,
    },
    fontWeight: {
      medium: 500,
      bold: 700,
    },
  },
})

export const sprinkles = createSprinkles(responsiveProperties)
export type Sprinkles = Parameters<typeof sprinkles>[0]
