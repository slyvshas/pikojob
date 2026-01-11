import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  VStack,
  Heading,
  Text,
  Input,
  Button,
  FormControl,
  FormLabel,
  useToast,
  Card,
  CardBody,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  IconButton,
  useColorModeValue,
} from '@chakra-ui/react';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaShieldAlt } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn, isAdmin, user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // If already logged in as admin, redirect to dashboard
  React.useEffect(() => {
    if (user && isAdmin) {
      navigate('/admin/blog-management');
    }
  }, [user, isAdmin, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await signIn(email, password);

      if (error) {
        toast({
          title: 'Login Failed',
          description: error.message || 'Invalid email or password',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        return;
      }

      toast({
        title: 'Login Successful',
        description: 'Welcome back, Admin!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      // Navigate to admin dashboard
      navigate('/admin/blog-management');
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxW="md" py={16}>
      <VStack spacing={8}>
        <VStack spacing={2} textAlign="center">
          <Box
            p={4}
            borderRadius="full"
            bg="purple.100"
            color="purple.600"
          >
            <FaShieldAlt size={40} />
          </Box>
          <Heading size="xl">Admin Login</Heading>
          <Text color="gray.500">
            Sign in to access the admin dashboard
          </Text>
        </VStack>

        <Card
          w="full"
          bg={cardBg}
          border="1px solid"
          borderColor={borderColor}
          boxShadow="lg"
        >
          <CardBody>
            <form onSubmit={handleLogin}>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Email</FormLabel>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none">
                      <FaEnvelope color="gray" />
                    </InputLeftElement>
                    <Input
                      type="email"
                      placeholder="admin@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </InputGroup>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Password</FormLabel>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none">
                      <FaLock color="gray" />
                    </InputLeftElement>
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <InputRightElement>
                      <IconButton
                        variant="ghost"
                        size="sm"
                        icon={showPassword ? <FaEyeSlash /> : <FaEye />}
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      />
                    </InputRightElement>
                  </InputGroup>
                </FormControl>

                <Button
                  type="submit"
                  colorScheme="purple"
                  size="lg"
                  w="full"
                  isLoading={loading}
                  loadingText="Signing in..."
                >
                  Sign In
                </Button>
              </VStack>
            </form>
          </CardBody>
        </Card>

        <Text fontSize="sm" color="gray.500" textAlign="center">
          This area is restricted to authorized administrators only.
        </Text>
      </VStack>
    </Container>
  );
};

export default AdminLogin;
