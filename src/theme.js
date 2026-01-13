import { extendTheme } from '@chakra-ui/react'

const config = {
  initialColorMode: 'light',
  useSystemColorMode: false,
}

const theme = extendTheme({
  config,
  styles: {
    global: {
      body: {
        bg: 'gray.50',
        color: 'gray.900',
      },
    },
  },
  colors: {
    blue: {
      50: '#e6f2ff',
      100: '#baddff',
      200: '#8dc7ff',
      300: '#5bb1ff',
      400: '#2e9bff',
      500: '#0080ff',
      600: '#0066cc',
      700: '#004d99',
      800: '#003366',
      900: '#001a33',
    },
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: '600',
      },
      variants: {
        solid: {
          bg: 'blue.600',
          color: 'white',
          _hover: {
            bg: 'blue.700',
            _disabled: {
              bg: 'blue.600',
            },
          },
          _active: {
            bg: 'blue.800',
          },
        },
        outline: {
          borderColor: 'blue.600',
          color: 'blue.700',
          _hover: {
            bg: 'blue.50',
          },
        },
      },
      defaultProps: {
        colorScheme: 'blue',
      },
    },
    Badge: {
      baseStyle: {
        fontWeight: '600',
      },
      variants: {
        solid: {
          bg: 'blue.600',
          color: 'white',
        },
        subtle: {
          bg: 'blue.100',
          color: 'blue.800',
        },
      },
    },
    Link: {
      baseStyle: {
        color: 'blue.700',
        _hover: {
          color: 'blue.800',
          textDecoration: 'underline',
        },
      },
    },
  },
})

export { theme } 