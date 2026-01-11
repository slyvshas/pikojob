import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  Flex,
  Text,
  Link,
  HStack,
  useColorModeValue,
  Icon,
  CloseButton,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { FaCookieBite } from 'react-icons/fa';

const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false);

  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.700', 'gray.300');

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      // Delay showing banner slightly for better UX
      setTimeout(() => setShowBanner(true), 1000);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setShowBanner(false);
    // Initialize analytics or other tracking here if needed
  };

  const handleDecline = () => {
    localStorage.setItem('cookieConsent', 'declined');
    setShowBanner(false);
    // Disable analytics or tracking here
  };

  if (!showBanner) return null;

  return (
    <Box
      position="fixed"
      bottom={0}
      left={0}
      right={0}
      bg={bg}
      borderTop="2px solid"
      borderColor={borderColor}
      boxShadow="0 -4px 20px rgba(0,0,0,0.1)"
      zIndex={9999}
      py={{ base: 4, md: 5 }}
    >
      <Container maxW="container.xl">
        <Flex
          direction={{ base: 'column', md: 'row' }}
          align={{ base: 'stretch', md: 'center' }}
          justify="space-between"
          gap={{ base: 4, md: 6 }}
        >
          {/* Cookie Icon & Text */}
          <Flex align="start" gap={3} flex="1">
            <Icon
              as={FaCookieBite}
              boxSize={{ base: 6, md: 7 }}
              color="blue.500"
              mt={1}
              flexShrink={0}
            />
            <Box>
              <Text
                fontSize={{ base: 'sm', md: 'md' }}
                color={textColor}
                lineHeight="tall"
              >
                We use cookies to enhance your browsing experience, analyze site traffic, and personalize content. By clicking "Accept", you consent to our use of cookies.{' '}
                <Link
                  as={RouterLink}
                  to="/cookies"
                  color="blue.500"
                  fontWeight="600"
                  _hover={{ textDecoration: 'underline' }}
                >
                  Learn more
                </Link>
              </Text>
            </Box>
          </Flex>

          {/* Action Buttons */}
          <HStack
            spacing={3}
            flexShrink={0}
            align="stretch"
            w={{ base: 'full', md: 'auto' }}
          >
            <Button
              variant="outline"
              colorScheme="gray"
              size={{ base: 'md', md: 'md' }}
              onClick={handleDecline}
              flex={{ base: 1, md: 'none' }}
              minW={{ md: '100px' }}
            >
              Decline
            </Button>
            <Button
              colorScheme="blue"
              size={{ base: 'md', md: 'md' }}
              onClick={handleAccept}
              flex={{ base: 1, md: 'none' }}
              minW={{ md: '120px' }}
            >
              Accept All
            </Button>
          </HStack>
        </Flex>
      </Container>
    </Box>
  );
};

export default CookieConsent;
