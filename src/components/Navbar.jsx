import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Box, 
  Flex, 
  Button, 
  Link as ChakraLink, 
  useColorModeValue, 
  IconButton, 
  Collapse, 
  VStack,
  HStack,
  Text,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  useDisclosure,
  useToast,
} from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'
import { HamburgerIcon, CloseIcon, ChevronDownIcon } from '@chakra-ui/icons'
import { FaPlus, FaList, FaBookOpen, FaEdit, FaMoneyBillWave, FaBook, FaCog, FaInfoCircle, FaEnvelope, FaShieldAlt, FaComments, FaSignOutAlt, FaSignInAlt } from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, isAdmin, signOut } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()

  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  const handleSignOut = async () => {
    const { error } = await signOut()
    if (!error) {
      toast({
        title: 'Signed out',
        description: 'You have been signed out successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
      navigate('/')
    }
  }

  return (
    <Box bg={bgColor} px={4} borderBottom="1px" borderColor={borderColor}>
      <Flex h={16} alignItems="center" justifyContent="space-between" maxW="1200px" mx="auto">
        <ChakraLink 
          as={RouterLink} 
          to="/" 
          fontSize="2xl"
          fontWeight="800" 
          letterSpacing="tight"
          _hover={{ 
            textDecoration: 'none',
            color: 'blue.500',
            transform: 'scale(1.05)',
          }}
          _focus={{
            boxShadow: 'none',
            outline: 'none',
          }}
          _active={{
            boxShadow: 'none',
          }}
          transition="all 0.3s ease"
          cursor="pointer"
        >
          growlytic
        </ChakraLink>

        {/* Desktop Navigation */}
        <Flex alignItems="center" gap={8} display={{ base: 'none', md: 'flex' }}>
          <ChakraLink
            as={RouterLink}
            to="/free-courses"
            fontSize="xl"
            fontWeight="600"
            position="relative"
            _hover={{ 
              color: 'blue.500',
              textDecoration: 'none',
              _after: {
                width: '100%',
              }
            }}
            _after={{
              content: '""',
              position: 'absolute',
              bottom: '-4px',
              left: 0,
              width: 0,
              height: '2px',
              bg: 'blue.500',
              transition: 'width 0.2s ease',
            }}
            transition="all 0.2s ease"
          >
            Recommended Courses
          </ChakraLink>

          <ChakraLink 
            as={RouterLink} 
            to="/blogs"
            fontSize="xl"
            fontWeight="600"
            position="relative"
            _hover={{ 
              color: 'pink.500',
              textDecoration: 'none',
              _after: {
                width: '100%',
              }
            }}
            _after={{
              content: '""',
              position: 'absolute',
              bottom: '-4px',
              left: 0,
              width: 0,
              height: '2px',
              bg: 'pink.500',
              transition: 'width 0.2s ease',
            }}
            transition="all 0.2s ease"
          >
            Articles
          </ChakraLink>

          {/* Admin Dropdown Menu - Only show when logged in */}
          {isAdmin && user ? (
            <Menu>
              <MenuButton
                as={Button}
                rightIcon={<ChevronDownIcon />}
                variant="ghost"
                colorScheme="purple"
                _hover={{
                  bg: 'purple.50',
                  transform: 'translateY(-2px)',
                }}
                _active={{
                  transform: 'translateY(0px)',
                }}
                transition="all 0.3s ease"
              >
                <HStack spacing={1}>
                  <FaCog />
                  <Text>Admin</Text>
                </HStack>
              </MenuButton>
              <MenuList>
                <MenuItem as={RouterLink} to="/admin/blog-management" icon={<FaEdit />}>
                  Blog Management
                </MenuItem>
                <MenuItem as={RouterLink} to="/admin/free-courses" icon={<FaBookOpen />}>
                  Courses Dashboard
                </MenuItem>
                <MenuItem as={RouterLink} to="/admin/free-books" icon={<FaBook />}>
                  Books Dashboard
                </MenuItem>
                <MenuItem as={RouterLink} to="/admin/opportunities" icon={<FaMoneyBillWave />}>
                  Opportunities
                </MenuItem>
                <MenuDivider />
                <MenuItem as={RouterLink} to="/admin/contact-messages" icon={<FaComments />}>
                  Contact Messages
                </MenuItem>
                <MenuDivider />
                <MenuItem icon={<FaSignOutAlt />} onClick={handleSignOut} color="red.500">
                  Sign Out
                </MenuItem>
              </MenuList>
            </Menu>
          ) : null}
        </Flex>

        {/* Mobile Menu Button */}
        <IconButton
          display={{ base: 'flex', md: 'none' }}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          icon={isMenuOpen ? <CloseIcon /> : <HamburgerIcon />}
          aria-label={'Open Menu'}
          variant={'ghost'}
          size={'md'}
          _hover={{
            bg: 'gray.100',
            transform: 'rotate(180deg) scale(1.1)',
            color: 'blue.500'
          }}
          transition="all 0.3s ease"
        />
      </Flex>

      {/* Mobile Navigation (collapsed) */}
      <Collapse in={isMenuOpen} animateOpacity>
        <Box
          pb={4}
          display={{ base: 'flex', md: 'none' }}
          flexDirection="column"
          alignItems="center"
          gap={3}
          bg={bgColor}
        >
           <ChakraLink 
             as={RouterLink} 
             to="/free-courses" 
             onClick={() => setIsMenuOpen(false)}
             fontWeight="600"
             fontSize="lg"
             width="full"
             textAlign="center"
             py={3}
             _hover={{ color: 'blue.500', bg: 'gray.50' }}
           >
            Recommended Courses
          </ChakraLink>
          <ChakraLink 
             as={RouterLink} 
             to="/blogs" 
             onClick={() => setIsMenuOpen(false)}
             fontWeight="600"
             fontSize="lg"
             width="full"
             textAlign="center"
             py={3}
             _hover={{ color: 'pink.500', bg: 'gray.50' }}
           >
             Articles
           </ChakraLink>

           <ChakraLink 
             as={RouterLink} 
             to="/about" 
             onClick={() => setIsMenuOpen(false)}
             fontWeight="500"
             fontSize="md"
             width="full"
             textAlign="center"
             py={2}
             color="gray.600"
             _hover={{ color: 'blue.500', bg: 'gray.50' }}
           >
             About Us
           </ChakraLink>
           <ChakraLink 
             as={RouterLink} 
             to="/contact" 
             onClick={() => setIsMenuOpen(false)}
             fontWeight="500"
             fontSize="md"
             width="full"
             textAlign="center"
             py={2}
             color="gray.600"
             _hover={{ color: 'blue.500', bg: 'gray.50' }}
           >
             Contact
           </ChakraLink>
           <ChakraLink 
             as={RouterLink} 
             to="/privacy" 
             onClick={() => setIsMenuOpen(false)}
             fontWeight="500"
             fontSize="md"
             width="full"
             textAlign="center"
             py={2}
             color="gray.600"
             _hover={{ color: 'blue.500', bg: 'gray.50' }}
           >
             Privacy Policy
           </ChakraLink>

          {/* Admin Menu for Mobile - Only show when logged in */}
          {isAdmin && user ? (
            <VStack spacing={2} width="100%" mt={4}>
              <Text fontWeight="bold" fontSize="sm" color="purple.500" alignSelf="start" pl={3}>
                Admin Dashboard
              </Text>
              <ChakraLink 
                as={RouterLink} 
                to="/admin/blog-management" 
                onClick={() => setIsMenuOpen(false)}
                _hover={{
                  color: 'purple.500',
                  transform: 'translateX(8px)',
                  bg: 'purple.50',
                  px: 3,
                  py: 1,
                  borderRadius: 'md'
              }}
              transition="all 0.3s ease"
              py={2}
              pl={6}
            >
              Blog Management
            </ChakraLink>
            <ChakraLink 
              as={RouterLink} 
              to="/admin/free-courses" 
              onClick={() => setIsMenuOpen(false)}
              _hover={{
                color: 'purple.500',
                transform: 'translateX(8px)',
                bg: 'purple.50',
                px: 3,
                py: 1,
                borderRadius: 'md'
              }}
              transition="all 0.3s ease"
              py={2}
              pl={6}
            >
              Courses Dashboard
            </ChakraLink>
            <ChakraLink 
              as={RouterLink} 
              to="/admin/free-books" 
              onClick={() => setIsMenuOpen(false)}
              _hover={{
                color: 'purple.500',
                transform: 'translateX(8px)',
                bg: 'purple.50',
                px: 3,
                py: 1,
                borderRadius: 'md'
              }}
              transition="all 0.3s ease"
              py={2}
              pl={6}
            >
              Books Dashboard
            </ChakraLink>
            <ChakraLink 
              as={RouterLink} 
              to="/admin/opportunities" 
              onClick={() => setIsMenuOpen(false)}
              _hover={{
                color: 'purple.500',
                transform: 'translateX(8px)',
                bg: 'purple.50',
                px: 3,
                py: 1,
                borderRadius: 'md'
              }}
              transition="all 0.3s ease"
              py={2}
              pl={6}
            >
              Opportunities
            </ChakraLink>
            <ChakraLink 
              as={RouterLink} 
              to="/admin/contact-messages" 
              onClick={() => setIsMenuOpen(false)}
              _hover={{
                color: 'purple.500',
                transform: 'translateX(8px)',
                bg: 'purple.50',
                px: 3,
                py: 1,
                borderRadius: 'md'
              }}
              transition="all 0.3s ease"
              py={2}
              pl={6}
            >
              Contact Messages
            </ChakraLink>
              <Button
                colorScheme="red"
                variant="ghost"
                size="sm"
                leftIcon={<FaSignOutAlt />}
                onClick={() => {
                  handleSignOut()
                  setIsMenuOpen(false)
                }}
                mt={2}
              >
                Sign Out
              </Button>
            </VStack>
          ) : null}
        </Box>
      </Collapse>
    </Box>
  )
}

export default Navbar