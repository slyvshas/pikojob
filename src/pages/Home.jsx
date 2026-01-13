import React, { useEffect, useState, lazy, Suspense } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  VStack,
  SimpleGrid,
  useColorModeValue,
  HStack,
  Badge,
  Image,
  Flex,
  Icon,
  Skeleton,
  SkeletonText,
  Stack,
} from '@chakra-ui/react'
import { FaGraduationCap, FaNewspaper, FaLightbulb, FaStar, FaArrowRight, FaBookOpen, FaRocket, FaSearch } from 'react-icons/fa'
import { supabase } from '../lib/supabase'
import { generateCoverForBlog } from '../utils/generateBlogCover'
import { generateOrganizationSchema, generateWebSiteSchema, injectMultipleSchemas, removeStructuredData } from '../utils/structuredData'

// Lazy load framer-motion to reduce initial bundle size
let motion = null;
let MotionBox = Box;
let MotionHeading = Heading;
let MotionText = Text;

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
}

const Home = () => {
  const [featuredBlogs, setFeaturedBlogs] = useState([])
  const [featuredCourses, setFeaturedCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  
  const cardBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.100', 'gray.700')
  const mutedColor = useColorModeValue('gray.700', 'gray.300')
  const heroBg = useColorModeValue(
    'radial-gradient(circle at top right, rgba(66, 153, 225, 0.1), transparent 40%), radial-gradient(circle at bottom left, rgba(128, 90, 213, 0.1), transparent 40%)',
    'radial-gradient(circle at top right, rgba(66, 153, 225, 0.1), transparent 40%), radial-gradient(circle at bottom left, rgba(128, 90, 213, 0.1), transparent 40%)'
  )
  const heroGradientText = useColorModeValue(
    'linear(to-r, blue.600, purple.600)',
    'linear(to-r, blue.200, purple.200)'
  )

  useEffect(() => {
    fetchFeaturedContent()
    
    // Inject structured data for homepage SEO
    const organizationSchema = generateOrganizationSchema()
    const websiteSchema = generateWebSiteSchema()
    injectMultipleSchemas([organizationSchema, websiteSchema])

    // Cleanup on unmount
    return () => {
      removeStructuredData()
    }
  }, [])

  const fetchFeaturedContent = async () => {
    try {
      const [blogsRes, coursesRes] = await Promise.all([
        supabase
          .from('blog_posts')
          .select('id, slug, title, excerpt, cover_image_url, category, created_at')
          .order('created_at', { ascending: false })
          .limit(3),
        supabase
          .from('free_courses')
          .select('id, title, provider, link, category')
          .order('created_at', { ascending: false })
          .limit(4)
      ])

      console.log('Blogs data:', blogsRes.data)
      console.log('Blogs error:', blogsRes.error)
      console.log('Courses data:', coursesRes.data)
      console.log('Courses error:', coursesRes.error)

      if (blogsRes.data) setFeaturedBlogs(blogsRes.data)
      if (coursesRes.data) setFeaturedCourses(coursesRes.data)
      
      if (coursesRes.error) {
        console.error('Error fetching courses:', coursesRes.error)
      }
      if (blogsRes.error) {
        console.error('Error fetching blogs:', blogsRes.error)
      }
    } catch (error) {
      console.error('Error fetching featured content:', error)
    } finally {
      setLoading(false)
    }
  }

  // Blog card with auto-generated cover support
  const BlogCard = ({ blog }) => {
    const [generatedCover, setGeneratedCover] = useState(null)
    const [coverLoading, setCoverLoading] = useState(!blog.image_url && !blog.cover_image_url)

    useEffect(() => {
      if (!blog.image_url && !blog.cover_image_url) {
        generateCoverForBlog(blog.title, blog.category)
          .then(dataUrl => {
            setGeneratedCover(dataUrl)
            setCoverLoading(false)
          })
          .catch(() => setCoverLoading(false))
      }
    }, [blog.title, blog.category, blog.image_url, blog.cover_image_url])

    const coverImage = blog.image_url || blog.cover_image_url || generatedCover

    return (
      <MotionBox
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -8, transition: { duration: 0.2 } }}
        bg={cardBg}
        borderRadius="2xl"
        boxShadow="lg"
        overflow="hidden"
        cursor="pointer"
        onClick={() => navigate(`/blogs/${blog.category?.toLowerCase().replace(/\s+/g, '-') || 'uncategorized'}/${blog.slug}`)}
        h="full"
        display="flex"
        flexDirection="column"
        role="group"
      >
        <Box 
          position="relative" 
          paddingBottom="56.25%"
          bg={useColorModeValue('gray.100', 'gray.800')}
          overflow="hidden"
        >
          {coverLoading ? (
            <Skeleton position="absolute" top={0} left={0} width="100%" height="100%" />
          ) : (
            <Image
              src={coverImage}
              alt={blog.title}
              position="absolute"
              top={0}
              left={0}
              width="100%"
              height="100%"
              objectFit="cover"
              transition="transform 0.4s ease"
              _groupHover={{ transform: 'scale(1.05)' }}
              loading={blog === featuredBlogs[0] ? "eager" : "lazy"}
              fetchpriority={blog === featuredBlogs[0] ? "high" : "auto"}
            />
          )}
          <Box 
            position="absolute" 
            top={0} 
            left={0} 
            right={0} 
            bottom={0} 
            bg="blackAlpha.200" 
            opacity={0} 
            _groupHover={{ opacity: 1 }} 
            transition="opacity 0.2s" 
          />
        </Box>
        <Stack p={6} spacing={3} flex="1">
          <Badge alignSelf="start" colorScheme="purple" variant="subtle" borderRadius="full" px={3} textTransform="none">
            {blog.category || 'Article'}
          </Badge>
          <Heading size="md" lineHeight="tall" noOfLines={2} _groupHover={{ color: 'blue.500' }}>
            {blog.title}
          </Heading>
          <Text fontSize="sm" color={mutedColor} noOfLines={3} flex="1">
            {blog.excerpt}
          </Text>
          <HStack pt={2} justify="space-between" color={mutedColor} fontSize="sm">
             <Text>{new Date(blog.created_at).toLocaleDateString()}</Text>
             <Text color="blue.700" fontWeight="bold" display="flex" alignItems="center">
               Read more <Icon as={FaArrowRight} ml={1} w={3} h={3}/>
             </Text>
          </HStack>
        </Stack>
      </MotionBox>
    )
  }

  const CourseCard = ({ course }) => (
    <MotionBox
      whileHover={{ y: -5, boxShadow: 'xl' }}
      p={6}
      bg={cardBg}
      borderRadius="2xl"
      boxShadow="md"
      borderTop="4px solid"
      borderColor={useColorModeValue('blue.400', 'blue.200')}
      position="relative"
    >
      <Flex justify="space-between" align="start" mb={4}>
        <Box
          p={3}
          bg="blue.50"
          borderRadius="xl"
          color="blue.500"
          _dark={{ bg: 'blue.900', color: 'blue.200' }}
        >
          <Icon as={FaGraduationCap} boxSize={6} />
        </Box>
        {course.category && (
          <Badge colorScheme="blue" borderRadius="full" px={2}>
            {course.category}
          </Badge>
        )}
      </Flex>
      <Heading size="md" mb={2} noOfLines={2}>
        {course.title}
      </Heading>
      <Text fontSize="sm" color={mutedColor} mb={4}>
        by {course.provider}
      </Text>
      <Button
        size="md"
        bg="blue.600"
        color="white"
        variant="solid"
        width="full"
        rightIcon={<FaArrowRight />}
        onClick={() => window.open(course.link, '_blank')}
        _hover={{ bg: 'blue.700' }}
        aria-label={`Start learning ${course.title}`}
      >
        Start Learning
      </Button>
    </MotionBox>
  )

  return (
    <Box overflowX="hidden">
      {/* Hero Section */}
      <Box 
        bg={heroBg} 
        position="relative" 
        pt={{ base: 20, md: 32 }} 
        pb={{ base: 24, md: 40 }}
      >
        <Container maxW="container.xl" position="relative" zIndex={1}>
          <MotionBox
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            textAlign="center"
            maxW="4xl"
            mx="auto"
          >
            <Badge 
              bg="blue.600"
              color="white"
              variant="solid" 
              px={4} 
              py={1.5} 
              borderRadius="full" 
              fontSize="sm" 
              mb={6}
              boxShadow="lg"
            >
              🚀 LAUNCH YOUR CAREER TODAY
            </Badge>
            <Heading
              as="h1"
              size={{ base: '2xl', md: '3xl', lg: '4xl' }}
              fontWeight="extrabold"
              lineHeight="1.2"
              mb={6}
              letterSpacing="tight"
            >
              Unlock Your Potential with <br />
              <Text as="span" bgGradient={heroGradientText} bgClip="text">
                Premium Free Resources
              </Text>
            </Heading>
            <Text 
              fontSize={{ base: 'lg', md: 'xl' }} 
              color={mutedColor} 
              maxW="2xl" 
              mx="auto" 
              mb={10}
              lineHeight="tall"
            >
              Discover curated courses and insightful blogs to boost your career. No paywalls, just growth.
            </Text>
            <Stack 
              direction={{ base: 'column', sm: 'row' }} 
              spacing={4} 
              justify="center"
            >
              <Button
                size="lg"
                bg="blue.600"
                color="white"
                px={8}
                height="3.5rem"
                fontSize="md"
                rightIcon={<FaArrowRight />}
                onClick={() => navigate('/free-courses')}
                _hover={{ bg: 'blue.700', transform: 'translateY(-2px)', boxShadow: 'lg' }}
                aria-label="Browse free courses"
              >
                Start Learning
              </Button>
              <Button
                size="lg"
                variant="outline"
                borderColor="blue.600"
                borderWidth="2px"
                color="blue.700"
                px={8}
                height="3.5rem"
                fontSize="md"
                leftIcon={<FaNewspaper />}
                onClick={() => navigate('/blogs')}
                bg={cardBg}
                _hover={{ bg: 'blue.50', transform: 'translateY(-2px)', boxShadow: 'md' }}
                aria-label="Read blog articles"
              >
                Read Articles
              </Button>
            </Stack>
          </MotionBox>
        </Container>
      </Box>

      <Container maxW="container.xl" py={12} position="relative" zIndex={2}>
        {/* Featured Blogs Section */}
        <Box mb={24}>
          <Flex 
            justify="space-between" 
            align={{ base: 'flex-start', md: 'center' }} 
            mb={10}
            direction={{ base: 'column', md: 'row' }}
            gap={{ base: 4, md: 0 }}
          >
             <Box>
                <Heading size="lg" mb={2}>Latest Insights</Heading>
                <Text color={mutedColor}>Read our latest articles and guides</Text>
             </Box>
             <Button
              variant="link"
              color="blue.700"
              fontWeight="600"
              rightIcon={<FaArrowRight />}
              onClick={() => navigate('/blogs')}
              fontSize={{ base: 'sm', md: 'md' }}
              flexShrink={0}
              _hover={{ color: 'blue.800' }}
              aria-label="View all blog articles"
            >
              View All Articles
            </Button>
          </Flex>

          {loading ? (
             <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
              {[1, 2, 3].map((i) => (
                <Box key={i} p={4} bg={cardBg} borderRadius="xl" boxShadow="sm">
                  <Skeleton height="200px" borderRadius="lg" mb={4} />
                  <SkeletonText noOfLines={3} />
                </Box>
              ))}
            </SimpleGrid>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={10}>
              {featuredBlogs.map((blog) => (
                <BlogCard key={blog.id} blog={blog} />
              ))}
            </SimpleGrid>
          )}
        </Box>

        {/* Newsletter Section */}
        <Box mb={24}>
          <MotionBox
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            bg="linear-gradient(135deg, rgba(66, 153, 225, 0.1) 0%, rgba(128, 90, 213, 0.1) 100%)"
            borderRadius="2xl"
            p={{ base: 8, md: 12 }}
            textAlign="center"
            position="relative"
            overflow="hidden"
            border="1px solid"
            borderColor={borderColor}
            boxShadow="lg"
          >
            {/* Decorative elements */}
            <Box
              position="absolute"
              top="-50px"
              right="-50px"
              width="150px"
              height="150px"
              bg="blue.200"
              borderRadius="full"
              filter="blur(60px)"
              opacity={0.3}
            />
            <Box
              position="absolute"
              bottom="-50px"
              left="-50px"
              width="150px"
              height="150px"
              bg="purple.200"
              borderRadius="full"
              filter="blur(60px)"
              opacity={0.3}
            />
            
            <VStack spacing={6} position="relative" zIndex={1} mb={8}>
              <Badge colorScheme="blue" fontSize="sm" px={4} py={1} borderRadius="full">
                📬 Stay Updated
              </Badge>
              <Heading size="xl" maxW="2xl" mx="auto">
                Get Career Tips & Resources Delivered
              </Heading>
              <Text fontSize="lg" color={mutedColor} maxW="xl" mx="auto">
                Join thousands of professionals receiving weekly insights and free courses directly to their inbox.
              </Text>
            </VStack>

            {/* Newsletter Embed */}
            <Box
              maxW="600px"
              mx="auto"
              position="relative"
              zIndex={1}
            >
              <Box
                as="iframe"
                title="Newsletter signup form"
                src="https://embeds.beehiiv.com/e879c9bf-696b-4582-9c45-9b926a704ba9?slim=true"
                data-test-id="beehiiv-embed"
                height="70"
                frameBorder="0"
                scrolling="no"
                style={{
                  margin: 0,
                  borderRadius: '8px',
                  backgroundColor: 'transparent',
                  width: '100%',
                }}
              />
            </Box>
          </MotionBox>
        </Box>
      </Container>
    </Box>
  )
}

export default Home 