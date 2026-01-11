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
  HStack,
  Badge,
} from '@chakra-ui/react'
import { MdCheckCircle, MdSecurity, MdInfo } from 'react-icons/md'
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

const PrivacyPolicy = () => {
  const bgColor = useColorModeValue('gray.50', 'gray.900')
  const contentBg = useColorModeValue('white', 'gray.800')
  const textColor = useColorModeValue('gray.700', 'gray.300')
  const highlightBg = useColorModeValue('blue.50', 'gray.700')
  const tableHeaderBg = useColorModeValue('blue.100', 'gray.600')
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
              Privacy Policy
            </Heading>
            <Text fontSize="md" color={useColorModeValue('gray.600', 'gray.400')}>
              Last updated: January 11, 2026
            </Text>
          </VStack>

          {/* Important Notice */}
          <Alert status="info" borderRadius="lg">
            <AlertIcon />
            <Text fontSize="sm">
              Your privacy is important to us. This Privacy Policy explains how Growlytic collects, uses, discloses, 
              and safeguards your information when you visit our website.
            </Text>
          </Alert>

          {/* Content */}
          <Box bg={contentBg} p={8} rounded="lg" shadow="lg">
            <VStack spacing={8} align="stretch">
              <Section title="1. Introduction">
                <Text color={textColor} lineHeight="tall">
                  Welcome to Growlytic ("Company," "we," "our," or "us"). We operate the website{' '}
                  <Link color="blue.500" href="https://growlytic.app" isExternal>https://growlytic.app</Link> (the "Website"). 
                  This Privacy Policy describes how we collect, use, maintain, and disclose information collected from 
                  users ("User," "you," or "your") of our Website.
                </Text>
                <Text color={textColor} lineHeight="tall" mt={3}>
                  We are committed to protecting your personal information and your right to privacy. If you have any 
                  questions or concerns about this policy or our practices, please contact us at{' '}
                  <Link color="blue.500" href="mailto:contactgrowlytic@gmail.com">contactgrowlytic@gmail.com</Link>.
                </Text>
              </Section>

              <Divider />

              <Section title="2. Information We Collect">
                <Text color={textColor} lineHeight="tall" fontWeight="semibold">
                  2.1 Personal Information You Provide
                </Text>
                <Text color={textColor} lineHeight="tall">
                  We collect personal information that you voluntarily provide to us when you:
                </Text>
                <List spacing={2} mt={3}>
                  <ListItem color={textColor}>
                    <ListIcon as={MdCheckCircle} color="green.500" />
                    Use our contact form to send us messages or inquiries
                  </ListItem>
                  <ListItem color={textColor}>
                    <ListIcon as={MdCheckCircle} color="green.500" />
                    Subscribe to our newsletter or updates (if applicable)
                  </ListItem>
                  <ListItem color={textColor}>
                    <ListIcon as={MdCheckCircle} color="green.500" />
                    Participate in surveys or promotions
                  </ListItem>
                </List>
                <Text color={textColor} lineHeight="tall" mt={4}>
                  Personal information may include:
                </Text>
                <TableContainer mt={3}>
                  <Table variant="simple" size="sm">
                    <Thead bg={tableHeaderBg}>
                      <Tr>
                        <Th>Data Category</Th>
                        <Th>Examples</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      <Tr>
                        <Td>Contact Information</Td>
                        <Td>Name, email address</Td>
                      </Tr>
                      <Tr bg={tableBg}>
                        <Td>Communication Data</Td>
                        <Td>Messages, feedback, inquiries sent through contact form</Td>
                      </Tr>
                    </Tbody>
                  </Table>
                </TableContainer>

                <Text color={textColor} lineHeight="tall" mt={6} fontWeight="semibold">
                  2.2 Information Automatically Collected
                </Text>
                <Text color={textColor} lineHeight="tall">
                  When you visit our Website, we automatically collect certain information about your device and usage:
                </Text>
                <List spacing={2} mt={3}>
                  <ListItem color={textColor}>
                    <ListIcon as={MdCheckCircle} color="blue.500" />
                    <strong>Device Information:</strong> Browser type, operating system, device type, screen resolution
                  </ListItem>
                  <ListItem color={textColor}>
                    <ListIcon as={MdCheckCircle} color="blue.500" />
                    <strong>Log Data:</strong> IP address, access times, pages viewed, referring URL
                  </ListItem>
                  <ListItem color={textColor}>
                    <ListIcon as={MdCheckCircle} color="blue.500" />
                    <strong>Usage Data:</strong> How you interact with our Website, time spent on pages, click patterns
                  </ListItem>
                  <ListItem color={textColor}>
                    <ListIcon as={MdCheckCircle} color="blue.500" />
                    <strong>Location Data:</strong> General geographic location based on IP address (country/city level)
                  </ListItem>
                </List>
              </Section>

              <Divider />

              <Section title="3. How We Use Your Information">
                <Text color={textColor} lineHeight="tall">
                  We use the information we collect for various purposes, including:
                </Text>
                <List spacing={2} mt={3}>
                  <ListItem color={textColor}>
                    <ListIcon as={MdCheckCircle} color="purple.500" />
                    <strong>To provide and maintain our services:</strong> Operate and maintain the Website
                  </ListItem>
                  <ListItem color={textColor}>
                    <ListIcon as={MdCheckCircle} color="purple.500" />
                    <strong>To improve our Website:</strong> Analyze usage patterns to enhance user experience
                  </ListItem>
                  <ListItem color={textColor}>
                    <ListIcon as={MdCheckCircle} color="purple.500" />
                    <strong>To communicate with you:</strong> Respond to inquiries and provide customer support
                  </ListItem>
                  <ListItem color={textColor}>
                    <ListIcon as={MdCheckCircle} color="purple.500" />
                    <strong>To display advertisements:</strong> Show relevant ads to support our free services
                  </ListItem>
                  <ListItem color={textColor}>
                    <ListIcon as={MdCheckCircle} color="purple.500" />
                    <strong>To ensure security:</strong> Monitor for security threats and protect against abuse
                  </ListItem>
                  <ListItem color={textColor}>
                    <ListIcon as={MdCheckCircle} color="purple.500" />
                    <strong>To comply with legal obligations:</strong> Meet regulatory and legal requirements
                  </ListItem>
                </List>
              </Section>

              <Divider />

              <Section title="4. Cookies and Tracking Technologies">
                <Text color={textColor} lineHeight="tall">
                  We use cookies and similar tracking technologies to collect and track information about your activity 
                  on our Website. Cookies are small data files stored on your device.
                </Text>
                <Box bg={highlightBg} p={4} rounded="md" mt={4}>
                  <Text color={textColor} fontSize="sm">
                    <strong>Types of cookies we use:</strong> Essential cookies, analytics cookies, advertising cookies, 
                    and preference cookies. For detailed information about our use of cookies, please see our{' '}
                    <Link as={RouterLink} to="/cookies" color="blue.500">Cookie Policy</Link>.
                  </Text>
                </Box>
                <Text color={textColor} lineHeight="tall" mt={4}>
                  You can control cookies through your browser settings. Note that disabling cookies may affect the 
                  functionality of certain features on our Website.
                </Text>
              </Section>

              <Divider />

              <Section title="5. Third-Party Services">
                <Text color={textColor} lineHeight="tall">
                  We use third-party services to help us operate our Website. These services may collect information 
                  about you:
                </Text>
                
                <Box bg={highlightBg} p={4} rounded="md" mt={4}>
                  <Text fontWeight="bold" color={textColor} mb={2}>Google Analytics</Text>
                  <Text color={textColor} fontSize="sm">
                    We use Google Analytics to analyze website traffic and user behavior. Google Analytics collects 
                    information such as how often users visit our site, what pages they visit, and what other sites 
                    they used prior to coming to our site. We use this information to improve our Website.
                  </Text>
                  <Text color={textColor} fontSize="sm" mt={2}>
                    Learn more:{' '}
                    <Link color="blue.500" href="https://policies.google.com/privacy" isExternal>
                      Google Privacy Policy
                    </Link>
                  </Text>
                </Box>

                <Box bg={highlightBg} p={4} rounded="md" mt={4}>
                  <Text fontWeight="bold" color={textColor} mb={2}>Google AdSense</Text>
                  <Text color={textColor} fontSize="sm">
                    We use Google AdSense to display advertisements on our Website. Google AdSense uses cookies to serve 
                    ads based on your prior visits to our Website or other websites. Google's use of advertising cookies 
                    enables it and its partners to serve ads based on your visit to our site and/or other sites on the Internet.
                  </Text>
                  <Text color={textColor} fontSize="sm" mt={2}>
                    You can opt out of personalized advertising by visiting{' '}
                    <Link color="blue.500" href="https://www.google.com/settings/ads" isExternal>
                      Google Ads Settings
                    </Link>.
                  </Text>
                </Box>

              </Section>

              <Divider />

              <Section title="6. Advertising">
                <Alert status="info" borderRadius="md" mb={4}>
                  <AlertIcon />
                  <Text fontSize="sm">
                    We display advertisements to support our free educational services.
                  </Text>
                </Alert>
                <Text color={textColor} lineHeight="tall">
                  Our Website displays third-party advertisements. These advertising networks may use cookies and 
                  similar technologies to collect information about your visits to this and other websites to provide 
                  relevant advertisements about goods and services of interest to you.
                </Text>
                <Text color={textColor} lineHeight="tall" mt={3}>
                  <strong>Information collected by advertisers may include:</strong>
                </Text>
                <List spacing={2} mt={3}>
                  <ListItem color={textColor}>
                    <ListIcon as={MdCheckCircle} color="orange.500" />
                    Browser type and settings
                  </ListItem>
                  <ListItem color={textColor}>
                    <ListIcon as={MdCheckCircle} color="orange.500" />
                    Device information
                  </ListItem>
                  <ListItem color={textColor}>
                    <ListIcon as={MdCheckCircle} color="orange.500" />
                    Geographic location
                  </ListItem>
                  <ListItem color={textColor}>
                    <ListIcon as={MdCheckCircle} color="orange.500" />
                    Pages visited and interactions
                  </ListItem>
                </List>
                <Text color={textColor} lineHeight="tall" mt={4}>
                  <strong>Opt-out options:</strong>
                </Text>
                <List spacing={2} mt={2}>
                  <ListItem color={textColor}>
                    <ListIcon as={MdCheckCircle} color="green.500" />
                    <Link color="blue.500" href="https://www.google.com/settings/ads" isExternal>Google Ad Settings</Link>
                  </ListItem>
                  <ListItem color={textColor}>
                    <ListIcon as={MdCheckCircle} color="green.500" />
                    <Link color="blue.500" href="https://optout.networkadvertising.org/" isExternal>Network Advertising Initiative Opt-Out</Link>
                  </ListItem>
                  <ListItem color={textColor}>
                    <ListIcon as={MdCheckCircle} color="green.500" />
                    <Link color="blue.500" href="https://optout.aboutads.info/" isExternal>Digital Advertising Alliance Opt-Out</Link>
                  </ListItem>
                </List>
              </Section>

              <Divider />

              <Section title="7. Data Sharing and Disclosure">
                <Text color={textColor} lineHeight="tall">
                  We do not sell your personal information. We may share your information in the following situations:
                </Text>
                <List spacing={2} mt={3}>
                  <ListItem color={textColor}>
                    <ListIcon as={MdCheckCircle} color="blue.500" />
                    <strong>With service providers:</strong> Third-party vendors who assist in operating our Website
                  </ListItem>
                  <ListItem color={textColor}>
                    <ListIcon as={MdCheckCircle} color="blue.500" />
                    <strong>For legal reasons:</strong> When required by law or to protect our rights
                  </ListItem>
                  <ListItem color={textColor}>
                    <ListIcon as={MdCheckCircle} color="blue.500" />
                    <strong>Business transfers:</strong> In connection with a merger, acquisition, or sale of assets
                  </ListItem>
                  <ListItem color={textColor}>
                    <ListIcon as={MdCheckCircle} color="blue.500" />
                    <strong>With your consent:</strong> When you have given us permission to share your information
                  </ListItem>
                </List>
              </Section>

              <Divider />

              <Section title="8. Data Security">
                <Box bg={highlightBg} p={4} rounded="md" mb={4}>
                  <HStack>
                    <MdSecurity color="#3182ce" size={24} />
                    <Text color={textColor} fontWeight="semibold">
                      We take your data security seriously
                    </Text>
                  </HStack>
                </Box>
                <Text color={textColor} lineHeight="tall">
                  We implement appropriate technical and organizational security measures to protect your personal 
                  information against unauthorized access, alteration, disclosure, or destruction. These measures include:
                </Text>
                <List spacing={2} mt={3}>
                  <ListItem color={textColor}>
                    <ListIcon as={MdCheckCircle} color="green.500" />
                    SSL/TLS encryption for data transmission
                  </ListItem>
                  <ListItem color={textColor}>
                    <ListIcon as={MdCheckCircle} color="green.500" />
                    Secure database storage
                  </ListItem>
                  <ListItem color={textColor}>
                    <ListIcon as={MdCheckCircle} color="green.500" />
                    Regular security assessments and updates
                  </ListItem>
                  <ListItem color={textColor}>
                    <ListIcon as={MdCheckCircle} color="green.500" />
                    Access controls and authentication mechanisms
                  </ListItem>
                </List>
                <Text color={textColor} lineHeight="tall" mt={3}>
                  However, no method of transmission over the Internet is 100% secure. While we strive to protect your 
                  personal information, we cannot guarantee its absolute security.
                </Text>
              </Section>

              <Divider />

              <Section title="9. Data Retention">
                <Text color={textColor} lineHeight="tall">
                  We retain your personal information only for as long as necessary to fulfill the purposes for which 
                  it was collected, including to satisfy any legal, accounting, or reporting requirements.
                </Text>
                <TableContainer mt={4}>
                  <Table variant="simple" size="sm">
                    <Thead bg={tableHeaderBg}>
                      <Tr>
                        <Th>Data Type</Th>
                        <Th>Retention Period</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      <Tr>
                        <Td>Contact form submissions</Td>
                        <Td>2 years or until resolved</Td>
                      </Tr>
                      <Tr bg={tableBg}>
                        <Td>Analytics data</Td>
                        <Td>26 months (Google Analytics default)</Td>
                      </Tr>
                      <Tr>
                        <Td>Cookies</Td>
                        <Td>Varies by type (session to 2 years)</Td>
                      </Tr>
                    </Tbody>
                  </Table>
                </TableContainer>
              </Section>

              <Divider />

              <Section title="10. Your Privacy Rights">
                <Text color={textColor} lineHeight="tall">
                  Depending on your location, you may have certain rights regarding your personal information:
                </Text>
                
                <Text color={textColor} lineHeight="tall" mt={4} fontWeight="semibold">
                  For All Users:
                </Text>
                <List spacing={2} mt={2}>
                  <ListItem color={textColor}>
                    <ListIcon as={MdCheckCircle} color="purple.500" />
                    <strong>Access:</strong> Request access to your personal data
                  </ListItem>
                  <ListItem color={textColor}>
                    <ListIcon as={MdCheckCircle} color="purple.500" />
                    <strong>Correction:</strong> Request correction of inaccurate data
                  </ListItem>
                  <ListItem color={textColor}>
                    <ListIcon as={MdCheckCircle} color="purple.500" />
                    <strong>Deletion:</strong> Request deletion of your personal data
                  </ListItem>
                  <ListItem color={textColor}>
                    <ListIcon as={MdCheckCircle} color="purple.500" />
                    <strong>Opt-out:</strong> Opt out of marketing communications
                  </ListItem>
                </List>

                <Text color={textColor} lineHeight="tall" mt={4} fontWeight="semibold">
                  For EU/EEA Users (GDPR):
                </Text>
                <List spacing={2} mt={2}>
                  <ListItem color={textColor}>
                    <ListIcon as={MdCheckCircle} color="blue.500" />
                    Right to data portability
                  </ListItem>
                  <ListItem color={textColor}>
                    <ListIcon as={MdCheckCircle} color="blue.500" />
                    Right to restrict processing
                  </ListItem>
                  <ListItem color={textColor}>
                    <ListIcon as={MdCheckCircle} color="blue.500" />
                    Right to object to processing
                  </ListItem>
                  <ListItem color={textColor}>
                    <ListIcon as={MdCheckCircle} color="blue.500" />
                    Right to withdraw consent
                  </ListItem>
                </List>

                <Text color={textColor} lineHeight="tall" mt={4} fontWeight="semibold">
                  For California Users (CCPA):
                </Text>
                <List spacing={2} mt={2}>
                  <ListItem color={textColor}>
                    <ListIcon as={MdCheckCircle} color="orange.500" />
                    Right to know what personal information is collected
                  </ListItem>
                  <ListItem color={textColor}>
                    <ListIcon as={MdCheckCircle} color="orange.500" />
                    Right to know if personal information is sold or disclosed
                  </ListItem>
                  <ListItem color={textColor}>
                    <ListIcon as={MdCheckCircle} color="orange.500" />
                    Right to say no to the sale of personal information
                  </ListItem>
                  <ListItem color={textColor}>
                    <ListIcon as={MdCheckCircle} color="orange.500" />
                    Right to equal service and price
                  </ListItem>
                </List>

                <Box bg={highlightBg} p={4} rounded="md" mt={4}>
                  <Text color={textColor} fontSize="sm">
                    To exercise any of these rights, please contact us at{' '}
                    <Link color="blue.500" href="mailto:contactgrowlytic@gmail.com">contactgrowlytic@gmail.com</Link>.
                    We will respond to your request within 30 days.
                  </Text>
                </Box>
              </Section>

              <Divider />

              <Section title="11. Children's Privacy">
                <Text color={textColor} lineHeight="tall">
                  Our Website is not intended for children under the age of 13. We do not knowingly collect personal 
                  information from children under 13. If you are a parent or guardian and believe your child has 
                  provided us with personal information, please contact us immediately at{' '}
                  <Link color="blue.500" href="mailto:contactgrowlytic@gmail.com">contactgrowlytic@gmail.com</Link>.
                </Text>
                <Text color={textColor} lineHeight="tall" mt={3}>
                  If we become aware that we have collected personal information from a child under 13 without 
                  verification of parental consent, we will take steps to remove that information from our servers.
                </Text>
              </Section>

              <Divider />

              <Section title="12. International Data Transfers">
                <Text color={textColor} lineHeight="tall">
                  Your information may be transferred to and processed in countries other than your country of residence. 
                  These countries may have data protection laws that are different from the laws of your country. 
                  By using our Website, you consent to the transfer of your information to these countries.
                </Text>
                <Text color={textColor} lineHeight="tall" mt={3}>
                  We take appropriate safeguards to ensure that your personal information remains protected in accordance 
                  with this Privacy Policy when transferred internationally.
                </Text>
              </Section>

              <Divider />

              <Section title="13. Changes to This Privacy Policy">
                <Text color={textColor} lineHeight="tall">
                  We may update this Privacy Policy from time to time. We will notify you of any changes by posting 
                  the new Privacy Policy on this page and updating the "Last updated" date at the top.
                </Text>
                <Text color={textColor} lineHeight="tall" mt={3}>
                  You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy 
                  Policy are effective when they are posted on this page.
                </Text>
              </Section>

              <Divider />

              <Section title="14. Contact Us">
                <Text color={textColor} lineHeight="tall">
                  If you have any questions about this Privacy Policy or our privacy practices, please contact us:
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

              {/* Related Policies */}
              <Box bg={highlightBg} p={6} rounded="lg" mt={4}>
                <Text fontWeight="bold" color={textColor} mb={3}>Related Policies:</Text>
                <HStack spacing={4} wrap="wrap">
                  <Link as={RouterLink} to="/terms">
                    <Badge colorScheme="purple" p={2} borderRadius="md">Terms of Service</Badge>
                  </Link>
                  <Link as={RouterLink} to="/cookies">
                    <Badge colorScheme="blue" p={2} borderRadius="md">Cookie Policy</Badge>
                  </Link>
                </HStack>
              </Box>
            </VStack>
          </Box>
        </VStack>
      </Container>
    </Box>
  )
}

export default PrivacyPolicy
