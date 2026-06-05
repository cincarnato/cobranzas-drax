/**
 * plugins/vuetify.ts
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// Styles
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

// Translations provided by Vuetify
import { es, en } from 'vuetify/locale'

// Composables
import { createVuetify } from 'vuetify'
import dark from './themes/DarkTheme'
import light from './themes/LightTheme'

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
export default createVuetify({
  theme: {
    defaultTheme: 'dark',
    variations: {
      colors: ['primary', 'secondary'],
      lighten: 1,
      darken: 2,
    },
    themes: {
      light,
      dark,
    },
  },
  defaults: {
    global: {
      density: 'comfortable',
      rounded: 'lg',
    },
    VAppBar: {
      color: 'toolbar',
      elevation: 0,
    },
    VBtn: {
      color: 'primary',
      variant: 'flat',
      class: 'text-none font-weight-medium',
    },
    VCard: {
      elevation: 1,
      rounded: 'xl',
    },
    VTextField: {
      variant: 'outlined',
      density: 'compact',
      hideDetails: 'auto',
    },
    VTextarea: {
      variant: 'outlined',
      density: 'compact',
      hideDetails: 'auto',
    },
    VSelect: {
      variant: 'outlined',
      density: 'compact',
      hideDetails: 'auto',
    },
    VAutocomplete: {
      variant: 'outlined',
      density: 'compact',
      hideDetails: 'auto',
    },
    VCombobox: {
      variant: 'outlined',
      density: 'compact',
      hideDetails: 'auto',
    },
    VSwitch: {
      color: 'primary',
      density: 'compact',
      hideDetails: 'auto',
    },
    VCheckbox: {
      density: 'compact',
      hideDetails: 'auto',
    },
    VCardActions: {
      VBtn: {
        variant: 'text',
      },
    },
    VToolbar: {
      color: 'toolbar',
      VBtn: {
        variant: 'text',
      },
    },
  },
  locale: {
    locale: 'es',
    fallback: 'en',
    messages: { es, en },
  },
})
