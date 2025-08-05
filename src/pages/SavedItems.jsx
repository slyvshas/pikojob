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
import { FaBookmark, FaMapMarkerAlt, FaBriefcase, FaMoneyBillWave, FaExternalLinkAlt, FaNewspaper, FaBook } from 'react-icons/fa'
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
  const { user } = useAuth()

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    fetchAllSavedItems()
  }, [user, navigate])

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
      <Container maxW="container.md" py={8}>
        <Box textAlign="center">
          <Heading size="lg">Please sign in to view your saved items</Heading>
          <Button mt={4} onClick={() => navigate('/login')}>Sign In</Button>
        </Box>
      </Container>
    )
  }

  const totalSavedItems = savedJobs.length + savedCourses.length + savedBlogs.length + savedBooks.length + savedOpportunities.length

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
            <Tab>
              <HStack>
                <FaBook />
                <Text>Books ({savedBooks.length})</Text>
              </HStack>
            </Tab>
            <Tab>
              <HStack>
                <FaMoneyBillWave />
                <Text>Opportunities ({savedOpportunities.length})</Text>
              </HStack>
            </Tab>
          </TabList>

          <TabPanels>
            {/* Jobs Tab */}
            <TabPanel>
              {loading ? (
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
            </TabPanel>

            {/* Blogs Tab */}
            <TabPanel>
              {loading ? (
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
                           {blog.cover_image_url && (
                             <Image
                               src={blog.cover_image_url}
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
                             Posted on {new Date(blog.published_at).toLocaleString()}
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

            {/* Books Tab */}
            <TabPanel>
              {loading ? (
                <Text>Loading saved books...</Text>
              ) : savedBooks.length === 0 ? (
                <Text>You haven't saved any books yet.</Text>
              ) : (
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                  {savedBooks.map((book) => {
                    const isNew = (Date.now() - new Date(book.created_at).getTime()) < 3 * 24 * 60 * 60 * 1000;
                    
                    return (
                      <Card
                        key={book.id}
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
                            <Heading size="md">{book.title}</Heading>
                            {book.author && (
                              <Text fontSize="sm" color="whiteAlpha.800" mt={1}>
                                by {book.author}
                              </Text>
                            )}
                            {book.category && (
                              <Badge colorScheme="purple" mt={2} fontSize="xs">
                                {book.category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </Badge>
                            )}
                          </Box>
                          <VStack align="end" spacing={1}>
                            {isNew && <Badge colorScheme="green">New</Badge>}
                            <IconButton
                              aria-label="Unsave book"
                              icon={<FaBookmark />}
                              colorScheme="blue"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleUnsaveBook(book.id)}
                            />
                          </VStack>
                        </CardHeader>
                        <CardBody px={6} py={4}>
                          {book.cover_image_url && (
                            <Box mb={4} textAlign="center">
                              <Image
                                src={book.cover_image_url}
                                alt={book.title}
                                maxH="120px"
                                objectFit="contain"
                                borderRadius="md"
                                mx="auto"
                              />
                            </Box>
                          )}
                          <Text mb={4} color="gray.700" fontSize="md" fontWeight="medium">
                            {book.description}
                          </Text>
                          <HStack spacing={4} fontSize="xs" color="gray.500" mb={3}>
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
                          <Divider my={2} />
                          <ChakraLink href={book.link} isExternal color="blue.500" fontWeight="bold" fontSize="md">
                            Download Book <Icon as={FaExternalLinkAlt} ml={1} />
                          </ChakraLink>
                        </CardBody>
                        <CardFooter px={6} py={3} bg="gray.50" borderBottomLeftRadius="2xl" borderBottomRightRadius="2xl">
                          <VStack align="start" spacing={1} width="100%">
                            <Text fontSize="xs" color="gray.500">
                              Posted on {new Date(book.created_at).toLocaleString()}
                            </Text>
                            <Text fontSize="xs" color="gray.500">
                              Saved on: {new Date(book.saved_at).toLocaleDateString()}
                            </Text>
                          </VStack>
                        </CardFooter>
                      </Card>
                    );
                  })}
                </SimpleGrid>
              )}
            </TabPanel>

            {/* Opportunities Tab */}
            <TabPanel>
              {loading ? (
                <Text>Loading saved opportunities...</Text>
              ) : savedOpportunities.length === 0 ? (
                <Text>You haven't saved any opportunities yet.</Text>
              ) : (
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                  {savedOpportunities.map((opportunity) => {
                    const deadlineApproaching = opportunity.deadline && (new Date(opportunity.deadline) - new Date()) <= 30 * 24 * 60 * 60 * 1000 && (new Date(opportunity.deadline) - new Date()) >= 0;
                    const deadlinePassed = opportunity.deadline && new Date(opportunity.deadline) < new Date();
                    
                    return (
                      <Card
                        key={opportunity.id}
                        boxShadow="lg"
                        borderRadius="2xl"
                        bg="white"
                        borderLeft="6px solid #805ad5"
                        transition="transform 0.2s, box-shadow 0.2s"
                        _hover={{ transform: 'translateY(-6px) scale(1.02)', boxShadow: '2xl' }}
                        p={0}
                      >
                        <CardHeader
                          bgGradient="linear(to-r, purple.500, purple.300)"
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
                            <Heading size="md">{opportunity.title}</Heading>
                            {opportunity.organization && (
                              <Text fontSize="sm" mt={1}>
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
                        </CardHeader>
                        <CardBody px={6} py={4}>
                          <VStack align="start" spacing={3}>
                            {opportunity.category && (
                              <Badge colorScheme="purple" variant="subtle" fontSize="xs">
                                {opportunity.category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </Badge>
                            )}
                            {opportunity.location && (
                              <HStack spacing={1}>
                                <Icon as={FaMapMarkerAlt} color="gray.500" fontSize="xs" />
                                <Text fontSize="xs" color="gray.600">
                                  {opportunity.location}
                                </Text>
                              </HStack>
                            )}
                            {opportunity.deadline && (
                              <HStack spacing={1}>
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
                        <CardFooter px={6} py={3} bg="gray.50" borderBottomLeftRadius="2xl" borderBottomRightRadius="2xl">
                          <VStack align="start" spacing={1} width="100%">
                            <Button
                              as={ChakraLink}
                              href={opportunity.link}
                              isExternal
                              colorScheme="purple"
                              size="sm"
                              width="100%"
                              isDisabled={deadlinePassed}
                            >
                              Apply Now
                            </Button>
                            <Text fontSize="xs" color="gray.500">
                              Saved on: {new Date(opportunity.saved_at).toLocaleDateString()}
                            </Text>
                          </VStack>
                        </CardFooter>
                      </Card>
                    );
                  })}
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