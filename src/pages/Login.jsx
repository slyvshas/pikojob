import { useState } from 'react'
import { useNavigate, Link as RouterLink } from 'react-router-dom'
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  Text,
  Link,
  useToast,
  Container,
  useColorModeValue,
  Icon,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react'
import { FaEnvelope, FaCheckCircle } from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'

const Login = () => {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isEmailSent, setIsEmailSent] = useState(false)
  const { sendMagicLink } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()

  // Theme colors
  const bgColor = useColorModeValue('gray.50', 'gray.900')
  const cardBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const textColor = useColorModeValue('gray.800', 'white')
  const mutedColor = useColorModeValue('gray.600', 'gray.400')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await sendMagicLink(email)
      setIsEmailSent(true)
      toast({
        title: 'Magic Link Sent!',
        description: 'Check your email for the login link',
        status: 'success',
        duration: 5000,
        isClosable: true,
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to send magic link',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isEmailSent) {
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
                Check Your Email
              </Heading>
              <Alert status="success" borderRadius="lg">
                <AlertIcon />
                <Box>
                  <AlertTitle>Magic Link Sent!</AlertTitle>
                  <AlertDescription>
                    We've sent a secure login link to <strong>{email}</strong>
                  </AlertDescription>
                </Box>
              </Alert>
              <Text color={mutedColor} fontSize="sm">
                Click the link in your email to sign in. The link will expire in 1 hour.
              </Text>
              <VStack spacing={3} w="full">
                <Button
                  onClick={() => setIsEmailSent(false)}
                  variant="outline"
                  w="full"
                  size="lg"
                >
                  Try Different Email
                </Button>
                <Button
                  onClick={() => navigate('/')}
                  colorScheme="blue"
                  w="full"
                  size="lg"
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
        >
          <VStack spacing={8}>
            <VStack spacing={4} textAlign="center">
              <Icon as={FaEnvelope} color="blue.500" boxSize={10} />
              <Heading size="lg" color={textColor}>
                Welcome Back
              </Heading>
              <Text color={mutedColor}>
                Enter your email to receive a secure login link
              </Text>
            </VStack>

            <Box w="100%" as="form" onSubmit={handleSubmit}>
              <VStack spacing={6}>
                <FormControl isRequired>
                  <FormLabel color={textColor}>Email Address</FormLabel>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    size="lg"
                    borderRadius="lg"
                    borderColor={borderColor}
                    _focus={{
                      borderColor: 'blue.500',
                      boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)',
                    }}
                  />
                </FormControl>

                <Button
                  type="submit"
                  colorScheme="blue"
                  width="100%"
                  size="lg"
                  isLoading={isLoading}
                  loadingText="Sending Magic Link"
                  borderRadius="lg"
                >
                  Send Magic Link
                </Button>
              </VStack>
            </Box>

            <VStack spacing={4} w="full">
              <Text color={mutedColor} fontSize="sm" textAlign="center">
                No password required! We'll send you a secure link to sign in.
              </Text>
              
              <Text fontSize="sm" color={mutedColor}>
                Don't have an account?{' '}
                <Link as={RouterLink} to="/register" color="blue.500" fontWeight="medium">
                  Sign up
                </Link>
              </Text>
            </VStack>
          </VStack>
        </Box>
      </Container>
    </Box>
  )
}

export default Login 