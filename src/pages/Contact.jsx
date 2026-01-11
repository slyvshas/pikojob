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
  useColorModeValue,
  Flex,
  Divider
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { FaEnvelope, FaLinkedin } from 'react-icons/fa'
import { SiThreads } from 'react-icons/si'

const MotionBox = motion(Box)

const ContactMethod = ({ icon, title, content, href, color }) => {
  return (
    <Link
      href={href}
      isExternal
      _hover={{ textDecoration: 'none' }}
      w="full"
    >
      <MotionBox
        whileHover={{ y: -4, x: 4 }}
        bg={useColorModeValue('white', 'gray.800')}
        p={6}
        rounded="2xl"
        shadow="md"
        borderLeft="4px solid"
        borderColor={color}
        transition="all 0.3s ease"
        display="flex"
        alignItems="center"
        gap={4}
      >
        <Flex
          w={12}
          h={12}
          align="center"
          justify="center"
          rounded="full"
          bg={`${color.split('.')[0]}.50`}
          color={color}
        >
          <Icon as={icon} w={6} h={6} />
        </Flex>
        <Box>
          <Text fontWeight="bold" fontSize="md">{title}</Text>
          <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')}>
            {content}
          </Text>
        </Box>
      </MotionBox>
    </Link>
  )
}

const Contact = () => {
  const cardBg = useColorModeValue('white', 'gray.800')
  
  const heroBg = useColorModeValue(
    'radial-gradient(circle at top right, rgba(66, 153, 225, 0.1), transparent 40%), radial-gradient(circle at bottom left, rgba(128, 90, 213, 0.1), transparent 40%)',
    'radial-gradient(circle at top right, rgba(66, 153, 225, 0.1), transparent 40%), radial-gradient(circle at bottom left, rgba(128, 90, 213, 0.1), transparent 40%)'
  )

  return (
    <Box minH="100vh" bg={useColorModeValue('gray.50', 'gray.900')}>
      {/* Hero Section */}
      <Box bg={heroBg} pt={{ base: 12, md: 20 }} pb={{ base: 20, md: 32 }}>
        <Container maxW="container.xl" textAlign="center">
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Heading
              as="h1"
              size="2xl"
              mb={4}
              bgGradient="linear(to-r, blue.600, purple.600)"
              bgClip="text"
            >
              Get in Touch
            </Heading>
            <Text fontSize="xl" color="gray.500" maxW="2xl" mx="auto">
              Have questions or feedback? We'd love to hear from you.
            </Text>
          </MotionBox>
        </Container>
      </Box>

      <Container maxW="container.xl" mt="-100px" pb={20}>
        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={10}>
          {/* Left Column: Info & Socials */}
          <VStack spacing={6} align="stretch">
             <Box
              bg={cardBg}
              p={8}
              rounded="2xl"
              shadow="xl"
            >
              <Heading size="md" mb={6}>Connect with us</Heading>
              <VStack spacing={4}>
                <ContactMethod
                  icon={FaEnvelope}
                  title="Email Us"
                  content="contactgrowlytic@gmail.com"
                  href="mailto:contactgrowlytic@gmail.com"
                  color="blue.500"
                />
                <ContactMethod
                  icon={FaLinkedin}
                  title="Follow on LinkedIn"
                  content="Growlytic Company"
                  href="https://linkedin.com/company/growlytic"
                  color="blue.700"
                />
                 <ContactMethod
                  icon={SiThreads}
                  title="Follow on Threads"
                  content="@growlytic"
                  href="https://threads.net/@growlytic"
                  color="gray.500" // Use a safe color like gray or black
                />
              </VStack>
            </Box>
            
            <Box bg={cardBg} p={8} rounded="2xl" shadow="md">
               <Heading size="md" mb={4}>Frequently Asked Questions</Heading>
               <VStack align="start" spacing={4} divider={<Divider />}>
                  <Box>
                    <Text fontWeight="bold">How can I contribute?</Text>
                    <Text fontSize="sm" color="gray.500">You can submit guest posts or suggest resources via email.</Text>
                  </Box>
                  <Box>
                    <Text fontWeight="bold">Is everything free?</Text>
                    <Text fontSize="sm" color="gray.500">Yes! Our mission is to provide free educational resources for everyone.</Text>
                  </Box>
               </VStack>
            </Box>
          </VStack>

          {/* Right Column: Contact Form */}
          <MotionBox
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            bg={formBg}
            p={{ base: 8, md: 10 }}
            rounded="2xl"
            shadow="xl"
            borderTop="4px solid"
            borderColor="purple.500"
          >
            <VStack spacing={6} as="form" onSubmit={handleSubmit}>
              <Box w="full">
                <Heading size="lg" mb={2}>Send us a message</Heading>
                <Text color="gray.500" fontSize="sm">
                  Fill out the form below and we'll reply within 24 hours.
                </Text>
              </Box>

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} w="full">
                <FormControl isRequired>
                  <FormLabel fontSize="sm" fontWeight="semibold">Name</FormLabel>
                  <Input
                    name="name"
                    placeholder="Your name"
                    value={formData.name}
                    onChange={handleChange}
                    focusBorderColor="purple.500"
                    size="lg"
                    bg={useColorModeValue('gray.50', 'whiteAlpha.100')}
                    border="none"
                    _focus={{ bg: 'transparent', border: '1px solid', borderColor: 'purple.500' }}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel fontSize="sm" fontWeight="semibold">Email</FormLabel>
                  <Input
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    focusBorderColor="purple.500"
                    size="lg"
                    bg={useColorModeValue('gray.50', 'whiteAlpha.100')}
                    border="none"
                    _focus={{ bg: 'transparent', border: '1px solid', borderColor: 'purple.500' }}
                  />
                </FormControl>
              </SimpleGrid>

              <FormControl isRequired>
                <FormLabel fontSize="sm" fontWeight="semibold">Subject</FormLabel>
                <Input
                  name="subject"
                  placeholder="How can we help?"
                  value={formData.subject}
                  onChange={handleChange}
                  focusBorderColor="purple.500"
                  size="lg"
                  bg={useColorModeValue('gray.50', 'whiteAlpha.100')}
                  border="none"
                  _focus={{ bg: 'transparent', border: '1px solid', borderColor: 'purple.500' }}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontSize="sm" fontWeight="semibold">Message</FormLabel>
                <Textarea
                  name="message"
                  placeholder="Tell us more about your inquiry..."
                  value={formData.message}
                  onChange={handleChange}
                  focusBorderColor="purple.500"
                  size="lg"
                  rows={6}
                  bg={useColorModeValue('gray.50', 'whiteAlpha.100')}
                  border="none"
                  _focus={{ bg: 'transparent', border: '1px solid', borderColor: 'purple.500' }}
                />
              </FormControl>

              <Button
                type="submit"
                colorScheme="purple"
                size="lg"
                w="full"
                isLoading={isSubmitting}
                loadingText="Sending..."
                rightIcon={<FaPaperPlane />}
                _hover={{ transform: 'translateY(-2px)', shadow: 'lg' }}
              >
                Send Message
              </Button>
            </VStack>
          </MotionBox>
        </SimpleGrid>
      </Container>
    </Box>
  )
}

export default Contact
