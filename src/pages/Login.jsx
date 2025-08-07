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
  HStack,
  Divider,
  InputGroup,
  InputRightElement,
  IconButton,
  Badge,
  useBreakpointValue,
} from '@chakra-ui/react'
import { FaEnvelope, FaCheckCircle, FaEye, FaEyeSlash, FaLock, FaStar } from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isEmailSent, setIsEmailSent] = useState(false)
  const [authMethod, setAuthMethod] = useState('password') // Changed default to 'password'
  const [showPassword, setShowPassword] = useState(false)
  const { signIn, sendMagicLink } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()

  // Responsive values
  const containerMaxW = useBreakpointValue({ base: 'full', sm: 'md' })
  const padding = useBreakpointValue({ base: 4, sm: 8 })
  const cardPadding = useBreakpointValue({ base: 6, sm: 8 })
  const buttonSize = useBreakpointValue({ base: 'md', sm: 'lg' })
  const inputSize = useBreakpointValue({ base: 'md', sm: 'lg' })
  const headingSize = useBreakpointValue({ base: 'md', sm: 'lg' })
  const iconSize = useBreakpointValue({ base: 8, sm: 10 })
  const spacing = useBreakpointValue({ base: 6, sm: 8 })

  // Theme colors
  const bgColor = useColorModeValue('gray.50', 'gray.900')
  const cardBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const textColor = useColorModeValue('gray.800', 'white')
  const mutedColor = useColorModeValue('gray.600', 'gray.400')

  const handleMagicLinkSubmit = async (e) => {
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

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await signIn(email, password)
      navigate('/jobs')
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Invalid email or password',
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
      <Box bg={bgColor} minH="100vh" py={padding}>
        <Container maxW={containerMaxW} px={4}>
          <Box
            bg={cardBg}
            p={cardPadding}
            borderRadius="xl"
            boxShadow="lg"
            border="1px solid"
            borderColor={borderColor}
            textAlign="center"
          >
            <VStack spacing={6}>
              <Icon as={FaCheckCircle} color="green.500" boxSize={iconSize} />
              <Heading size={headingSize} color={textColor}>
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
                  size={buttonSize}
                >
                  Try Different Email
                </Button>
                <Button
                  onClick={() => navigate('/')}
                  colorScheme="blue"
                  w="full"
                  size={buttonSize}
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
    <Box bg={bgColor} minH="100vh" py={padding}>
      <Container maxW={containerMaxW} px={4}>
        <Box
          bg={cardBg}
          p={cardPadding}
          borderRadius="xl"
          boxShadow="lg"
          border="1px solid"
          borderColor={borderColor}
        >
          <VStack spacing={spacing}>
            <VStack spacing={4} textAlign="center">
              <Icon as={authMethod === 'magic' ? FaEnvelope : FaLock} color="blue.500" boxSize={iconSize} />
              <Heading size={headingSize} color={textColor}>
                Welcome Back
              </Heading>
              <Text color={mutedColor} fontSize="sm" px={2}>
                {authMethod === 'magic' 
                  ? 'Enter your email to receive a secure login link'
                  : 'Sign in with your email and password'
                }
              </Text>
            </VStack>

            {/* Authentication Method Toggle */}
            <VStack spacing={3} w="full">
              <Text fontSize="sm" color={mutedColor} fontWeight="medium">
                Choose your sign-in method:
              </Text>
              <HStack spacing={2} w="full" justify="center" flexWrap="wrap">
                <Button
                  size="sm"
                  variant={authMethod === 'password' ? 'solid' : 'outline'}
                  colorScheme="blue"
                  onClick={() => setAuthMethod('password')}
                  leftIcon={<FaLock />}
                  rightIcon={authMethod === 'password' ? <FaStar /> : undefined}
                  minH="40px"
                  px={3}
                >
                  <VStack spacing={0} align="center">
                    <Text fontSize="sm">Password</Text>
                    {authMethod === 'password' && (
                      <Badge colorScheme="green" fontSize="2xs" mt={1}>
                        Recommended
                      </Badge>
                    )}
                  </VStack>
                </Button>
                <Button
                  size="sm"
                  variant={authMethod === 'magic' ? 'solid' : 'outline'}
                  colorScheme="gray"
                  onClick={() => setAuthMethod('magic')}
                  leftIcon={<FaEnvelope />}
                  minH="40px"
                  px={3}
                >
                  <Text fontSize="sm">Magic Link</Text>
                </Button>
              </HStack>
            </VStack>

            <Box w="100%" as="form" onSubmit={authMethod === 'magic' ? handleMagicLinkSubmit : handlePasswordSubmit}>
              <VStack spacing={6}>
                <FormControl isRequired>
                  <FormLabel color={textColor} fontSize="sm">Email Address</FormLabel>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    size={inputSize}
                    borderRadius="lg"
                    borderColor={borderColor}
                    _focus={{
                      borderColor: 'blue.500',
                      boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)',
                    }}
                  />
                </FormControl>

                {authMethod === 'password' && (
                  <FormControl isRequired>
                    <FormLabel color={textColor} fontSize="sm">Password</FormLabel>
                    <InputGroup size={inputSize}>
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        borderRadius="lg"
                        borderColor={borderColor}
                        _focus={{
                          borderColor: 'blue.500',
                          boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)',
                        }}
                      />
                      <InputRightElement>
                        <IconButton
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                          icon={showPassword ? <FaEyeSlash /> : <FaEye />}
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowPassword(!showPassword)}
                          minH="40px"
                        />
                      </InputRightElement>
                    </InputGroup>
                  </FormControl>
                )}

                <Button
                  type="submit"
                  colorScheme="blue"
                  width="100%"
                  size={buttonSize}
                  isLoading={isLoading}
                  loadingText={authMethod === 'magic' ? 'Sending Magic Link' : 'Signing In'}
                  borderRadius="lg"
                  minH="48px"
                >
                  {authMethod === 'magic' ? 'Send Magic Link' : 'Sign In'}
                </Button>
              </VStack>
            </Box>

            <VStack spacing={4} w="full">
              {authMethod === 'password' ? (
                <Alert status="info" borderRadius="lg" fontSize="sm">
                  <AlertIcon />
                  <Box>
                    <AlertTitle fontSize="sm">Recommended Method</AlertTitle>
                    <AlertDescription fontSize="xs">
                      Password login is faster and more secure. Your session will be remembered.
                    </AlertDescription>
                  </Box>
                </Alert>
              ) : (
                <Text color={mutedColor} fontSize="sm" textAlign="center" px={2}>
                  Magic link is sent to your email. Check your inbox and click the link to sign in.
                </Text>
              )}
              
              <Text fontSize="sm" color={mutedColor} textAlign="center">
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