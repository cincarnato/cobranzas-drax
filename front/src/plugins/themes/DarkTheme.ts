import type { ThemeDefinition } from 'vuetify'

const DarkTheme: ThemeDefinition = {
  dark: true,
  colors: {
    background: '#061918',
    surface: '#0B2423',
    'surface-bright': '#173B39',
    'surface-light': '#12302F',
    'surface-variant': '#204846',
    'on-surface-variant': '#B8DAD8',

    primary: '#10A6A4',
    'primary-darken-1': '#0C8F8D',
    secondary: '#6BD6D0',
    'secondary-darken-1': '#31B9B4',
    accent: '#9FE7E3',
    toolbar: '#082120',

    error: '#FF6B6B',
    info: '#64B5F6',
    success: '#3DD598',
    warning: '#FFC857',

    pending: '#FFC857',
    completed: '#3DD598',
    cancelled: '#FF6B6B',
  },
  variables: {
    'border-color': '#D8F7F5',
    'border-opacity': 0.14,
    'high-emphasis-opacity': 0.92,
    'medium-emphasis-opacity': 0.68,
    'disabled-opacity': 0.42,
  },
}

export default DarkTheme
