import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Container,
  Heading,
  VStack,
  Button,
  useToast,
  SimpleGrid,
  Text,
  Flex,
  IconButton,
  Badge,
  HStack,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Link as ChakraLink,
  Divider,
  Icon,
} from '@chakra-ui/react'
import { FaBookmark, FaExternalLinkAlt } from 'react-icons/fa'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

const SavedCourses = () => {
  const [savedCourses, setSavedCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const toast = useToast()
  const { user } = useAuth()

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    fetchSavedCourses()
  }, [user, navigate])

  const fetchSavedCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('saved_courses')
        .select(`
          course_id,
          created_at,
          free_courses (
            id,
            title,
            description,
            provider,
            category,
            link,
            created_at
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      setSavedCourses(data.map(item => ({
        ...item.free_courses,
        saved_at: item.created_at
      })))
    } catch (error) {
      console.error('Error fetching saved courses:', error)
      toast({
        title: 'Error',
        description: 'Failed to load saved courses',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUnsaveCourse = async (courseId) => {
    try {
      const { error } = await supabase
        .from('saved_courses')
        .delete()
        .eq('user_id', user.id)
        .eq('course_id', courseId)

      if (error) throw error

      setSavedCourses(prev => prev.filter(course => course.id !== courseId))

      toast({
        title: 'Course Unsaved',
        description: 'Course has been removed from your saved courses',
        status: 'info',
        duration: 3000,
        isClosable: true,
      })
    } catch (error) {
      console.error('Error unsaving course:', error)
      toast({
        title: 'Error',
        description: 'Failed to unsave course',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  if (!user) {
    return (
      <Container maxW="container.md" py={8}>
        <Box textAlign="center">
          <Heading size="lg">Please sign in to view your saved courses</Heading>
          <Button mt={4} onClick={() => navigate('/login')}>Sign In</Button>
        </Box>
      </Container>
    )
  }

  return (
    <Container maxW="container.md" py={8}>
      <VStack spacing={8} align="stretch">
        <Heading>Saved Courses</Heading>

        <Box>
          {loading ? (
            <Text>Loading saved courses...</Text>
          ) : savedCourses.length === 0 ? (
            <Text>You haven't saved any courses yet.</Text>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              {savedCourses.map((course) => {
                const isNew = (Date.now() - new Date(course.created_at).getTime()) < 3 * 24 * 60 * 60 * 1000;
                return (
                  <Card
                    key={course.id}
                    boxShadow="lg"
                    borderRadius="2xl"
                    bg="white"
                    borderLeft="6px solid #3182ce"
                    transition="transform 0.2s, box-shadow 0.2s"
                    _hover={{ transform: 'translateY(-6px) scale(1.02)', boxShadow: '2xl' }}
                    p={0}
                  >
                    <CardHeader
                      bgGradient="linear(to-r, blue.500, blue.300)"
                      color="white"
                      borderTopLeftRadius="2xl"
                      borderTopRightRadius="2xl"
                      py={4}
                      px={6}
                      display="flex"
                      alignItems="center"
                      justifyContent="space-between"
                      flexWrap="wrap"
                    >
                      <Box>
                        <Heading size="md">{course.title}</Heading>
                        <Text fontSize="sm" color="whiteAlpha.800" mt={1}>{course.provider}</Text>
                        {course.category && (
                          <Badge colorScheme="purple" mt={2} fontSize="xs">
                            {course.category}
                          </Badge>
                        )}
                      </Box>
                      <VStack align="end" spacing={1}>
                        {isNew && <Badge colorScheme="green">New</Badge>}
                        <IconButton
                          aria-label="Unsave course"
                          icon={<FaBookmark />}
                          colorScheme="blue"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleUnsaveCourse(course.id)}
                        />
                      </VStack>
                    </CardHeader>
                    <CardBody px={6} py={4}>
                      <Text mb={4} color="gray.700" fontSize="md" fontWeight="medium">
                        {course.description}
                      </Text>
                      <Divider my={2} />
                      <ChakraLink href={course.link} isExternal color="blue.500" fontWeight="bold" fontSize="md">
                        Go to Course <Icon as={FaExternalLinkAlt} ml={1} />
                      </ChakraLink>
                    </CardBody>
                    <CardFooter px={6} py={3} bg="gray.50" borderBottomLeftRadius="2xl" borderBottomRightRadius="2xl">
                      <VStack align="start" spacing={1} width="100%">
                        <Text fontSize="xs" color="gray.500">
                          Posted on {new Date(course.created_at).toLocaleString()}
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                          Saved on: {new Date(course.saved_at).toLocaleDateString()}
                        </Text>
                      </VStack>
                    </CardFooter>
                  </Card>
                );
              })}
            </SimpleGrid>
          )}
        </Box>
      </VStack>
    </Container>
  )
}

export default SavedCourses 