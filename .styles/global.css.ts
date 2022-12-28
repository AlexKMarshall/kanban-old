import { globalStyle } from '@vanilla-extract/css'

// CSS Reset

globalStyle('*, *::before, *::after', {
  boxSizing: 'border-box',
})

globalStyle('*', {
  margin: 0,
})

globalStyle('html, body', {
  height: '100%',
})

globalStyle('body', {
  lineHeight: 1.5,
  fontSmooth: 'antialiased',
  WebkitFontSmoothing: 'antialiased',
})

globalStyle('img, picture, video, canvas, svg', {
  display: 'block',
  maxWidth: '100%',
})

globalStyle('input, button, textarea, select', {
  font: 'inherit',
})

globalStyle('p, h1, h2, h3, h4, h5, h6', {
  overflowWrap: 'break-word',
})

// Global Typography
globalStyle('body', {
  fontFamily: '"Plus Jakarta Sans", sans-serif',
  fontWeight: 500,
})
