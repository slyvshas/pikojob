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
} from '@chakra-ui/react'
import { useAuth } from '../context/AuthContext'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()

  const handleSubmit = async (e) => {
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

  return (
    <Container maxW="md" py={10}>
      <VStack spacing={8}>
        <Heading>Welcome Back</Heading>
        <Box w="100%" as="form" onSubmit={handleSubmit}>
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Email</FormLabel>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Password</FormLabel>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
              />
            </FormControl>
            <Button
              type="submit"
              colorScheme="blue"
              width="100%"
              isLoading={isLoading}
            >
              Sign In
            </Button>
          </VStack>
        </Box>
        <Text>
          Don't have an account?{' '}
          <Link as={RouterLink} to="/register" color="blue.500">
            Sign up
          </Link>
        </Text>
      </VStack>
    </Container>
  )
}

export default Login 