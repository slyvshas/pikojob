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
  InputGroup,
  InputRightElement,
  IconButton,
  Badge,
} from '@chakra-ui/react'
import { FaUserPlus, FaCheckCircle, FaEye, FaEyeSlash, FaLock, FaEnvelope, FaStar } from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'

const Register = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isEmailSent, setIsEmailSent] = useState(false)
  const [authMethod, setAuthMethod] = useState('password') // Changed default to 'password'
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const { signUp, sendMagicLink } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()

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
        description: 'Check your email for the registration link',
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
    
    if (password !== confirmPassword) {
      toast({
        title: 'Error',
        description: 'Passwords do not match',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    if (password.length < 6) {
      toast({
        title: 'Error',
        description: 'Password must be at least 6 characters long',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    setIsLoading(true)

    try {
      await signUp(email, password)
      toast({
        title: 'Success',
        description: 'Please check your email to confirm your account',
        status: 'success',
        duration: 5000,
        isClosable: true,
      })
      navigate('/login')
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create account',
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
                    We've sent a secure registration link to <strong>{email}</strong>
                  </AlertDescription>
                </Box>
              </Alert>
              <Text color={mutedColor} fontSize="sm">
                Click the link in your email to create your account. The link will expire in 1 hour.
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
              <Icon as={authMethod === 'magic' ? FaEnvelope : FaUserPlus} color="blue.500" boxSize={10} />
              <Heading size="lg" color={textColor}>
                Create Account
              </Heading>
              <Text color={mutedColor}>
                {authMethod === 'magic' 
                  ? 'Enter your email to create a secure account'
                  : 'Create your account with email and password'
                }
              </Text>
            </VStack>

            {/* Authentication Method Toggle */}
            <VStack spacing={3} w="full">
              <Text fontSize="sm" color={mutedColor} fontWeight="medium">
                Choose your registration method:
              </Text>
              <HStack spacing={2} w="full" justify="center">
                <Button
                  size="sm"
                  variant={authMethod === 'password' ? 'solid' : 'outline'}
                  colorScheme="blue"
                  onClick={() => setAuthMethod('password')}
                  leftIcon={<FaLock />}
                  rightIcon={authMethod === 'password' ? <FaStar /> : undefined}
                >
                  Password
                  {authMethod === 'password' && (
                    <Badge ml={2} colorScheme="green" fontSize="xs">
                      Recommended
                    </Badge>
                  )}
                </Button>
                <Button
                  size="sm"
                  variant={authMethod === 'magic' ? 'solid' : 'outline'}
                  colorScheme="gray"
                  onClick={() => setAuthMethod('magic')}
                  leftIcon={<FaEnvelope />}
                >
                  Magic Link
                </Button>
              </HStack>
            </VStack>

            <Box w="100%" as="form" onSubmit={authMethod === 'magic' ? handleMagicLinkSubmit : handlePasswordSubmit}>
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

                {authMethod === 'password' && (
                  <>
                    <FormControl isRequired>
                      <FormLabel color={textColor}>Password</FormLabel>
                      <InputGroup size="lg">
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Create a password (min 6 characters)"
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
                          />
                        </InputRightElement>
                      </InputGroup>
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel color={textColor}>Confirm Password</FormLabel>
                      <InputGroup size="lg">
                        <Input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirm your password"
                          borderRadius="lg"
                          borderColor={borderColor}
                          _focus={{
                            borderColor: 'blue.500',
                            boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)',
                          }}
                        />
                        <InputRightElement>
                          <IconButton
                            aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                            icon={showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          />
                        </InputRightElement>
                      </InputGroup>
                    </FormControl>
                  </>
                )}

                <Button
                  type="submit"
                  colorScheme="blue"
                  width="100%"
                  size="lg"
                  isLoading={isLoading}
                  loadingText={authMethod === 'magic' ? 'Sending Magic Link' : 'Creating Account'}
                  borderRadius="lg"
                >
                  {authMethod === 'magic' ? 'Create Account' : 'Sign Up'}
                </Button>
              </VStack>
            </Box>

            <VStack spacing={4} w="full">
              {authMethod === 'password' ? (
                <Alert status="info" borderRadius="lg">
                  <AlertIcon />
                  <Box>
                    <AlertTitle>Recommended Method</AlertTitle>
                    <AlertDescription>
                      Password registration is faster and more secure. Your session will be remembered.
                    </AlertDescription>
                  </Box>
                </Alert>
              ) : (
                <Text color={mutedColor} fontSize="sm" textAlign="center">
                  Magic link is sent to your email. Check your inbox and click the link to create your account.
                </Text>
              )}
              
              <Text fontSize="sm" color={mutedColor}>
                Already have an account?{' '}
                <Link as={RouterLink} to="/login" color="blue.500" fontWeight="medium">
                  Sign in
                </Link>
              </Text>
            </VStack>
          </VStack>
        </Box>
      </Container>
    </Box>
  )
}

export default Register 