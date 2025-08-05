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
        <ChakraLink as={RouterLink} to="/" fontSize="xl" fontWeight="bold" _hover={{ textDecoration: 'none' }}>
          Piko Job
        </ChakraLink>

        {/* Desktop Navigation */}
        <Flex alignItems="center" gap={4} display={{ base: 'none', md: 'flex' }}>
          <ChakraLink as={RouterLink} to="/jobs">
            Browse Jobs
          </ChakraLink>
          <ChakraLink as={RouterLink} to="/free-courses">
            Free Courses
          </ChakraLink>
          <ChakraLink as={RouterLink} to="/free-books">
            Free Books
          </ChakraLink>
          <ChakraLink as={RouterLink} to="/opportunities">
            Opportunities
          </ChakraLink>
          <ChakraLink as={RouterLink} to="/blogs">
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
              <ChakraLink as={RouterLink} to="/saved-items">
                Saved Items
              </ChakraLink>
              <Button onClick={() => signOut()} variant="outline">
                Sign Out
              </Button>
            </>
          ) : user && loading ? (
            <Box>
              Loading...
            </Box>
          ) : (
            <>
              <ChakraLink as={RouterLink} to="/login">
                Login
              </ChakraLink>
              <Button as={RouterLink} to="/register" colorScheme="blue">
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
          <ChakraLink as={RouterLink} to="/jobs" onClick={() => setIsMenuOpen(false)}>
            Browse Jobs
          </ChakraLink>
          <ChakraLink as={RouterLink} to="/free-courses" onClick={() => setIsMenuOpen(false)}>
            Free Courses
          </ChakraLink>
          <ChakraLink as={RouterLink} to="/free-books" onClick={() => setIsMenuOpen(false)}>
            Free Books
          </ChakraLink>
          <ChakraLink as={RouterLink} to="/opportunities" onClick={() => setIsMenuOpen(false)}>
            Opportunities
          </ChakraLink>
          <ChakraLink as={RouterLink} to="/blogs" onClick={() => setIsMenuOpen(false)}>
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