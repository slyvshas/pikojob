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

const Register = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()

  const handleSubmit = async (e) => {
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
        description: 'Failed to create account',
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
        <Heading>Create Account</Heading>
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
                placeholder="Create a password"
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Confirm Password</FormLabel>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
              />
            </FormControl>
            <Button
              type="submit"
              colorScheme="blue"
              width="100%"
              isLoading={isLoading}
            >
              Sign Up
            </Button>
          </VStack>
        </Box>
        <Text>
          Already have an account?{' '}
          <Link as={RouterLink} to="/login" color="blue.500">
            Sign in
          </Link>
        </Text>
      </VStack>
    </Container>
  )
}

export default Register 