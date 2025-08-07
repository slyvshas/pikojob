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
  useColorModeValue,
  useBreakpointValue,
  Stack,
  Center,
  Spinner,
} from '@chakra-ui/react'
import { FaBookmark, FaMapMarkerAlt, FaBriefcase, FaMoneyBillWave, FaExternalLinkAlt, FaNewspaper, FaBook, FaCalendarAlt } from 'react-icons/fa'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

const SavedItems = () => {
  const [savedJobs, setSavedJobs] = useState([])
  const [savedCourses, setSavedCourses] = useState([])
  const [savedBlogs, setSavedBlogs] = useState([])
  const [savedBooks, setSavedBooks] = useState([])
  const [savedOpportunities, setSavedOpportunities] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const toast = useToast()
  const { user, loading: authLoading } = useAuth()

  // Theme colors
  const bgColor = useColorModeValue('gray.50', 'gray.900')
  const cardBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const textColor = useColorModeValue('gray.800', 'white')
  const mutedColor = useColorModeValue('gray.600', 'gray.400')

  // Responsive values
  const containerMaxW = useBreakpointValue({ base: '100%', md: 'container.md', lg: 'container.xl' })
  const buttonSize = useBreakpointValue({ base: 'lg', md: 'md' })
  const headingSize = useBreakpointValue({ base: 'lg', md: 'xl' })
  const tabSize = useBreakpointValue({ base: 'sm', md: 'md' })

  useEffect(() => {
    if (authLoading) return; // Wait for auth to finish loading
    if (!user && !authLoading) {
      navigate('/login');
      return;
    }
    if (user) {
      fetchAllSavedItems();
    }
  }, [user, authLoading, navigate]);

  const fetchAllSavedItems = async () => {
    setLoading(true)
    try {
      await Promise.all([
        fetchSavedJobs(),
        fetchSavedCourses(),
        fetchSavedBlogs(),
        fetchSavedBooks(),
        fetchSavedOpportunities()
      ])
    } catch (error) {
      console.error('Error fetching saved items:', error)
    } finally {
      setLoading(false)
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
        created_at: item.created_at
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
      // First get the saved course IDs
      const { data: savedData, error: savedError } = await supabase
        .from('saved_courses')
        .select('course_id, saved_at')
        .eq('user_id', user.id)
        .order('saved_at', { ascending: false })

      if (savedError) throw savedError

      if (savedData.length === 0) {
        setSavedCourses([])
        return
      }

      // Then get the course details
      const courseIds = savedData.map(item => item.course_id)
      const { data: coursesData, error: coursesError } = await supabase
        .from('free_courses')
        .select('*')
        .in('id', courseIds)

      if (coursesError) throw coursesError

      // Combine the data
      const coursesWithSavedAt = coursesData.map(course => {
        const savedItem = savedData.find(item => item.course_id === course.id)
        return {
          ...course,
          saved_at: savedItem.saved_at
        }
      })

      setSavedCourses(coursesWithSavedAt)
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
      // First get the saved blog slugs
      const { data: savedData, error: savedError } = await supabase
        .from('saved_blogs')
        .select('blog_slug, saved_at')
        .eq('user_id', user.id)
        .order('saved_at', { ascending: false })

      if (savedError) throw savedError

      if (savedData.length === 0) {
        setSavedBlogs([])
        return
      }

      // Then get the blog details
      const blogSlugs = savedData.map(item => item.blog_slug)
      const { data: blogsData, error: blogsError } = await supabase
        .from('blog_posts')
        .select('*')
        .in('slug', blogSlugs)

      if (blogsError) throw blogsError

      // Combine the data
      const blogsWithSavedAt = blogsData.map(blog => {
        const savedItem = savedData.find(item => item.blog_slug === blog.slug)
        return {
          ...blog,
          saved_at: savedItem.saved_at
        }
      })

      setSavedBlogs(blogsWithSavedAt)
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

  const fetchSavedBooks = async () => {
    try {
      // First get the saved book IDs
      const { data: savedData, error: savedError } = await supabase
        .from('saved_books')
        .select('book_id, saved_at')
        .eq('user_id', user.id)
        .order('saved_at', { ascending: false })

      if (savedError) throw savedError

      if (savedData.length === 0) {
        setSavedBooks([])
        return
      }

      // Then get the book details
      const bookIds = savedData.map(item => item.book_id)
      const { data: booksData, error: booksError } = await supabase
        .from('free_books')
        .select('*')
        .in('id', bookIds)

      if (booksError) throw booksError

      // Combine the data
      const booksWithSavedAt = booksData.map(book => {
        const savedItem = savedData.find(item => item.book_id === book.id)
        return {
          ...book,
          saved_at: savedItem.saved_at
        }
      })

      setSavedBooks(booksWithSavedAt)
    } catch (error) {
      console.error('Error fetching saved books:', error)
      toast({
        title: 'Error',
        description: 'Failed to load saved books',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  const fetchSavedOpportunities = async () => {
    try {
      // First get the saved opportunity IDs
      const { data: savedData, error: savedError } = await supabase
        .from('saved_opportunities')
        .select('opportunity_id, saved_at')
        .eq('user_id', user.id)
        .order('saved_at', { ascending: false })

      if (savedError) throw savedError

      if (savedData.length === 0) {
        setSavedOpportunities([])
        return
      }

      // Then get the opportunity details
      const opportunityIds = savedData.map(item => item.opportunity_id)
      const { data: opportunitiesData, error: opportunitiesError } = await supabase
        .from('opportunities')
        .select('*')
        .in('id', opportunityIds)

      if (opportunitiesError) throw opportunitiesError

      // Combine the data
      const opportunitiesWithSavedAt = opportunitiesData.map(opportunity => {
        const savedItem = savedData.find(item => item.opportunity_id === opportunity.id)
        return {
          ...opportunity,
          saved_at: savedItem.saved_at
        }
      })

      setSavedOpportunities(opportunitiesWithSavedAt)
    } catch (error) {
      console.error('Error fetching saved opportunities:', error)
      toast({
        title: 'Error',
        description: 'Failed to load saved opportunities',
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

  const handleUnsaveBook = async (bookId) => {
    try {
      const { error } = await supabase
        .from('saved_books')
        .delete()
        .eq('user_id', user.id)
        .eq('book_id', bookId)

      if (error) throw error

      setSavedBooks(prev => prev.filter(book => book.id !== bookId))

      toast({
        title: 'Book Unsaved',
        description: 'Book has been removed from your saved items',
        status: 'info',
        duration: 3000,
        isClosable: true,
      })
    } catch (error) {
      console.error('Error unsaving book:', error)
      toast({
        title: 'Error',
        description: 'Failed to unsave book',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  const handleUnsaveOpportunity = async (opportunityId) => {
    try {
      const { error } = await supabase
        .from('saved_opportunities')
        .delete()
        .eq('user_id', user.id)
        .eq('opportunity_id', opportunityId)

      if (error) throw error

      setSavedOpportunities(prev => prev.filter(opportunity => opportunity.id !== opportunityId))

      toast({
        title: 'Opportunity Unsaved',
        description: 'Opportunity has been removed from your saved items',
        status: 'info',
        duration: 3000,
        isClosable: true,
      })
    } catch (error) {
      console.error('Error unsaving opportunity:', error)
      toast({
        title: 'Error',
        description: 'Failed to unsave opportunity',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  if (!user) {
    return (
      <Box bg={bgColor} minH="100vh" py={8}>
        <Container maxW={containerMaxW}>
          <Card bg={cardBg} p={8} textAlign="center">
            <Heading size={headingSize} mb={4}>Please sign in to view your saved items</Heading>
            <Button size={buttonSize} onClick={() => navigate('/login')}>Sign In</Button>
          </Card>
        </Container>
      </Box>
    )
  }

  const totalSavedItems = savedJobs.length + savedCourses.length + savedBlogs.length + savedBooks.length + savedOpportunities.length

  return (
    <Box bg={bgColor} minH="100vh" py={{ base: 4, md: 8 }}>
      <Container maxW={containerMaxW} px={{ base: 2, md: 4 }}>
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <Box textAlign="center">
            <Heading 
              size={headingSize} 
              mb={4} 
              color={textColor}
              fontFamily="'Poppins', sans-serif"
            >
              Saved Items ({totalSavedItems})
            </Heading>
            <Text color={mutedColor} fontSize={{ base: 'md', md: 'lg' }}>
              Your personalized collection of saved content
            </Text>
          </Box>

          {/* Loading State */}
          {loading && (
            <Center py={12}>
              <VStack spacing={4}>
                <Spinner size="xl" thickness="4px" color="blue.500" />
                <Text color={mutedColor}>Loading your saved items...</Text>
              </VStack>
            </Center>
          )}

          {/* Tabs */}
          {!loading && (
            <Tabs variant="enclosed" colorScheme="blue" size={tabSize}>
              <TabList overflowX="auto" overflowY="hidden" whiteSpace="nowrap">
                <Tab minW="auto" px={{ base: 3, md: 4 }}>
                  <HStack spacing={2}>
                    <FaBriefcase />
                    <Text fontSize={{ base: 'xs', md: 'sm' }}>Jobs ({savedJobs.length})</Text>
                  </HStack>
                </Tab>
                <Tab minW="auto" px={{ base: 3, md: 4 }}>
                  <HStack spacing={2}>
                    <FaBookmark />
                    <Text fontSize={{ base: 'xs', md: 'sm' }}>Courses ({savedCourses.length})</Text>
                  </HStack>
                </Tab>
                <Tab minW="auto" px={{ base: 3, md: 4 }}>
                  <HStack spacing={2}>
                    <FaNewspaper />
                    <Text fontSize={{ base: 'xs', md: 'sm' }}>Blogs ({savedBlogs.length})</Text>
                  </HStack>
                </Tab>
                <Tab minW="auto" px={{ base: 3, md: 4 }}>
                  <HStack spacing={2}>
                    <FaBook />
                    <Text fontSize={{ base: 'xs', md: 'sm' }}>Books ({savedBooks.length})</Text>
                  </HStack>
                </Tab>
                <Tab minW="auto" px={{ base: 3, md: 4 }}>
                  <HStack spacing={2}>
                    <FaMoneyBillWave />
                    <Text fontSize={{ base: 'xs', md: 'sm' }}>Opportunities ({savedOpportunities.length})</Text>
                  </HStack>
                </Tab>
              </TabList>

              <TabPanels>
                {/* Jobs Tab */}
                <TabPanel px={{ base: 2, md: 4 }}>
                  {savedJobs.length === 0 ? (
                    <Center py={12}>
                      <VStack spacing={4}>
                        <Text color={mutedColor} fontSize="lg">You haven't saved any jobs yet.</Text>
                        <Button size={buttonSize} onClick={() => navigate('/jobs')}>
                          Browse Jobs
                        </Button>
                      </VStack>
                    </Center>
                  ) : (
                    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={{ base: 4, md: 6 }}>
                      {savedJobs.map((job) => (
                        <Card
                          key={job.id}
                          bg={cardBg}
                          borderRadius="xl"
                          boxShadow="md"
                          border="1px solid"
                          borderColor={borderColor}
                          overflow="hidden"
                        >
                          <CardHeader pb={4}>
                            <Flex justify="space-between" align="center">
                              {job.company_logo_url && (
                                <Image
                                  src={job.company_logo_url}
                                  alt={`${job.company_name} logo`}
                                  boxSize={{ base: '40px', md: '50px' }}
                                  objectFit="contain"
                                  borderRadius="md"
                                />
                              )}
                              <IconButton
                                aria-label="Unsave job"
                                icon={<FaBookmark />}
                                colorScheme="blue"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleUnsaveJob(job.id)}
                              />
                            </Flex>
                          </CardHeader>

                          <CardBody pt={0}>
                            <VStack align="stretch" spacing={4}>
                              <Box>
                                <Heading size="sm" mb={2} noOfLines={2}>
                                  {job.title}
                                </Heading>
                                <Text fontWeight="medium" color={mutedColor} fontSize="sm">
                                  {job.company_name}
                                </Text>
                              </Box>

                              <VStack align="start" spacing={2} fontSize="sm" color={mutedColor}>
                                <HStack spacing={2}>
                                  <FaMapMarkerAlt size={12} />
                                  <Text fontSize="xs">{job.location}</Text>
                                </HStack>
                                <HStack spacing={2}>
                                  <FaBriefcase size={12} />
                                  <Text fontSize="xs">{job.employment_type}</Text>
                                </HStack>
                                {job.salary && (
                                  <HStack spacing={2}>
                                    <FaMoneyBillWave size={12} />
                                    <Text fontSize="xs">{job.salary}</Text>
                                  </HStack>
                                )}
                              </VStack>

                              {job.tags && (
                                <Flex wrap="wrap" gap={1}>
                                  {job.tags.split(',').slice(0, 3).map((tag, index) => (
                                    <Badge
                                      key={index}
                                      colorScheme="blue"
                                      variant="subtle"
                                      fontSize="xs"
                                      px={2}
                                      py={1}
                                      borderRadius="full"
                                    >
                                      {tag.trim()}
                                    </Badge>
                                  ))}
                                  {job.tags.split(',').length > 3 && (
                                    <Badge
                                      colorScheme="gray"
                                      variant="subtle"
                                      fontSize="xs"
                                      px={2}
                                      py={1}
                                      borderRadius="full"
                                    >
                                      +{job.tags.split(',').length - 3}
                                    </Badge>
                                  )}
                                </Flex>
                              )}
                            </VStack>
                          </CardBody>

                          <CardFooter pt={0}>
                            <Button
                              onClick={() => navigate(`/jobs/${job.id}`)}
                              colorScheme="blue"
                              size={buttonSize}
                              w="full"
                              borderRadius="lg"
                            >
                              View Details
                            </Button>
                          </CardFooter>
                        </Card>
                      ))}
                    </SimpleGrid>
                  )}
                </TabPanel>

                {/* Courses Tab */}
                <TabPanel px={{ base: 2, md: 4 }}>
                  {savedCourses.length === 0 ? (
                    <Center py={12}>
                      <VStack spacing={4}>
                        <Text color={mutedColor} fontSize="lg">You haven't saved any courses yet.</Text>
                        <Button size={buttonSize} onClick={() => navigate('/courses')}>
                          Browse Courses
                        </Button>
                      </VStack>
                    </Center>
                  ) : (
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={{ base: 4, md: 6 }}>
                      {savedCourses.map((course) => {
                        const isNew = (Date.now() - new Date(course.created_at).getTime()) < 3 * 24 * 60 * 60 * 1000;
                        return (
                          <Card
                            key={course.id}
                            bg={cardBg}
                            borderRadius="xl"
                            boxShadow="md"
                            border="1px solid"
                            borderColor={borderColor}
                            overflow="hidden"
                          >
                            <CardHeader
                              bgGradient="linear(to-r, blue.500, blue.300)"
                              color="white"
                              py={4}
                              px={6}
                            >
                              <Flex justify="space-between" align="start">
                                <Box flex="1">
                                  <Heading size="sm" mb={2} noOfLines={2}>
                                    {course.title}
                                  </Heading>
                                  <Text fontSize="xs" color="whiteAlpha.800">
                                    {course.provider}
                                  </Text>
                                  {course.category && (
                                    <Badge colorScheme="purple" mt={2} fontSize="xs">
                                      {course.category}
                                    </Badge>
                                  )}
                                </Box>
                                <VStack align="end" spacing={2}>
                                  {isNew && <Badge colorScheme="green" fontSize="xs">New</Badge>}
                                  <IconButton
                                    aria-label="Unsave course"
                                    icon={<FaBookmark />}
                                    colorScheme="blue"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleUnsaveCourse(course.id)}
                                  />
                                </VStack>
                              </Flex>
                            </CardHeader>

                            <CardBody px={6} py={4}>
                              <Text mb={4} color="gray.700" fontSize="sm" noOfLines={3}>
                                {course.description}
                              </Text>
                              <ChakraLink 
                                href={course.link} 
                                isExternal 
                                color="blue.500" 
                                fontWeight="bold" 
                                fontSize="sm"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                p={3}
                                bg="blue.50"
                                borderRadius="lg"
                                _hover={{ bg: 'blue.100' }}
                              >
                                Go to Course <Icon as={FaExternalLinkAlt} ml={2} />
                              </ChakraLink>
                            </CardBody>
                          </Card>
                        );
                      })}
                    </SimpleGrid>
                  )}
                </TabPanel>

                {/* Blogs Tab */}
                <TabPanel px={{ base: 2, md: 4 }}>
                  {savedBlogs.length === 0 ? (
                    <Center py={12}>
                      <VStack spacing={4}>
                        <Text color={mutedColor} fontSize="lg">You haven't saved any blogs yet.</Text>
                        <Button size={buttonSize} onClick={() => navigate('/blogs')}>
                          Browse Blogs
                        </Button>
                      </VStack>
                    </Center>
                  ) : (
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={{ base: 4, md: 6 }}>
                      {savedBlogs.map((blog) => (
                        <Card
                          key={blog.slug}
                          bg={cardBg}
                          borderRadius="xl"
                          boxShadow="md"
                          border="1px solid"
                          borderColor={borderColor}
                          overflow="hidden"
                        >
                          <CardHeader
                            bgGradient="linear(to-r, green.500, green.300)"
                            color="white"
                            py={4}
                            px={6}
                          >
                            <Flex justify="space-between" align="start">
                              <Box flex="1">
                                <Heading size="sm" mb={2} noOfLines={2}>
                                  {blog.title}
                                </Heading>
                                {blog.cover_image_url && (
                                  <Image
                                    src={blog.cover_image_url}
                                    alt={blog.title}
                                    boxSize={{ base: '40px', md: '50px' }}
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
                            </Flex>
                          </CardHeader>

                          <CardBody px={6} py={4}>
                            <Text mb={4} color="gray.700" fontSize="sm" noOfLines={3}>
                              {blog.excerpt}
                            </Text>
                            <Button
                              onClick={() => navigate(`/blogs/${blog.slug}`)}
                              colorScheme="green"
                              size={buttonSize}
                              w="full"
                              borderRadius="lg"
                            >
                              Read Blog
                            </Button>
                          </CardBody>
                        </Card>
                      ))}
                    </SimpleGrid>
                  )}
                </TabPanel>

                {/* Books Tab */}
                <TabPanel px={{ base: 2, md: 4 }}>
                  {savedBooks.length === 0 ? (
                    <Center py={12}>
                      <VStack spacing={4}>
                        <Text color={mutedColor} fontSize="lg">You haven't saved any books yet.</Text>
                        <Button size={buttonSize} onClick={() => navigate('/books')}>
                          Browse Books
                        </Button>
                      </VStack>
                    </Center>
                  ) : (
                    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={{ base: 4, md: 6 }}>
                      {savedBooks.map((book) => {
                        const isNew = (Date.now() - new Date(book.created_at).getTime()) < 3 * 24 * 60 * 60 * 1000;
                        
                        return (
                          <Card
                            key={book.id}
                            bg={cardBg}
                            borderRadius="xl"
                            boxShadow="md"
                            border="1px solid"
                            borderColor={borderColor}
                            overflow="hidden"
                          >
                            <CardHeader
                              bgGradient="linear(to-r, blue.500, blue.300)"
                              color="white"
                              py={4}
                              px={6}
                            >
                              <Flex justify="space-between" align="start">
                                <Box flex="1">
                                  <Heading size="sm" mb={2} noOfLines={2}>
                                    {book.title}
                                  </Heading>
                                  {book.author && (
                                    <Text fontSize="xs" color="whiteAlpha.800">
                                      by {book.author}
                                    </Text>
                                  )}
                                  {book.category && (
                                    <Badge colorScheme="purple" mt={2} fontSize="xs">
                                      {book.category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                    </Badge>
                                  )}
                                </Box>
                                <VStack align="end" spacing={2}>
                                  {isNew && <Badge colorScheme="green" fontSize="xs">New</Badge>}
                                  <IconButton
                                    aria-label="Unsave book"
                                    icon={<FaBookmark />}
                                    colorScheme="blue"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleUnsaveBook(book.id)}
                                  />
                                </VStack>
                              </Flex>
                            </CardHeader>

                            <CardBody px={6} py={4}>
                              {book.cover_image_url && (
                                <Box mb={4} textAlign="center">
                                  <Image
                                    src={book.cover_image_url}
                                    alt={book.title}
                                    maxH="80px"
                                    objectFit="contain"
                                    borderRadius="md"
                                    mx="auto"
                                  />
                                </Box>
                              )}
                              <Text mb={4} color="gray.700" fontSize="sm" noOfLines={3}>
                                {book.description}
                              </Text>
                              <HStack spacing={2} fontSize="xs" color="gray.500" mb={3}>
                                {book.pages && (
                                  <Text>{book.pages} pages</Text>
                                )}
                                {book.language && (
                                  <Text>{book.language}</Text>
                                )}
                                {book.format && (
                                  <Badge colorScheme="purple" variant="subtle" fontSize="xs">
                                    {book.format.toUpperCase()}
                                  </Badge>
                                )}
                              </HStack>
                              <ChakraLink 
                                href={book.link} 
                                isExternal 
                                color="blue.500" 
                                fontWeight="bold" 
                                fontSize="sm"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                p={3}
                                bg="blue.50"
                                borderRadius="lg"
                                _hover={{ bg: 'blue.100' }}
                              >
                                Download Book <Icon as={FaExternalLinkAlt} ml={2} />
                              </ChakraLink>
                            </CardBody>
                          </Card>
                        );
                      })}
                    </SimpleGrid>
                  )}
                </TabPanel>

                {/* Opportunities Tab */}
                <TabPanel px={{ base: 2, md: 4 }}>
                  {savedOpportunities.length === 0 ? (
                    <Center py={12}>
                      <VStack spacing={4}>
                        <Text color={mutedColor} fontSize="lg">You haven't saved any opportunities yet.</Text>
                        <Button size={buttonSize} onClick={() => navigate('/opportunities')}>
                          Browse Opportunities
                        </Button>
                      </VStack>
                    </Center>
                  ) : (
                    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={{ base: 4, md: 6 }}>
                      {savedOpportunities.map((opportunity) => {
                        const deadlineApproaching = opportunity.deadline && (new Date(opportunity.deadline) - new Date()) <= 30 * 24 * 60 * 60 * 1000 && (new Date(opportunity.deadline) - new Date()) >= 0;
                        const deadlinePassed = opportunity.deadline && new Date(opportunity.deadline) < new Date();
                        
                        return (
                          <Card
                            key={opportunity.id}
                            bg={cardBg}
                            borderRadius="xl"
                            boxShadow="md"
                            border="1px solid"
                            borderColor={borderColor}
                            overflow="hidden"
                          >
                            <CardHeader
                              bgGradient="linear(to-r, purple.500, purple.300)"
                              color="white"
                              py={4}
                              px={6}
                            >
                              <Flex justify="space-between" align="start">
                                <Box flex="1">
                                  <Heading size="sm" mb={2} noOfLines={2}>
                                    {opportunity.title}
                                  </Heading>
                                  {opportunity.organization && (
                                    <Text fontSize="xs" color="whiteAlpha.800">
                                      {opportunity.organization}
                                    </Text>
                                  )}
                                </Box>
                                <IconButton
                                  aria-label="Unsave opportunity"
                                  icon={<FaBookmark />}
                                  colorScheme="purple"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleUnsaveOpportunity(opportunity.id)}
                                />
                              </Flex>
                            </CardHeader>

                            <CardBody px={6} py={4}>
                              <VStack align="stretch" spacing={3}>
                                {opportunity.category && (
                                  <Badge colorScheme="purple" variant="subtle" fontSize="xs" alignSelf="start">
                                    {opportunity.category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                  </Badge>
                                )}
                                {opportunity.location && (
                                  <HStack spacing={2}>
                                    <Icon as={FaMapMarkerAlt} color="gray.500" fontSize="xs" />
                                    <Text fontSize="xs" color="gray.600">
                                      {opportunity.location}
                                    </Text>
                                  </HStack>
                                )}
                                {opportunity.deadline && (
                                  <HStack spacing={2}>
                                    <Icon as={FaCalendarAlt} color="gray.500" fontSize="xs" />
                                    <Text fontSize="xs" color={deadlinePassed ? 'red.500' : deadlineApproaching ? 'orange.500' : 'gray.600'}>
                                      Deadline: {new Date(opportunity.deadline).toLocaleDateString()}
                                    </Text>
                                  </HStack>
                                )}
                                <Text color="gray.700" fontSize="sm" noOfLines={3}>
                                  {opportunity.description}
                                </Text>
                              </VStack>
                            </CardBody>

                            <CardFooter pt={0}>
                              <Button
                                as={ChakraLink}
                                href={opportunity.link}
                                isExternal
                                colorScheme="purple"
                                size={buttonSize}
                                w="full"
                                borderRadius="lg"
                                isDisabled={deadlinePassed}
                              >
                                Apply Now
                              </Button>
                            </CardFooter>
                          </Card>
                        );
                      })}
                    </SimpleGrid>
                  )}
                </TabPanel>
              </TabPanels>
            </Tabs>
          )}
        </VStack>
      </Container>
    </Box>
  )
}

export default SavedItems 