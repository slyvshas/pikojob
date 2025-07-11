import { useState } from 'react'
import { Box, Flex, Button, Link as ChakraLink, useColorModeValue, IconButton, Collapse, VStack } from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { HamburgerIcon, CloseIcon } from '@chakra-ui/icons'
import { FaPlus, FaList, FaBookOpen, FaEdit } from 'react-icons/fa'

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
          <ChakraLink as={RouterLink} to="/blogs">
            Blogs
          </ChakraLink>
          
          {user && !loading ? (
            <>
              {isAdmin && (
                <>
                  <IconButton
                    as={RouterLink}
                    to="/create-job"
                    icon={<FaPlus />}
                    aria-label="Create Job"
                    variant="ghost"
                  />
                  <IconButton
                    as={RouterLink}
                    to="/admin/job-management"
                    icon={<FaList />}
                    aria-label="Job Management"
                    variant="ghost"
                  />
                  <IconButton
                    as={RouterLink}
                    to="/admin/free-courses"
                    icon={<FaBookOpen />}
                    aria-label="Free Courses"
                    variant="ghost"
                  />
                  <IconButton
                    as={RouterLink}
                    to="/admin/blog-management"
                    icon={<FaEdit />}
                    aria-label="Blog Management"
                    variant="ghost"
                  />
                </>
              )}
              <ChakraLink as={RouterLink} to="/saved-jobs">
                Saved Jobs
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
          <ChakraLink as={RouterLink} to="/blogs" onClick={() => setIsMenuOpen(false)}>
            Blogs
          </ChakraLink>
          {user && !loading ? (
            <>
              {isAdmin && (
                <VStack spacing={3} width="100%">
                  <Button
                     as={RouterLink}
                     to="/create-job"
                     leftIcon={<FaPlus />}
                     onClick={() => setIsMenuOpen(false)}
                     width="100%"
                  >
                    Create Job
                  </Button>
                  <Button
                    as={RouterLink}
                    to="/admin/job-management"
                    leftIcon={<FaList />}
                    onClick={() => setIsMenuOpen(false)}
                    width="100%"
                  >
                    Job Management
                  </Button>
                  <Button
                    as={RouterLink}
                    to="/admin/free-courses"
                    leftIcon={<FaBookOpen />}
                    onClick={() => setIsMenuOpen(false)}
                    width="100%"
                  >
                    Free Courses
                  </Button>
                  <Button
                    as={RouterLink}
                    to="/admin/blog-management"
                    leftIcon={<FaEdit />}
                    onClick={() => setIsMenuOpen(false)}
                    width="100%"
                  >
                    Blog Management
                  </Button>
                </VStack>
              )}
              <ChakraLink as={RouterLink} to="/saved-jobs" onClick={() => setIsMenuOpen(false)}>
                Saved Jobs
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