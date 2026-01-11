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
  Button,
  HStack,
  Badge,
} from '@chakra-ui/react'
import { MdCheckCircle, MdSettings, MdInfo } from 'react-icons/md'
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

const CookiePolicy = () => {
  const bgColor = useColorModeValue('gray.50', 'gray.900')
  const contentBg = useColorModeValue('white', 'gray.800')
  const textColor = useColorModeValue('gray.700', 'gray.300')
  const highlightBg = useColorModeValue('blue.50', 'gray.700')
  const tableBg = useColorModeValue('gray.50', 'gray.700')
  const tableHeaderBg = useColorModeValue('blue.100', 'gray.600')

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
              Cookie Policy
            </Heading>
            <Text fontSize="md" color={useColorModeValue('gray.600', 'gray.400')}>
              Last updated: January 11, 2026
            </Text>
          </VStack>

          {/* Important Notice */}
          <Alert status="info" borderRadius="lg">
            <AlertIcon />
            <Text fontSize="sm">
              This Cookie Policy explains how Growlytic uses cookies and similar technologies when you visit our website.
            </Text>
          </Alert>

          {/* Content */}
          <Box bg={contentBg} p={8} rounded="lg" shadow="lg">
            <VStack spacing={8} align="stretch">
              <Section title="1. What Are Cookies?">
                <Text color={textColor} lineHeight="tall">
                  Cookies are small text files that are placed on your computer or mobile device when you visit a website. 
                  They are widely used to make websites work more efficiently, as well as to provide information to the 
                  owners of the site. Cookies enable websites to recognize your device and remember information about your 
                  visit, such as your preferred language and other settings.
                </Text>
                <Box bg={highlightBg} p={4} rounded="md" mt={3}>
                  <HStack>
                    <MdInfo color="#3182ce" />
                    <Text color={textColor} fontSize="sm">
                      Cookies are essential for providing you with a seamless browsing experience and enabling certain 
                      features of our website to function properly.
                    </Text>
                  </HStack>
                </Box>
              </Section>

              <Divider />

              <Section title="2. Types of Cookies We Use">
                <Text color={textColor} lineHeight="tall" mb={4}>
                  We use different types of cookies on our website. Below is a detailed breakdown:
                </Text>
                
                <TableContainer>
                  <Table variant="simple" size="sm">
                    <Thead bg={tableHeaderBg}>
                      <Tr>
                        <Th>Cookie Type</Th>
                        <Th>Purpose</Th>
                        <Th>Duration</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      <Tr>
                        <Td fontWeight="semibold">Essential Cookies</Td>
                        <Td>Required for basic website functionality, security, and navigation</Td>
                        <Td>Session / 1 year</Td>
                      </Tr>
                      <Tr bg={tableBg}>
                        <Td fontWeight="semibold">Analytics Cookies</Td>
                        <Td>Help us understand how visitors interact with our website (Google Analytics)</Td>
                        <Td>Up to 2 years</Td>
                      </Tr>
                      <Tr>
                        <Td fontWeight="semibold">Advertising Cookies</Td>
                        <Td>Used to deliver relevant advertisements (Google AdSense, Ezoic)</Td>
                        <Td>Up to 2 years</Td>
                      </Tr>
                      <Tr bg={tableBg}>
                        <Td fontWeight="semibold">Preference Cookies</Td>
                        <Td>Remember your preferences like language and display settings</Td>
                        <Td>1 year</Td>
                      </Tr>
                    </Tbody>
                  </Table>
                </TableContainer>
              </Section>

              <Divider />

              <Section title="3. Essential Cookies">
                <Text color={textColor} lineHeight="tall">
                  Essential cookies are necessary for the website to function properly. These cookies:
                </Text>
                <List spacing={2} mt={3}>
                  <ListItem color={textColor}>
                    <ListIcon as={MdCheckCircle} color="green.500" />
                    Enable core functionality such as page navigation and access to secure areas
                  </ListItem>
                  <ListItem color={textColor}>
                    <ListIcon as={MdCheckCircle} color="green.500" />
                    Remember your login status (if applicable)
                  </ListItem>
                  <ListItem color={textColor}>
                    <ListIcon as={MdCheckCircle} color="green.500" />
                    Ensure the security and integrity of the website
                  </ListItem>
                  <ListItem color={textColor}>
                    <ListIcon as={MdCheckCircle} color="green.500" />
                    Cannot be disabled as they are required for basic functionality
                  </ListItem>
                </List>
              </Section>

              <Divider />

              <Section title="4. Analytics Cookies">
                <Text color={textColor} lineHeight="tall">
                  We use analytics cookies to understand how visitors interact with our website. This helps us improve 
                  our content and user experience. We use the following analytics services:
                </Text>
                <Box bg={highlightBg} p={4} rounded="md" mt={4}>
                  <Text fontWeight="bold" color={textColor} mb={2}>Google Analytics</Text>
                  <Text color={textColor} fontSize="sm">
                    Google Analytics uses cookies to collect information about website traffic and user behavior. 
                    This data is anonymized and used in aggregate form. You can learn more about Google's practices at{' '}
                    <Link color="blue.500" href="https://policies.google.com/privacy" isExternal>
                      Google Privacy Policy
                    </Link>.
                  </Text>
                </Box>
                <Text color={textColor} lineHeight="tall" mt={4}>
                  Information collected includes:
                </Text>
                <List spacing={2} mt={3}>
                  <ListItem color={textColor}>
                    <ListIcon as={MdCheckCircle} color="blue.500" />
                    Pages visited and time spent on each page
                  </ListItem>
                  <ListItem color={textColor}>
                    <ListIcon as={MdCheckCircle} color="blue.500" />
                    How you arrived at our website (referral source)
                  </ListItem>
                  <ListItem color={textColor}>
                    <ListIcon as={MdCheckCircle} color="blue.500" />
                    Your general geographic location (country/city level)
                  </ListItem>
                  <ListItem color={textColor}>
                    <ListIcon as={MdCheckCircle} color="blue.500" />
                    Device and browser information
                  </ListItem>
                </List>
              </Section>

              <Divider />

              <Section title="5. Advertising Cookies">
                <Text color={textColor} lineHeight="tall">
                  We display advertisements on our website to support our free services. Advertising cookies are used to:
                </Text>
                <List spacing={2} mt={3}>
                  <ListItem color={textColor}>
                    <ListIcon as={MdCheckCircle} color="purple.500" />
                    Deliver advertisements relevant to your interests
                  </ListItem>
                  <ListItem color={textColor}>
                    <ListIcon as={MdCheckCircle} color="purple.500" />
                    Limit the number of times you see an advertisement
                  </ListItem>
                  <ListItem color={textColor}>
                    <ListIcon as={MdCheckCircle} color="purple.500" />
                    Measure the effectiveness of advertising campaigns
                  </ListItem>
                </List>
                
                <Box bg={highlightBg} p={4} rounded="md" mt={4}>
                  <Text fontWeight="bold" color={textColor} mb={2}>Google AdSense</Text>
                  <Text color={textColor} fontSize="sm" mb={3}>
                    Google AdSense uses cookies to serve ads based on your prior visits to our website or other websites. 
                    Google's use of advertising cookies enables it and its partners to serve ads based on your visit to 
                    our site and/or other sites on the Internet.
                  </Text>
                  <Text color={textColor} fontSize="sm">
                    You can opt out of personalized advertising by visiting{' '}
                    <Link color="blue.500" href="https://www.google.com/settings/ads" isExternal>
                      Google Ads Settings
                    </Link>{' '}
                    or{' '}
                    <Link color="blue.500" href="https://www.aboutads.info/choices/" isExternal>
                      www.aboutads.info
                    </Link>.
                  </Text>
                </Box>

                <Box bg={highlightBg} p={4} rounded="md" mt={4}>
                  <Text fontWeight="bold" color={textColor} mb={2}>Ezoic</Text>
                  <Text color={textColor} fontSize="sm">
                    We may also use Ezoic for ad personalization and analytics. For more information, visit{' '}
                    <Link color="blue.500" href="https://www.ezoic.com/privacy-policy/" isExternal>
                      Ezoic Privacy Policy
                    </Link>.
                  </Text>
                </Box>
              </Section>

              <Divider />

              <Section title="6. Third-Party Cookies">
                <Text color={textColor} lineHeight="tall">
                  Some cookies are placed by third-party services that appear on our pages. We do not control these 
                  cookies and they are governed by the third parties' privacy policies:
                </Text>
                <TableContainer mt={4}>
                  <Table variant="simple" size="sm">
                    <Thead bg={tableHeaderBg}>
                      <Tr>
                        <Th>Third Party</Th>
                        <Th>Purpose</Th>
                        <Th>Privacy Policy</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      <Tr>
                        <Td>Google</Td>
                        <Td>Analytics & Advertising</Td>
                        <Td>
                          <Link color="blue.500" href="https://policies.google.com/privacy" isExternal>View</Link>
                        </Td>
                      </Tr>
                      <Tr bg={tableBg}>
                        <Td>Ezoic</Td>
                        <Td>Advertising & Optimization</Td>
                        <Td>
                          <Link color="blue.500" href="https://www.ezoic.com/privacy-policy/" isExternal>View</Link>
                        </Td>
                      </Tr>
                      <Tr>
                        <Td>Supabase</Td>
                        <Td>Authentication</Td>
                        <Td>
                          <Link color="blue.500" href="https://supabase.com/privacy" isExternal>View</Link>
                        </Td>
                      </Tr>
                    </Tbody>
                  </Table>
                </TableContainer>
              </Section>

              <Divider />

              <Section title="7. Managing Cookies">
                <Text color={textColor} lineHeight="tall">
                  You have the right to decide whether to accept or reject cookies. You can manage your cookie 
                  preferences in several ways:
                </Text>
                
                <VStack align="stretch" spacing={4} mt={4}>
                  <Box bg={highlightBg} p={4} rounded="md">
                    <Text fontWeight="bold" color={textColor} mb={2}>
                      <MdSettings style={{ display: 'inline', marginRight: '8px' }} />
                      Browser Settings
                    </Text>
                    <Text color={textColor} fontSize="sm">
                      Most web browsers allow you to control cookies through their settings preferences. You can set 
                      your browser to refuse cookies or to alert you when cookies are being sent. Note that disabling 
                      cookies may affect the functionality of our website.
                    </Text>
                  </Box>

                  <Box bg={highlightBg} p={4} rounded="md">
                    <Text fontWeight="bold" color={textColor} mb={2}>Browser-Specific Instructions:</Text>
                    <List spacing={1}>
                      <ListItem color={textColor} fontSize="sm">
                        <Link color="blue.500" href="https://support.google.com/chrome/answer/95647" isExternal>
                          Google Chrome
                        </Link>
                      </ListItem>
                      <ListItem color={textColor} fontSize="sm">
                        <Link color="blue.500" href="https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer" isExternal>
                          Mozilla Firefox
                        </Link>
                      </ListItem>
                      <ListItem color={textColor} fontSize="sm">
                        <Link color="blue.500" href="https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac" isExternal>
                          Safari
                        </Link>
                      </ListItem>
                      <ListItem color={textColor} fontSize="sm">
                        <Link color="blue.500" href="https://support.microsoft.com/en-us/windows/delete-and-manage-cookies-168dab11-0753-043d-7c16-ede5947fc64d" isExternal>
                          Microsoft Edge
                        </Link>
                      </ListItem>
                    </List>
                  </Box>

                  <Box bg={highlightBg} p={4} rounded="md">
                    <Text fontWeight="bold" color={textColor} mb={2}>Opt-Out Links:</Text>
                    <List spacing={1}>
                      <ListItem color={textColor} fontSize="sm">
                        Google Analytics: <Link color="blue.500" href="https://tools.google.com/dlpage/gaoptout" isExternal>
                          Browser Add-on
                        </Link>
                      </ListItem>
                      <ListItem color={textColor} fontSize="sm">
                        Google Ads: <Link color="blue.500" href="https://adssettings.google.com/" isExternal>
                          Ad Settings
                        </Link>
                      </ListItem>
                      <ListItem color={textColor} fontSize="sm">
                        Network Advertising Initiative: <Link color="blue.500" href="https://optout.networkadvertising.org/" isExternal>
                          Opt-Out Page
                        </Link>
                      </ListItem>
                      <ListItem color={textColor} fontSize="sm">
                        Digital Advertising Alliance: <Link color="blue.500" href="https://optout.aboutads.info/" isExternal>
                          Opt-Out Page
                        </Link>
                      </ListItem>
                    </List>
                  </Box>
                </VStack>
              </Section>

              <Divider />

              <Section title="8. Do Not Track Signals">
                <Text color={textColor} lineHeight="tall">
                  Some browsers include a "Do Not Track" (DNT) feature that signals to websites that you do not want 
                  to have your online activity tracked. Because there is no uniform standard for DNT signals, our 
                  website does not currently respond to DNT signals. However, you can use the opt-out mechanisms 
                  described above to limit tracking.
                </Text>
              </Section>

              <Divider />

              <Section title="9. GDPR and Your Rights (EU Users)">
                <Text color={textColor} lineHeight="tall">
                  If you are located in the European Economic Area (EEA), you have certain rights under the General 
                  Data Protection Regulation (GDPR):
                </Text>
                <List spacing={2} mt={3}>
                  <ListItem color={textColor}>
                    <ListIcon as={MdCheckCircle} color="green.500" />
                    <strong>Right to Access:</strong> You can request access to your personal data
                  </ListItem>
                  <ListItem color={textColor}>
                    <ListIcon as={MdCheckCircle} color="green.500" />
                    <strong>Right to Rectification:</strong> You can request correction of inaccurate data
                  </ListItem>
                  <ListItem color={textColor}>
                    <ListIcon as={MdCheckCircle} color="green.500" />
                    <strong>Right to Erasure:</strong> You can request deletion of your data
                  </ListItem>
                  <ListItem color={textColor}>
                    <ListIcon as={MdCheckCircle} color="green.500" />
                    <strong>Right to Withdraw Consent:</strong> You can withdraw consent at any time
                  </ListItem>
                </List>
              </Section>

              <Divider />

              <Section title="10. CCPA Rights (California Users)">
                <Text color={textColor} lineHeight="tall">
                  If you are a California resident, the California Consumer Privacy Act (CCPA) provides you with 
                  specific rights regarding your personal information:
                </Text>
                <List spacing={2} mt={3}>
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
                    Right to opt out of the sale of personal information
                  </ListItem>
                  <ListItem color={textColor}>
                    <ListIcon as={MdCheckCircle} color="orange.500" />
                    Right to non-discrimination for exercising your rights
                  </ListItem>
                </List>
              </Section>

              <Divider />

              <Section title="11. Updates to This Policy">
                <Text color={textColor} lineHeight="tall">
                  We may update this Cookie Policy from time to time to reflect changes in our practices or for other 
                  operational, legal, or regulatory reasons. We will notify you of any material changes by posting the 
                  new Cookie Policy on this page and updating the "Last updated" date.
                </Text>
                <Text color={textColor} lineHeight="tall" mt={3}>
                  We encourage you to periodically review this page for the latest information on our cookie practices.
                </Text>
              </Section>

              <Divider />

              <Section title="12. Contact Us">
                <Text color={textColor} lineHeight="tall">
                  If you have any questions about our use of cookies or this Cookie Policy, please contact us:
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
                  <Link as={RouterLink} to="/privacy">
                    <Badge colorScheme="blue" p={2} borderRadius="md">Privacy Policy</Badge>
                  </Link>
                  <Link as={RouterLink} to="/terms">
                    <Badge colorScheme="purple" p={2} borderRadius="md">Terms of Service</Badge>
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

export default CookiePolicy
