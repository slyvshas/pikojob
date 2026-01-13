import {
  Box,
  Container,
  Flex,
  Text,
  Link,
  Stack,
  Icon,
  SimpleGrid,
  useColorModeValue,
  Button,
  VStack,
  HStack,
  IconButton,
  Divider,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import {
  FaInstagram,
  FaFacebookF,
  FaLinkedinIn,
  FaYoutube,
  FaTelegram,
  FaArrowRight,
  FaHeart
} from 'react-icons/fa';
import { FaThreads } from 'react-icons/fa6';

const SocialButton = ({ children, label, href }) => {
  return (
    <IconButton
      bg={useColorModeValue('white', 'whiteAlpha.100')}
      color={useColorModeValue('gray.700', 'whiteAlpha.800')}
      as="a"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      icon={children}
      rounded={'full'}
      w={10}
      h={10}
      cursor={'pointer'}
      transition={'all 0.3s ease'}
      _hover={{
        bg: useColorModeValue('blue.600', 'blue.400'),
        color: 'white',
        transform: 'translateY(-2px)',
        boxShadow: 'lg',
      }}
      boxShadow="sm"
    />
  );
};

const ListHeader = ({ children }) => {
  return (
    <Text fontWeight={'700'} fontSize={'xl'} mb={4} color={useColorModeValue('gray.700', 'gray.200')} letterSpacing="wide" textTransform="uppercase">
      {children}
    </Text>
  );
};

const FooterLink = ({ href, children }) => {
  const hoverColor = useColorModeValue('blue.700', 'blue.300');
  const textColor = useColorModeValue('gray.700', 'gray.300');
  
  return (
    <Link 
      as={RouterLink} 
      to={href} 
      color={textColor}
      fontSize="lg"
      fontWeight="500"
      _hover={{ 
        textDecoration: 'none', 
        color: hoverColor,
        pl: 2 
      }}
      transition="all 0.2s"
      display="inline-block"
      py={1}
    >
      {children}
    </Link>
  );
};

const Footer = () => {
  const bg = useColorModeValue('gray.50', 'gray.900');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.700', 'gray.300');

  const currentYear = new Date().getFullYear();

  return (
    <Box
      bg={bg}
      color={useColorModeValue('gray.700', 'gray.200')}
      position="relative"
      mt="auto"
      borderTopWidth={1}
      borderTopColor={borderColor}
    >
      <Container as={Stack} maxW={'container.xl'} py={16}>
        <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={8}>
          
          {/* Brand Column */}
          <Stack spacing={6}>
            <Box>
              <Text
                fontSize="2xl"
                fontWeight="900"
                letterSpacing="tighter"
                display="flex"
                alignItems="center"
              >
                <Text as="span" color="black">grow</Text>
                <Text as="span" color="black">l</Text>
                <Text as="span" color="black">ytic</Text>
              </Text>
              <Text fontSize={'lg'} color={textColor} mt={3} lineHeight="tall">
                Your premier destination for free educational resources, career opportunities, and professional growth.
              </Text>
            </Box>
            
            <HStack spacing={4}>
              <SocialButton label={'Threads'} href={'https://threads.net/@growlytic.app'}>
                <FaThreads />
              </SocialButton>
              <SocialButton label={'Instagram'} href={'https://instagram.com/growlytic.app'}>
                <FaInstagram />
              </SocialButton>
              <SocialButton label={'LinkedIn'} href={'https://linkedin.com/company/growlytic'}>
                <FaLinkedinIn />
              </SocialButton>
            </HStack>
          </Stack>

          {/* Product/Explore Column */}
          <Stack align={'flex-start'}>
            <ListHeader>Explore</ListHeader>
            <FooterLink href={'/free-courses'}>Free Courses</FooterLink>
            <FooterLink href={'/blogs'}>Articles</FooterLink>
          </Stack>

          {/* Company Column */}
          <Stack align={'flex-start'}>
            <ListHeader>Company</ListHeader>
            <FooterLink href={'/about'}>About Us</FooterLink>
            <FooterLink href={'/contact'}>Contact Support</FooterLink>
            <FooterLink href={'/privacy'}>Privacy Policy</FooterLink>
            <FooterLink href={'/terms'}>Terms of Service</FooterLink>
            <FooterLink href={'/cookies'}>Cookie Policy</FooterLink>
          </Stack>

          {/* Newsletter / CTA Column */}
          <Stack align={'flex-start'}>
            <ListHeader>Stay Updated</ListHeader>
            <Text fontSize={'sm'} color={textColor} mb={2}>
              Join our community and never miss an opportunity.
            </Text>
             <Button
                as="a"
                href="https://linkedin.com/company/growlytic"
                target="_blank"
                w="full"
                bg="blue.600"
                color="white"
                rightIcon={<FaLinkedinIn />}
                size="md"
                shadow="md"
                _hover={{ bg: 'blue.700', transform: 'translateY(-2px)', shadow: 'lg' }}
                aria-label="Follow Growlytic on LinkedIn"
              >
                Follow on LinkedIn
              </Button>
               <Button
                as={RouterLink}
                to="/contact"
                w="full"
                variant="outline"
                borderColor="blue.600"
                borderWidth="2px"
                color="blue.700"
                size="md"
                _hover={{ bg: useColorModeValue('blue.50', 'whiteAlpha.100'), borderColor: 'blue.700' }}
                aria-label="Contact Growlytic support"
              >
                Contact Us
              </Button>
          </Stack>
        </SimpleGrid>
      </Container>

      <Box borderTopWidth={1} borderStyle={'solid'} borderColor={borderColor}>
        <Container
          as={Stack}
          maxW={'container.xl'}
          py={6}
          direction={{ base: 'column', md: 'row' }}
          spacing={4}
          justify={{ base: 'center', md: 'space-between' }}
          align={{ base: 'center', md: 'center' }}
        >
          <Text fontSize={'sm'} color={textColor}>
            © {currentYear} Growlytic. All rights reserved.
          </Text>
          <Stack direction={'row'} spacing={6} align="center">
            <Text fontSize={'sm'} color={textColor} display="flex" alignItems="center">
              Made with <Icon as={FaHeart} color="red.400" mx={1} w={3} h={3} /> for learners
            </Text>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
};

export default Footer;
