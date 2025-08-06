import { useState } from 'react'
import { 
  Box, 
  Flex, 
  Button, 
  Link as ChakraLink, 
  useColorModeValue, 
  IconButton, 
  Collapse, 
  VStack,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  useDisclosure
} from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { HamburgerIcon, CloseIcon, ChevronDownIcon } from '@chakra-ui/icons'
import { FaPlus, FaList, FaBookOpen, FaEdit, FaMoneyBillWave, FaBook, FaCog } from 'react-icons/fa'

const Navbar = () => {
  const { user, signOut, isAdmin, loading } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  return (
    <Box bg={bgColor} px={4} borderBottom="1px" borderColor={borderColor}>
      <Flex h={16} alignItems="center" justifyContent="space-between" maxW="1200px" mx="auto">
        <ChakraLink 
          as={RouterLink} 
          to="/" 
          fontSize="xl" 
          fontWeight="bold" 
          _hover={{ 
            textDecoration: 'none',
            color: 'blue.500',
            transform: 'scale(1.05)',
            textShadow: '0 0 8px rgba(66, 153, 225, 0.6)'
          }}
          transition="all 0.3s ease"
          cursor="pointer"
        >
          Growlytic
        </ChakraLink>

        {/* Desktop Navigation */}
        <Flex alignItems="center" gap={4} display={{ base: 'none', md: 'flex' }}>
          <ChakraLink 
            as={RouterLink} 
            to="/jobs"
            position="relative"
            _hover={{ 
              color: 'blue.500',
              transform: 'translateY(-2px)',
              _after: {
                width: '100%',
                opacity: 1
              }
            }}
            _after={{
              content: '""',
              position: 'absolute',
              bottom: '-4px',
              left: '0',
              width: '0%',
              height: '2px',
              bg: 'blue.500',
              transition: 'all 0.3s ease',
              opacity: 0
            }}
            transition="all 0.3s ease"
          >
            Browse Jobs
          </ChakraLink>
          <ChakraLink 
            as={RouterLink} 
            to="/free-courses"
            position="relative"
            _hover={{ 
              color: 'green.500',
              transform: 'translateY(-2px)',
              _after: {
                width: '100%',
                opacity: 1
              }
            }}
            _after={{
              content: '""',
              position: 'absolute',
              bottom: '-4px',
              left: '0',
              width: '0%',
              height: '2px',
              bg: 'green.500',
              transition: 'all 0.3s ease',
              opacity: 0
            }}
            transition="all 0.3s ease"
          >
            Free Courses
          </ChakraLink>
          <ChakraLink 
            as={RouterLink} 
            to="/free-books"
            position="relative"
            _hover={{ 
              color: 'purple.500',
              transform: 'translateY(-2px)',
              _after: {
                width: '100%',
                opacity: 1
              }
            }}
            _after={{
              content: '""',
              position: 'absolute',
              bottom: '-4px',
              left: '0',
              width: '0%',
              height: '2px',
              bg: 'purple.500',
              transition: 'all 0.3s ease',
              opacity: 0
            }}
            transition="all 0.3s ease"
          >
            Free Books
          </ChakraLink>
          <ChakraLink 
            as={RouterLink} 
            to="/opportunities"
            position="relative"
            _hover={{ 
              color: 'orange.500',
              transform: 'translateY(-2px)',
              _after: {
                width: '100%',
                opacity: 1
              }
            }}
            _after={{
              content: '""',
              position: 'absolute',
              bottom: '-4px',
              left: '0',
              width: '0%',
              height: '2px',
              bg: 'orange.500',
              transition: 'all 0.3s ease',
              opacity: 0
            }}
            transition="all 0.3s ease"
          >
            Opportunities
          </ChakraLink>
          <ChakraLink 
            as={RouterLink} 
            to="/blogs"
            position="relative"
            _hover={{ 
              color: 'pink.500',
              transform: 'translateY(-2px)',
              _after: {
                width: '100%',
                opacity: 1
              }
            }}
            _after={{
              content: '""',
              position: 'absolute',
              bottom: '-4px',
              left: '0',
              width: '0%',
              height: '2px',
              bg: 'pink.500',
              transition: 'all 0.3s ease',
              opacity: 0
            }}
            transition="all 0.3s ease"
          >
            Blogs
          </ChakraLink>
          
          {user && !loading ? (
            <>
              {isAdmin && (
                <Menu>
                  <MenuButton
                    as={Button}
                    rightIcon={<ChevronDownIcon />}
                    leftIcon={<FaCog />}
                    variant="ghost"
                    colorScheme="blue"
                    _hover={{
                      bg: 'blue.50',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(66, 153, 225, 0.3)',
                      borderColor: 'blue.300'
                    }}
                    _active={{
                      transform: 'translateY(0px)',
                      boxShadow: '0 2px 6px rgba(66, 153, 225, 0.2)'
                    }}
                    transition="all 0.3s ease"
                    border="1px solid transparent"
                  >
                    Admin Dashboard
                  </MenuButton>
                  <MenuList>
                    <MenuItem as={RouterLink} to="/create-job" icon={<FaPlus />}>
                      Create Job
                    </MenuItem>
                    <MenuItem as={RouterLink} to="/admin/job-management" icon={<FaList />}>
                      Job Management
                    </MenuItem>
                    <MenuDivider />
                    <MenuItem as={RouterLink} to="/admin/free-courses" icon={<FaBookOpen />}>
                      Free Courses
                    </MenuItem>
                    <MenuItem as={RouterLink} to="/admin/free-books" icon={<FaBook />}>
                      Free Books
                    </MenuItem>
                    <MenuItem as={RouterLink} to="/admin/opportunities" icon={<FaMoneyBillWave />}>
                      Opportunities
                    </MenuItem>
                    <MenuDivider />
                    <MenuItem as={RouterLink} to="/admin/blog-management" icon={<FaEdit />}>
                      Blog Management
                    </MenuItem>
                  </MenuList>
                </Menu>
              )}
                             <ChakraLink 
                 as={RouterLink} 
                 to="/saved-items"
                 position="relative"
                 _hover={{ 
                   color: 'red.500',
                   transform: 'translateY(-2px)',
                   _after: {
                     width: '100%',
                     opacity: 1
                   }
                 }}
                 _after={{
                   content: '""',
                   position: 'absolute',
                   bottom: '-4px',
                   left: '0',
                   width: '0%',
                   height: '2px',
                   bg: 'red.500',
                   transition: 'all 0.3s ease',
                   opacity: 0
                 }}
                 transition="all 0.3s ease"
               >
                 Saved Items
              </ChakraLink>
               <Button 
                 onClick={() => signOut()} 
                 variant="outline"
                 _hover={{
                   bg: 'red.50',
                   borderColor: 'red.300',
                   color: 'red.600',
                   transform: 'translateY(-2px)',
                   boxShadow: '0 4px 12px rgba(245, 101, 101, 0.3)'
                 }}
                 _active={{
                   transform: 'translateY(0px)',
                   boxShadow: '0 2px 6px rgba(245, 101, 101, 0.2)'
                 }}
                 transition="all 0.3s ease"
               >
                Sign Out
              </Button>
            </>
          ) : user && loading ? (
            <Box>
              Loading...
            </Box>
          ) : (
            <>
               <ChakraLink 
                 as={RouterLink} 
                 to="/login"
                 _hover={{
                   color: 'blue.500',
                   transform: 'translateY(-2px)',
                   textDecoration: 'none'
                 }}
                 transition="all 0.3s ease"
               >
                Login
              </ChakraLink>
               <Button 
                 as={RouterLink} 
                 to="/register" 
                 colorScheme="blue"
                 _hover={{
                   bg: 'blue.600',
                   transform: 'translateY(-2px)',
                   boxShadow: '0 4px 12px rgba(66, 153, 225, 0.4)'
                 }}
                 _active={{
                   transform: 'translateY(0px)',
                   boxShadow: '0 2px 6px rgba(66, 153, 225, 0.3)'
                 }}
                 transition="all 0.3s ease"
               >
                Sign Up
              </Button>
            </>
          )}
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
        >
                     <ChakraLink 
             as={RouterLink} 
             to="/jobs" 
             onClick={() => setIsMenuOpen(false)}
             _hover={{
               color: 'blue.500',
               transform: 'translateX(8px)',
               bg: 'blue.50',
               px: 3,
               py: 1,
               borderRadius: 'md'
             }}
             transition="all 0.3s ease"
             py={2}
           >
            Browse Jobs
          </ChakraLink>
           <ChakraLink 
             as={RouterLink} 
             to="/free-courses" 
             onClick={() => setIsMenuOpen(false)}
             _hover={{
               color: 'green.500',
               transform: 'translateX(8px)',
               bg: 'green.50',
               px: 3,
               py: 1,
               borderRadius: 'md'
             }}
             transition="all 0.3s ease"
             py={2}
           >
            Free Courses
          </ChakraLink>
           <ChakraLink 
             as={RouterLink} 
             to="/free-books" 
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
           >
             Free Books
           </ChakraLink>
           <ChakraLink 
             as={RouterLink} 
             to="/opportunities" 
             onClick={() => setIsMenuOpen(false)}
             _hover={{
               color: 'orange.500',
               transform: 'translateX(8px)',
               bg: 'orange.50',
               px: 3,
               py: 1,
               borderRadius: 'md'
             }}
             transition="all 0.3s ease"
             py={2}
           >
             Opportunities
           </ChakraLink>
           <ChakraLink 
             as={RouterLink} 
             to="/blogs" 
             onClick={() => setIsMenuOpen(false)}
             _hover={{
               color: 'pink.500',
               transform: 'translateX(8px)',
               bg: 'pink.50',
               px: 3,
               py: 1,
               borderRadius: 'md'
             }}
             transition="all 0.3s ease"
             py={2}
           >
            Blogs
          </ChakraLink>
          {user && !loading ? (
            <>
              {isAdmin && (
                <VStack spacing={3} width="100%">
                  <Menu>
                    <MenuButton
                      as={Button}
                      rightIcon={<ChevronDownIcon />}
                      leftIcon={<FaCog />}
                      variant="outline"
                      colorScheme="blue"
                     width="100%"
                  >
                      Admin Dashboard
                    </MenuButton>
                    <MenuList>
                      <MenuItem as={RouterLink} to="/create-job" icon={<FaPlus />} onClick={() => setIsMenuOpen(false)}>
                    Create Job
                      </MenuItem>
                      <MenuItem as={RouterLink} to="/admin/job-management" icon={<FaList />} onClick={() => setIsMenuOpen(false)}>
                    Job Management
                      </MenuItem>
                      <MenuDivider />
                      <MenuItem as={RouterLink} to="/admin/free-courses" icon={<FaBookOpen />} onClick={() => setIsMenuOpen(false)}>
                    Free Courses
                      </MenuItem>
                      <MenuItem as={RouterLink} to="/admin/free-books" icon={<FaBook />} onClick={() => setIsMenuOpen(false)}>
                        Free Books
                      </MenuItem>
                      <MenuItem as={RouterLink} to="/admin/opportunities" icon={<FaMoneyBillWave />} onClick={() => setIsMenuOpen(false)}>
                        Opportunities
                      </MenuItem>
                      <MenuDivider />
                      <MenuItem as={RouterLink} to="/admin/blog-management" icon={<FaEdit />} onClick={() => setIsMenuOpen(false)}>
                    Blog Management
                      </MenuItem>
                    </MenuList>
                  </Menu>
                </VStack>
              )}
              <ChakraLink as={RouterLink} to="/saved-items" onClick={() => setIsMenuOpen(false)}>
                Saved Items
              </ChakraLink>
              <Button onClick={() => { signOut(); setIsMenuOpen(false) }} variant="outline" width="100%">
                Sign Out
              </Button>
            </>
          ) : user && loading ? (
            <Box>
              Loading...
            </Box>
          ) : (
            <VStack spacing={3} width="100%">
              <ChakraLink as={RouterLink} to="/login" onClick={() => setIsMenuOpen(false)} width="100%" textAlign="center">
                Login
              </ChakraLink>
              <Button as={RouterLink} to="/register" colorScheme="blue" onClick={() => setIsMenuOpen(false)} width="100%">
                Sign Up
              </Button>
            </VStack>
          )}
        </Box>
      </Collapse>
    </Box>
  )
}

export default Navbar