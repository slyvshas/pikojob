import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Box,
  Container,
  VStack,
  Heading,
  Text,
  Spinner,
  useToast,
  useColorModeValue,
  Icon,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Button,
} from '@chakra-ui/react'
import { FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa'
import { supabase } from '../lib/supabase'

const AuthCallback = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const toast = useToast()
  const [status, setStatus] = useState('loading') // 'loading', 'success', 'error'
  const [errorMessage, setErrorMessage] = useState('')

  // Theme colors
  const bgColor = useColorModeValue('gray.50', 'gray.900')
  const cardBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const textColor = useColorModeValue('gray.800', 'white')
  const mutedColor = useColorModeValue('gray.600', 'gray.400')

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Wait a bit for the session to be properly set
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          throw error
        }

        if (data.session) {
          setStatus('success')
          toast({
            title: 'Successfully signed in!',
            description: 'Welcome back! Your session has been saved.',
            status: 'success',
            duration: 3000,
            isClosable: true,
          })
          
          // Redirect to jobs page after a short delay
          setTimeout(() => {
            navigate('/jobs')
          }, 2000)
        } else {
          throw new Error('No session found')
        }
      } catch (error) {
        console.error('Auth callback error:', error)
        setStatus('error')
        setErrorMessage(error.message || 'Authentication failed')
        toast({
          title: 'Authentication Error',
          description: error.message || 'Failed to sign in',
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      }
    }

    handleAuthCallback()
  }, [navigate, toast])

  if (status === 'loading') {
    return (
      <Box bg={bgColor} minH="100vh" py={8}>
        <Container maxW="md">
          <Box
            bg={cardBg}
            p={8}
            borderRadius="xl"
            boxShadow="lg"
            border="1px solid"
            borderColor={borderColor}
            textAlign="center"
          >
            <VStack spacing={6}>
              <Spinner size="xl" thickness="4px" color="blue.500" />
              <Heading size="lg" color={textColor}>
                Signing You In
              </Heading>
              <Text color={mutedColor}>
                Please wait while we verify your magic link...
              </Text>
            </VStack>
          </Box>
        </Container>
      </Box>
    )
  }

  if (status === 'success') {
    return (
      <Box bg={bgColor} minH="100vh" py={8}>
        <Container maxW="md">
          <Box
            bg={cardBg}
            p={8}
            borderRadius="xl"
            boxShadow="lg"
            border="1px solid"
            borderColor={borderColor}
            textAlign="center"
          >
            <VStack spacing={6}>
              <Icon as={FaCheckCircle} color="green.500" boxSize={12} />
              <Heading size="lg" color={textColor}>
                Successfully Signed In!
              </Heading>
              <Alert status="success" borderRadius="lg">
                <AlertIcon />
                <Box>
                  <AlertTitle>Welcome Back!</AlertTitle>
                  <AlertDescription>
                    You have been successfully authenticated.
                  </AlertDescription>
                </Box>
              </Alert>
              <Text color={mutedColor} fontSize="sm">
                Redirecting you to the jobs page...
              </Text>
              <Button
                onClick={() => navigate('/jobs')}
                colorScheme="blue"
                size="lg"
                w="full"
              >
                Go to Jobs
              </Button>
            </VStack>
          </Box>
        </Container>
      </Box>
    )
  }

  if (status === 'error') {
    return (
      <Box bg={bgColor} minH="100vh" py={8}>
        <Container maxW="md">
          <Box
            bg={cardBg}
            p={8}
            borderRadius="xl"
            boxShadow="lg"
            border="1px solid"
            borderColor={borderColor}
            textAlign="center"
          >
            <VStack spacing={6}>
              <Icon as={FaExclamationTriangle} color="red.500" boxSize={12} />
              <Heading size="lg" color={textColor}>
                Authentication Failed
              </Heading>
              <Alert status="error" borderRadius="lg">
                <AlertIcon />
                <Box>
                  <AlertTitle>Sign In Error</AlertTitle>
                  <AlertDescription>
                    {errorMessage || 'Failed to authenticate with magic link'}
                  </AlertDescription>
                </Box>
              </Alert>
              <Text color={mutedColor} fontSize="sm">
                The magic link may have expired or is invalid.
              </Text>
              <VStack spacing={3} w="full">
                <Button
                  onClick={() => navigate('/login')}
                  colorScheme="blue"
                  size="lg"
                  w="full"
                >
                  Try Again
                </Button>
                <Button
                  onClick={() => navigate('/')}
                  variant="outline"
                  size="lg"
                  w="full"
                >
                  Back to Home
                </Button>
              </VStack>
            </VStack>
          </Box>
        </Container>
      </Box>
    )
  }

  return null
}

export default AuthCallback
