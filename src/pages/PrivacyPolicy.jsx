import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  useColorModeValue,
  Divider,
  List,
  ListItem,
  ListIcon
} from '@chakra-ui/react'
import { MdCheckCircle } from 'react-icons/md'

const Section = ({ title, children }) => {
  return (
    <VStack align="stretch" spacing={3}>
      <Heading as="h2" size="lg" color="blue.500">
        {title}
      </Heading>
      {children}
    </VStack>
  )
}

const PrivacyPolicy = () => {
  const bgColor = useColorModeValue('gray.50', 'gray.900')
  const contentBg = useColorModeValue('white', 'gray.800')
  const textColor = useColorModeValue('gray.700', 'gray.300')

  return (
    <Box bg={bgColor} minH="calc(100vh - 64px)" py={12}>
      <Container maxW="container.lg">
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <VStack spacing={4} textAlign="center">
            <Heading
              as="h1"
              size="2xl"
              bgGradient="linear(to-r, blue.400, purple.500)"
              bgClip="text"
            >
              Privacy Policy
            </Heading>
            <Text fontSize="md" color={useColorModeValue('gray.600', 'gray.400')}>
              Last updated: November 10, 2025
            </Text>
          </VStack>

          {/* Content */}
          <Box bg={contentBg} p={8} rounded="lg" shadow="lg">
            <VStack spacing={8} align="stretch">
              <Section title="Introduction">
                <Text color={textColor} lineHeight="tall">
                  Welcome to Growlytic ("we", "our", or "us"). We are committed to protecting your personal information 
                  and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard 
                  your information when you visit our website and use our services.
                </Text>
              </Section>

              <Divider />

              <Section title="Information We Collect">
                <Text color={textColor} lineHeight="tall">
                  We collect information that you provide directly to us when you:
                </Text>
                <List spacing={2} mt={3}>
                  <ListItem color={textColor}>
                    <ListIcon as={MdCheckCircle} color="green.500" />
                    Create an account and register
                  </ListItem>
                  <ListItem color={textColor}>
                    <ListIcon as={MdCheckCircle} color="green.500" />
                    Save jobs, courses, or other content
                  </ListItem>
                  <ListItem color={textColor}>
                    <ListIcon as={MdCheckCircle} color="green.500" />
                    Contact us through our contact form
                  </ListItem>
                  <ListItem color={textColor}>
                    <ListIcon as={MdCheckCircle} color="green.500" />
                    Subscribe to our newsletters or updates
                  </ListItem>
                  <ListItem color={textColor}>
                    <ListIcon as={MdCheckCircle} color="green.500" />
                    Interact with our platform and services
                  </ListItem>
                </List>
              </Section>

              <Divider />

              <Section title="How We Use Your Information">
                <Text color={textColor} lineHeight="tall">
                  We use the information we collect to:
                </Text>
                <List spacing={2} mt={3}>
                  <ListItem color={textColor}>
                    <ListIcon as={MdCheckCircle} color="blue.500" />
                    Provide, operate, and maintain our services
                  </ListItem>
                  <ListItem color={textColor}>
                    <ListIcon as={MdCheckCircle} color="blue.500" />
                    Improve and personalize your experience
                  </ListItem>
                  <ListItem color={textColor}>
                    <ListIcon as={MdCheckCircle} color="blue.500" />
                    Send you updates and notifications
                  </ListItem>
                  <ListItem color={textColor}>
                    <ListIcon as={MdCheckCircle} color="blue.500" />
                    Respond to your inquiries and support requests
                  </ListItem>
                  <ListItem color={textColor}>
                    <ListIcon as={MdCheckCircle} color="blue.500" />
                    Analyze usage patterns to improve our platform
                  </ListItem>
                </List>
              </Section>

              <Divider />

              <Section title="Data Security">
                <Text color={textColor} lineHeight="tall">
                  We implement appropriate technical and organizational security measures to protect your personal 
                  information. However, please note that no method of transmission over the internet or electronic 
                  storage is 100% secure. We use industry-standard encryption and secure authentication provided by 
                  Supabase to protect your data.
                </Text>
              </Section>

              <Divider />

              <Section title="Third-Party Services">
                <Text color={textColor} lineHeight="tall">
                  We use third-party services to help us operate our platform:
                </Text>
                <List spacing={2} mt={3}>
                  <ListItem color={textColor}>
                    <ListIcon as={MdCheckCircle} color="purple.500" />
                    <strong>Supabase:</strong> For authentication and database services
                  </ListItem>
                  <ListItem color={textColor}>
                    <ListIcon as={MdCheckCircle} color="purple.500" />
                    <strong>Google Analytics:</strong> For website analytics and performance monitoring
                  </ListItem>
                  <ListItem color={textColor}>
                    <ListIcon as={MdCheckCircle} color="purple.500" />
                    <strong>Google AdSense:</strong> For displaying relevant advertisements
                  </ListItem>
                </List>
              </Section>

              <Divider />

              <Section title="Cookies and Tracking">
                <Text color={textColor} lineHeight="tall">
                  We use cookies and similar tracking technologies to track activity on our platform and store certain 
                  information. Cookies are files with a small amount of data that may include an anonymous unique 
                  identifier. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
                </Text>
              </Section>

              <Divider />

              <Section title="Your Rights">
                <Text color={textColor} lineHeight="tall">
                  You have the right to:
                </Text>
                <List spacing={2} mt={3}>
                  <ListItem color={textColor}>
                    <ListIcon as={MdCheckCircle} color="orange.500" />
                    Access and receive a copy of your personal data
                  </ListItem>
                  <ListItem color={textColor}>
                    <ListIcon as={MdCheckCircle} color="orange.500" />
                    Request correction of inaccurate data
                  </ListItem>
                  <ListItem color={textColor}>
                    <ListIcon as={MdCheckCircle} color="orange.500" />
                    Request deletion of your personal data
                  </ListItem>
                  <ListItem color={textColor}>
                    <ListIcon as={MdCheckCircle} color="orange.500" />
                    Object to processing of your personal data
                  </ListItem>
                  <ListItem color={textColor}>
                    <ListIcon as={MdCheckCircle} color="orange.500" />
                    Withdraw consent at any time
                  </ListItem>
                </List>
              </Section>

              <Divider />

              <Section title="Children's Privacy">
                <Text color={textColor} lineHeight="tall">
                  Our services are not intended for children under the age of 13. We do not knowingly collect personal 
                  information from children under 13. If you are a parent or guardian and believe we may have collected 
                  information about a child, please contact us immediately.
                </Text>
              </Section>

              <Divider />

              <Section title="Changes to This Policy">
                <Text color={textColor} lineHeight="tall">
                  We may update this Privacy Policy from time to time. We will notify you of any changes by posting the 
                  new Privacy Policy on this page and updating the "Last updated" date. You are advised to review this 
                  Privacy Policy periodically for any changes.
                </Text>
              </Section>

              <Divider />

              <Section title="Contact Us">
                <Text color={textColor} lineHeight="tall">
                  If you have any questions about this Privacy Policy, please contact us at:
                </Text>
                <Box
                  mt={4}
                  p={4}
                  bg={useColorModeValue('blue.50', 'gray.700')}
                  rounded="md"
                >
                  <Text color={textColor} fontWeight="600">
                    Email: support@growlytic.app
                  </Text>
                  <Text color={textColor} fontWeight="600">
                    Website: https://growlytic.app
                  </Text>
                </Box>
              </Section>
            </VStack>
          </Box>
        </VStack>
      </Container>
    </Box>
  )
}

export default PrivacyPolicy
