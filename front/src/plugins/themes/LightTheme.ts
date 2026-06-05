import type { ThemeDefinition } from 'vuetify'

const LightTheme: ThemeDefinition = {
  dark: false,
  colors: {
    background: '#F2FBFA',
    surface: '#ffffff',
    'surface-bright': '#FFFFFF',
    'surface-light': '#E7F6F5',
    'surface-variant': '#D7EEED',
    'on-surface-variant': '#315857',

    primary: '#10A6A4',
    'primary-darken-1': '#087F7E',
    secondary: '#0F766E',
    'secondary-darken-1': '#0B5F59',
    accent: '#5AD6D0',
    toolbar: '#087F7E',

    error: '#D14343',
    info: '#1976D2',
    success: '#009B72',
    warning: '#F59E0B',

    pending: '#F59E0B',
    completed: '#009B72',
    cancelled: '#D14343',
  },
  variables: {
    'border-color': '#003B3A',
    'border-opacity': 0.12,
    'high-emphasis-opacity': 0.88,
    'medium-emphasis-opacity': 0.64,
    'disabled-opacity': 0.38,
  },
}

export default LightTheme
