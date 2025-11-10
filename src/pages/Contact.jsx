import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  SimpleGrid,
  Icon,
  Link,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  useColorModeValue,
  useToast
} from '@chakra-ui/react'
import { FaEnvelope, FaLinkedin } from 'react-icons/fa'
import { SiThreads } from 'react-icons/si'
import { useState } from 'react'
import { supabase } from '../lib/supabase'

const ContactMethod = ({ icon, title, content, href }) => {
  return (
    <Link
      href={href}
      isExternal
      _hover={{ textDecoration: 'none' }}
    >
      <Box
        bg={useColorModeValue('white', 'gray.800')}
        p={6}
        rounded="lg"
        shadow="md"
        textAlign="center"
        _hover={{
          transform: 'translateY(-4px)',
          shadow: 'xl',
          borderColor: 'blue.500',
        }}
        transition="all 0.3s ease"
        border="2px solid"
        borderColor={useColorModeValue('gray.200', 'gray.700')}
      >
        <Icon as={icon} w={8} h={8} color="blue.500" mb={3} />
        <Text fontWeight="600" fontSize="lg" mb={2}>{title}</Text>
        <Text color={useColorModeValue('gray.600', 'gray.400')}>{content}</Text>
      </Box>
    </Link>
  )
}

const Contact = () => {
  const bgColor = useColorModeValue('gray.50', 'gray.900')
  const toast = useToast()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Insert the contact message into Supabase
      const { data, error } = await supabase
        .from('contact_messages')
        .insert([
          {
            name: formData.name,
            email: formData.email,
            subject: formData.subject,
            message: formData.message,
            status: 'unread'
          }
        ])

      if (error) throw error

      toast({
        title: 'Message sent!',
        description: "We'll get back to you as soon as possible.",
        status: 'success',
        duration: 5000,
        isClosable: true,
      })
      setFormData({ name: '', email: '', subject: '', message: '' })
    } catch (error) {
      console.error('Error submitting contact form:', error)
      toast({
        title: 'Error sending message',
        description: 'There was a problem submitting your message. Please try again or email us directly.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Box bg={bgColor} minH="calc(100vh - 64px)" py={12}>
      <Container maxW="container.xl">
        <VStack spacing={12} align="stretch">
          {/* Hero Section */}
          <VStack spacing={4} textAlign="center">
            <Heading
              as="h1"
              size="2xl"
              bgGradient="linear(to-r, blue.400, purple.500)"
              bgClip="text"
            >
              Get in Touch
            </Heading>
            <Text fontSize="xl" color={useColorModeValue('gray.600', 'gray.400')} maxW="2xl">
              Have questions, suggestions, or feedback? We'd love to hear from you!
            </Text>
          </VStack>

          {/* Contact Methods */}
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} justifyItems="center">
            <ContactMethod
              icon={FaEnvelope}
              title="Email"
              content="support@growlytic.app"
              href="mailto:support@growlytic.app"
            />
            <ContactMethod
              icon={SiThreads}
              title="Threads"
              content="@growlytic"
              href="https://www.threads.com/@growlytic.app"
            />
            <ContactMethod
              icon={FaLinkedin}
              title="LinkedIn"
              content="Growlytic"
              href="https://www.linkedin.com/company/growlytic/?viewAsMember=true"
            />
          </SimpleGrid>

          {/* Contact Form */}
          <Box
            bg={useColorModeValue('white', 'gray.800')}
            p={8}
            rounded="lg"
            shadow="lg"
            maxW="3xl"
            mx="auto"
            w="full"
          >
            <Heading as="h2" size="lg" mb={6} textAlign="center">
              Send Us a Message
            </Heading>
            <form onSubmit={handleSubmit}>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Name</FormLabel>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your name"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Email</FormLabel>
                  <Input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your.email@example.com"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Subject</FormLabel>
                  <Input
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="What's this about?"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Message</FormLabel>
                  <Textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us more..."
                    rows={6}
                  />
                </FormControl>

                <Button
                  type="submit"
                  colorScheme="blue"
                  size="lg"
                  width="full"
                  isLoading={isSubmitting}
                  _hover={{
                    transform: 'translateY(-2px)',
                    boxShadow: 'lg',
                  }}
                  transition="all 0.3s ease"
                >
                  Send Message
                </Button>
              </VStack>
            </form>
          </Box>

          {/* Additional Info */}
          <Box
            bg={useColorModeValue('blue.50', 'gray.800')}
            p={6}
            rounded="lg"
            textAlign="center"
          >
            <Text fontSize="md" color={useColorModeValue('gray.700', 'gray.300')}>
              We typically respond within 24-48 hours. For urgent matters, please reach out via email.
            </Text>
          </Box>
        </VStack>
      </Container>
    </Box>
  )
}

export default Contact
