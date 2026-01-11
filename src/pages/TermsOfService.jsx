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
  ListIcon,
  Link,
  Alert,
  AlertIcon,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
} from '@chakra-ui/react'
import { MdCheckCircle, MdCancel } from 'react-icons/md'
import { Link as RouterLink } from 'react-router-dom'

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

const TermsOfService = () => {
  const bgColor = useColorModeValue('gray.50', 'gray.900')
  const contentBg = useColorModeValue('white', 'gray.800')
  const textColor = useColorModeValue('gray.700', 'gray.300')
  const highlightBg = useColorModeValue('blue.50', 'gray.700')
  const tableBg = useColorModeValue('gray.50', 'gray.700')

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
              Terms of Service
            </Heading>
            <Text fontSize="md" color={useColorModeValue('gray.600', 'gray.400')}>
              Last updated: January 11, 2026
            </Text>
          </VStack>

          {/* Important Notice */}
          <Alert status="info" borderRadius="lg">
            <AlertIcon />
            <Text fontSize="sm">
              Please read these Terms of Service carefully before using Growlytic. By accessing or using our website, 
              you agree to be bound by these terms.
            </Text>
          </Alert>

          {/* Content */}
          <Box bg={contentBg} p={8} rounded="lg" shadow="lg">
            <VStack spacing={8} align="stretch">
              <Section title="1. Agreement to Terms">
                <Text color={textColor} lineHeight="tall">
                  Welcome to Growlytic ("Company," "we," "our," or "us"). These Terms of Service ("Terms") govern your 
                  access to and use of the Growlytic website located at <Link color="blue.500" href="https://growlytic.app" isExternal>https://growlytic.app</Link> (the "Website"), 
                  including any content, functionality, and services offered on or through the Website.
                </Text>
                <Text color={textColor} lineHeight="tall">
                  By accessing or using the Website, you accept and agree to be bound by these Terms and our{' '}
                  <Link as={RouterLink} to="/privacy" color="blue.500">Privacy Policy</Link>, incorporated herein by reference. 
                  If you do not agree to these Terms, you must not access or use the Website.
                </Text>
              </Section>

              <Divider />

              <Section title="2. Eligibility">
                <Text color={textColor} lineHeight="tall">
                  The Website is intended for users who are at least 13 years of age. By using the Website, you represent 
                  and warrant that:
                </Text>
                <List spacing={2} mt={3}>
                  <ListItem color={textColor}>
                    <ListIcon as={MdCheckCircle} color="green.500" />
                    You are at least 13 years of age
                  </ListItem>
                  <ListItem color={textColor}>
                    <ListIcon as={MdCheckCircle} color="green.500" />
                    You have the legal capacity to enter into these Terms
                  </ListItem>
                  <ListItem color={textColor}>
                    <ListIcon as={MdCheckCircle} color="green.500" />
                    You are not prohibited from using the Website under any applicable law
                  </ListItem>
                  <ListItem color={textColor}>
                    <ListIcon as={MdCheckCircle} color="green.500" />
                    If under 18, you have obtained parental or guardian consent
                  </ListItem>
                </List>
              </Section>

              <Divider />

              <Section title="3. Description of Services">
                <Text color={textColor} lineHeight="tall">
                  Growlytic provides a free online platform that offers:
                </Text>
                <List spacing={2} mt={3}>
                  <ListItem color={textColor}>
                    <ListIcon as={MdCheckCircle} color="blue.500" />
                    <strong>Free Educational Courses:</strong> Access to curated free online courses from various providers
                  </ListItem>
                  <ListItem color={textColor}>
                    <ListIcon as={MdCheckCircle} color="blue.500" />
                    <strong>Free E-Books:</strong> Collection of free digital books and learning resources
                  </ListItem>
                  <ListItem color={textColor}>
                    <ListIcon as={MdCheckCircle} color="blue.500" />
                    <strong>Career Opportunities:</strong> Information about scholarships, internships, and job opportunities
                  </ListItem>
                  <ListItem color={textColor}>
                    <ListIcon as={MdCheckCircle} color="blue.500" />
                    <strong>Educational Blogs:</strong> Articles and guides on career development and learning
                  </ListItem>
                </List>
                <Text color={textColor} lineHeight="tall" mt={4}>
                  All services are provided free of charge. We may display advertisements to support our operations.
                </Text>
              </Section>

              <Divider />

              <Section title="4. User Conduct">
                <Text color={textColor} lineHeight="tall">
                  When using our Website, you agree NOT to:
                </Text>
                <List spacing={2} mt={3}>
                  <ListItem color={textColor}>
                    <ListIcon as={MdCancel} color="red.500" />
                    Use the Website for any unlawful purpose or in violation of any applicable laws
                  </ListItem>
                  <ListItem color={textColor}>
                    <ListIcon as={MdCancel} color="red.500" />
                    Attempt to gain unauthorized access to any part of the Website
                  </ListItem>
                  <ListItem color={textColor}>
                    <ListIcon as={MdCancel} color="red.500" />
                    Interfere with or disrupt the Website or servers/networks connected to it
                  </ListItem>
                  <ListItem color={textColor}>
                    <ListIcon as={MdCancel} color="red.500" />
                    Use any robot, spider, or automated device to access the Website
                  </ListItem>
                  <ListItem color={textColor}>
                    <ListIcon as={MdCancel} color="red.500" />
                    Transmit viruses, malware, or other harmful code
                  </ListItem>
                  <ListItem color={textColor}>
                    <ListIcon as={MdCancel} color="red.500" />
                    Engage in any conduct that restricts others' use of the Website
                  </ListItem>
                  <ListItem color={textColor}>
                    <ListIcon as={MdCancel} color="red.500" />
                    Collect personal information of other users without consent
                  </ListItem>
                  <ListItem color={textColor}>
                    <ListIcon as={MdCancel} color="red.500" />
                    Post or transmit spam, chain letters, or unsolicited communications
                  </ListItem>
                </List>
              </Section>

              <Divider />

              <Section title="5. Intellectual Property Rights">
                <Text color={textColor} lineHeight="tall">
                  The Website and its entire contents, features, and functionality (including but not limited to all 
                  information, software, text, displays, images, video, and audio, and the design, selection, and 
                  arrangement thereof) are owned by Growlytic, its licensors, or other providers of such material and 
                  are protected by copyright, trademark, patent, trade secret, and other intellectual property laws.
                </Text>
                <Text color={textColor} lineHeight="tall" mt={3}>
                  You may access and use the Website for your personal, non-commercial use only. You must not:
                </Text>
                <List spacing={2} mt={3}>
                  <ListItem color={textColor}>
                    <ListIcon as={MdCancel} color="red.500" />
                    Reproduce, distribute, modify, or create derivative works of any content
                  </ListItem>
                  <ListItem color={textColor}>
                    <ListIcon as={MdCancel} color="red.500" />
                    Remove any copyright or proprietary notices from materials
                  </ListItem>
                  <ListItem color={textColor}>
                    <ListIcon as={MdCancel} color="red.500" />
                    Use any content for commercial purposes without written permission
                  </ListItem>
                </List>
              </Section>

              <Divider />

              <Section title="6. Third-Party Links and Content">
                <Text color={textColor} lineHeight="tall">
                  The Website may contain links to third-party websites, resources, courses, and books that are not 
                  owned or controlled by Growlytic. We have no control over, and assume no responsibility for:
                </Text>
                <List spacing={2} mt={3}>
                  <ListItem color={textColor}>
                    <ListIcon as={MdCheckCircle} color="orange.500" />
                    The content, privacy policies, or practices of third-party websites
                  </ListItem>
                  <ListItem color={textColor}>
                    <ListIcon as={MdCheckCircle} color="orange.500" />
                    The accuracy or availability of third-party resources
                  </ListItem>
                  <ListItem color={textColor}>
                    <ListIcon as={MdCheckCircle} color="orange.500" />
                    Any products, services, or content offered by third parties
                  </ListItem>
                </List>
                <Text color={textColor} lineHeight="tall" mt={3}>
                  Your use of third-party websites and resources is at your own risk and subject to their respective 
                  terms and policies.
                </Text>
              </Section>

              <Divider />

              <Section title="7. Advertisements">
                <Text color={textColor} lineHeight="tall">
                  Growlytic displays advertisements on the Website to support our free services. These advertisements 
                  may be served by third-party advertising networks, including but not limited to Google AdSense and Ezoic.
                </Text>
                <Box bg={highlightBg} p={4} rounded="md" mt={3}>
                  <Text color={textColor} fontSize="sm">
                    <strong>Advertising Disclosure:</strong> We may earn revenue from advertisements displayed on our 
                    Website. Third-party advertisers may use cookies and similar technologies to serve ads based on 
                    your prior visits to our Website or other websites. You can opt out of personalized advertising 
                    by visiting <Link color="blue.500" href="https://www.google.com/settings/ads" isExternal>Google Ads Settings</Link>.
                  </Text>
                </Box>
              </Section>

              <Divider />

              <Section title="8. Disclaimer of Warranties">
                <Alert status="warning" borderRadius="md" mb={4}>
                  <AlertIcon />
                  <Text fontSize="sm">
                    PLEASE READ THIS SECTION CAREFULLY AS IT LIMITS OUR LIABILITY.
                  </Text>
                </Alert>
                <Text color={textColor} lineHeight="tall">
                  THE WEBSITE AND ALL CONTENT, MATERIALS, INFORMATION, AND SERVICES PROVIDED ON THE WEBSITE ARE 
                  PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED.
                </Text>
                <Text color={textColor} lineHeight="tall" mt={3}>
                  We do not warrant that:
                </Text>
                <List spacing={2} mt={3}>
                  <ListItem color={textColor}>
                    <ListIcon as={MdCancel} color="gray.500" />
                    The Website will be uninterrupted, secure, or error-free
                  </ListItem>
                  <ListItem color={textColor}>
                    <ListIcon as={MdCancel} color="gray.500" />
                    The information provided will be accurate, complete, or current
                  </ListItem>
                  <ListItem color={textColor}>
                    <ListIcon as={MdCancel} color="gray.500" />
                    External links will be functional or lead to appropriate content
                  </ListItem>
                  <ListItem color={textColor}>
                    <ListIcon as={MdCancel} color="gray.500" />
                    The Website will meet your specific requirements or expectations
                  </ListItem>
                </List>
              </Section>

              <Divider />

              <Section title="9. Limitation of Liability">
                <Text color={textColor} lineHeight="tall">
                  TO THE FULLEST EXTENT PERMITTED BY LAW, GROWLYTIC SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, 
                  SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, 
                  USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM:
                </Text>
                <List spacing={2} mt={3}>
                  <ListItem color={textColor}>
                    <ListIcon as={MdCheckCircle} color="gray.500" />
                    Your access to or use of (or inability to access or use) the Website
                  </ListItem>
                  <ListItem color={textColor}>
                    <ListIcon as={MdCheckCircle} color="gray.500" />
                    Any conduct or content of any third party on the Website
                  </ListItem>
                  <ListItem color={textColor}>
                    <ListIcon as={MdCheckCircle} color="gray.500" />
                    Any content obtained from the Website
                  </ListItem>
                  <ListItem color={textColor}>
                    <ListIcon as={MdCheckCircle} color="gray.500" />
                    Unauthorized access, use, or alteration of your transmissions or content
                  </ListItem>
                </List>
              </Section>

              <Divider />

              <Section title="10. Indemnification">
                <Text color={textColor} lineHeight="tall">
                  You agree to defend, indemnify, and hold harmless Growlytic and its officers, directors, employees, 
                  contractors, agents, licensors, and suppliers from and against any claims, liabilities, damages, 
                  judgments, awards, losses, costs, expenses, or fees (including reasonable attorneys' fees) arising 
                  out of or relating to your violation of these Terms or your use of the Website.
                </Text>
              </Section>

              <Divider />

              <Section title="11. Termination">
                <Text color={textColor} lineHeight="tall">
                  We may terminate or suspend your access to the Website immediately, without prior notice or liability, 
                  for any reason whatsoever, including without limitation if you breach these Terms. Upon termination, 
                  your right to use the Website will immediately cease.
                </Text>
              </Section>

              <Divider />

              <Section title="12. Governing Law">
                <Text color={textColor} lineHeight="tall">
                  These Terms shall be governed by and construed in accordance with applicable laws, without regard to 
                  conflict of law principles. Any legal action or proceeding arising out of these Terms shall be brought 
                  exclusively in the appropriate courts, and you consent to the jurisdiction of such courts.
                </Text>
              </Section>

              <Divider />

              <Section title="13. Changes to Terms">
                <Text color={textColor} lineHeight="tall">
                  We reserve the right to modify these Terms at any time. If we make material changes, we will notify 
                  you by updating the "Last updated" date at the top of these Terms. Your continued use of the Website 
                  after any changes constitutes your acceptance of the new Terms.
                </Text>
              </Section>

              <Divider />

              <Section title="14. Severability">
                <Text color={textColor} lineHeight="tall">
                  If any provision of these Terms is held to be invalid or unenforceable, such provision shall be struck 
                  and the remaining provisions shall be enforced to the fullest extent under law.
                </Text>
              </Section>

              <Divider />

              <Section title="15. Entire Agreement">
                <Text color={textColor} lineHeight="tall">
                  These Terms, together with our Privacy Policy and Cookie Policy, constitute the entire agreement 
                  between you and Growlytic regarding your use of the Website and supersede all prior and contemporaneous 
                  understandings, agreements, representations, and warranties.
                </Text>
              </Section>

              <Divider />

              <Section title="16. Contact Information">
                <Text color={textColor} lineHeight="tall">
                  If you have any questions about these Terms of Service, please contact us:
                </Text>
                <Box bg={highlightBg} p={4} rounded="md" mt={4}>
                  <Text color={textColor} fontWeight="600">
                    Growlytic
                  </Text>
                  <Text color={textColor}>
                    Email: <Link color="blue.500" href="mailto:contactgrowlytic@gmail.com">contactgrowlytic@gmail.com</Link>
                  </Text>
                  <Text color={textColor}>
                    Website: <Link color="blue.500" href="https://growlytic.app" isExternal>https://growlytic.app</Link>
                  </Text>
                  <Text color={textColor}>
                    Contact Form: <Link as={RouterLink} to="/contact" color="blue.500">Contact Us</Link>
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

export default TermsOfService
