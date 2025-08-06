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
  Image,
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
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from '@chakra-ui/react'
import { FaBookmark, FaMapMarkerAlt, FaBriefcase, FaMoneyBillWave, FaExternalLinkAlt, FaNewspaper } from 'react-icons/fa'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

const SavedItems = () => {
  const [savedJobs, setSavedJobs] = useState([])
  const [savedCourses, setSavedCourses] = useState([])
  const [savedBlogs, setSavedBlogs] = useState([])
  const [localLoading, setLocalLoading] = useState(true)
  const navigate = useNavigate()
  const toast = useToast()
  const { user, loading } = useAuth();
  useEffect(() => {
    if (loading) return; // Wait for auth to finish loading
    if (user && !loading) {
      fetchAllSavedItems();
    }
  }, [user, loading]);

  const fetchAllSavedItems = async () => {
    setLocalLoading(true)
    try {
      await Promise.all([
        fetchSavedJobs(),
        fetchSavedCourses(),
        fetchSavedBlogs()
      ])
    } catch (error) {
      console.error('Error fetching saved items:', error)
    } finally {
      setLocalLoading(false)
    }
  }

  const fetchSavedJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('saved_jobs')
        .select(`
          job_id,
          created_at,
          job_postings (
            id,
            title,
            company_name,
            company_logo_url,
            location,
            employment_type,
            salary,
            tags
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      setSavedJobs(data.map(item => ({
        ...item.job_postings,
        saved_at: item.created_at
      })))
    } catch (error) {
      console.error('Error fetching saved jobs:', error)
      toast({
        title: 'Error',
        description: 'Failed to load saved jobs',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

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
    }
  }

  const fetchSavedBlogs = async () => {
    try {
      const { data, error } = await supabase
        .from('saved_blogs')
        .select(`
          blog_slug,
          created_at,
          blogs (
            slug,
            title,
            excerpt,
            featured_image,
            created_at
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      setSavedBlogs(data.map(item => ({
        ...item.blogs,
        saved_at: item.created_at
      })))
    } catch (error) {
      console.error('Error fetching saved blogs:', error)
      toast({
        title: 'Error',
        description: 'Failed to load saved blogs',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  const handleUnsaveJob = async (jobId) => {
    try {
      const { error } = await supabase
        .from('saved_jobs')
        .delete()
        .eq('user_id', user.id)
        .eq('job_id', jobId)

      if (error) throw error

      setSavedJobs(prev => prev.filter(job => job.id !== jobId))

      toast({
        title: 'Job Unsaved',
        description: 'Job has been removed from your saved items',
        status: 'info',
        duration: 3000,
        isClosable: true,
      })
    } catch (error) {
      console.error('Error unsaving job:', error)
      toast({
        title: 'Error',
        description: 'Failed to unsave job',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
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
        description: 'Course has been removed from your saved items',
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

  const handleUnsaveBlog = async (blogSlug) => {
    try {
      const { error } = await supabase
        .from('saved_blogs')
        .delete()
        .eq('user_id', user.id)
        .eq('blog_slug', blogSlug)

      if (error) throw error

      setSavedBlogs(prev => prev.filter(blog => blog.slug !== blogSlug))

      toast({
        title: 'Blog Unsaved',
        description: 'Blog has been removed from your saved items',
        status: 'info',
        duration: 3000,
        isClosable: true,
      })
    } catch (error) {
      console.error('Error unsaving blog:', error)
      toast({
        title: 'Error',
        description: 'Failed to unsave blog',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  if (loading) {
    return (
      <Container maxW="container.md" py={8}>
        <Box textAlign="center">
          <Heading size="lg">Loading...</Heading>
        </Box>
      </Container>
    );
  }
  if (!user && !loading) {
    return (
      <Container maxW="container.md" py={8}>
        <Box textAlign="center">
          <Heading size="lg">You must be signed in to view your saved items.</Heading>
          <Button mt={4} onClick={() => navigate('/login')}>Sign In</Button>
        </Box>
      </Container>
    );
  }

  const totalSavedItems = savedJobs.length + savedCourses.length + savedBlogs.length

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Heading>Saved Items ({totalSavedItems})</Heading>

        <Tabs variant="enclosed" colorScheme="blue">
          <TabList>
            <Tab>
              <HStack>
                <FaBriefcase />
                <Text>Jobs ({savedJobs.length})</Text>
              </HStack>
            </Tab>
            <Tab>
              <HStack>
                <FaBookmark />
                <Text>Courses ({savedCourses.length})</Text>
              </HStack>
            </Tab>
            <Tab>
              <HStack>
                <FaNewspaper />
                <Text>Blogs ({savedBlogs.length})</Text>
              </HStack>
            </Tab>
          </TabList>

          <TabPanels>
            {/* Jobs Tab */}
            <TabPanel>
              {localLoading ? (
                <Text>Loading saved jobs...</Text>
              ) : savedJobs.length === 0 ? (
                <Text>You haven't saved any jobs yet.</Text>
              ) : (
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
                  {savedJobs.map((job) => (
                    <Box
                      key={job.id}
                      p={6}
                      borderRadius="2xl"
                      boxShadow="md"
                      borderWidth="1px"
                      borderColor="gray.200"
                    >
                      <VStack align="start" spacing={4}>
                        <Flex justify="space-between" width="100%" align="center">
                          {job.company_logo_url && (
                            <Image
                              src={job.company_logo_url}
                              alt={`${job.company_name} logo`}
                              boxSize="60px"
                              objectFit="contain"
                              borderRadius="md"
                            />
                          )}
                          <IconButton
                            aria-label="Unsave job"
                            icon={<FaBookmark />}
                            colorScheme="blue"
                            variant="ghost"
                            onClick={() => handleUnsaveJob(job.id)}
                          />
                        </Flex>

                        <Box>
                          <Heading size="md" mb={1}>
                            {job.title}
                          </Heading>
                          <Text fontWeight="medium" color="gray.600">
                            {job.company_name}
                          </Text>
                        </Box>

                        <VStack align="start" spacing={1} fontSize="sm" color="gray.500">
                          <HStack>
                            <FaMapMarkerAlt />
                            <Text>{job.location}</Text>
                          </HStack>
                          <HStack>
                            <FaBriefcase />
                            <Text>{job.employment_type}</Text>
                          </HStack>
                          <HStack>
                            <FaMoneyBillWave />
                            <Text>{job.salary}</Text>
                          </HStack>
                          <Text>Saved on: {new Date(job.saved_at).toLocaleDateString()}</Text>
                        </VStack>

                        {job.tags && (
                          <Flex wrap="wrap" gap={2}>
                            {job.tags.split(',').map((tag, index) => (
                              <Badge
                                key={index}
                                colorScheme="blue"
                                variant="solid"
                                borderRadius="full"
                                px={2}
                                py={1}
                                fontSize="xs"
                              >
                                {tag.trim()}
                              </Badge>
                            ))}
                          </Flex>
                        )}

                        <Button
                          onClick={() => navigate(`/jobs/${job.id}`)}
                          colorScheme="blue"
                          size="md"
                          width="100%"
                        >
                          View Job Details
                        </Button>
                      </VStack>
                    </Box>
                  ))}
                </SimpleGrid>
              )}
            </TabPanel>

            {/* Courses Tab */}
            <TabPanel>
              {localLoading ? (
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
            </TabPanel>

            {/* Blogs Tab */}
            <TabPanel>
              {localLoading ? (
                <Text>Loading saved blogs...</Text>
              ) : savedBlogs.length === 0 ? (
                <Text>You haven't saved any blogs yet.</Text>
              ) : (
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  {savedBlogs.map((blog) => (
                    <Card
                      key={blog.slug}
                      boxShadow="lg"
                      borderRadius="2xl"
                      bg="white"
                      borderLeft="6px solid #38a169"
                      transition="transform 0.2s, box-shadow 0.2s"
                      _hover={{ transform: 'translateY(-6px) scale(1.02)', boxShadow: '2xl' }}
                      p={0}
                    >
                      <CardHeader
                        bgGradient="linear(to-r, green.500, green.300)"
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
                          <Heading size="md">{blog.title}</Heading>
                          {blog.featured_image && (
                            <Image
                              src={blog.featured_image}
                              alt={blog.title}
                              boxSize="60px"
                              objectFit="cover"
                              borderRadius="md"
                              mt={2}
                            />
                          )}
                        </Box>
                        <IconButton
                          aria-label="Unsave blog"
                          icon={<FaBookmark />}
                          colorScheme="green"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleUnsaveBlog(blog.slug)}
                        />
                      </CardHeader>
                      <CardBody px={6} py={4}>
                        <Text mb={4} color="gray.700" fontSize="md" fontWeight="medium">
                          {blog.excerpt}
                        </Text>
                        <Divider my={2} />
                        <Button
                          onClick={() => navigate(`/blogs/${blog.slug}`)}
                          colorScheme="green"
                          size="md"
                          width="100%"
                        >
                          Read Blog Post
                        </Button>
                      </CardBody>
                      <CardFooter px={6} py={3} bg="gray.50" borderBottomLeftRadius="2xl" borderBottomRightRadius="2xl">
                        <VStack align="start" spacing={1} width="100%">
                          <Text fontSize="xs" color="gray.500">
                            Posted on {new Date(blog.created_at).toLocaleString()}
                          </Text>
                          <Text fontSize="xs" color="gray.500">
                            Saved on: {new Date(blog.saved_at).toLocaleDateString()}
                          </Text>
                        </VStack>
                      </CardFooter>
                    </Card>
                  ))}
                </SimpleGrid>
              )}
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>
    </Container>
  )
}

export default SavedItems 