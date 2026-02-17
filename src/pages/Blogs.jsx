import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Image,
  VStack,
  HStack,
  Badge,
  Divider,
  Link,
  IconButton,
  useToast,
  Container,
  useColorModeValue,
  Center,
  Spinner,
  Flex,
  Skeleton,
  Button,
  Input,
  InputGroup,
  InputLeftElement,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { FaCalendarAlt, FaUser, FaChevronDown, FaSearch } from 'react-icons/fa';
import { generateCoverForBlog } from '../utils/generateBlogCover';
import { generateWebSiteSchema, generateBreadcrumbSchema, injectMultipleSchemas, removeStructuredData } from '../utils/structuredData';
import DisplayAd from '../components/DisplayAd';

// BlogCard component with auto-generated cover support
const BlogCard = ({ blog, cardBg, borderColor, textColor, mutedColor, formatDate }) => {
  const [generatedCover, setGeneratedCover] = useState(null);
  const [coverLoading, setCoverLoading] = useState(!blog.cover_image_url);
  
  // Compute category slug once to avoid re-renders
  const categorySlug = (blog.category?.toLowerCase().replace(/\s+/g, '-') || 'uncategorized');

  useEffect(() => {
    if (!blog.cover_image_url) {
      generateCoverForBlog(blog.title, blog.category)
        .then(dataUrl => {
          setGeneratedCover(dataUrl);
          setCoverLoading(false);
        })
        .catch((err) => {
          console.error('Error generating cover:', err);
          setCoverLoading(false);
        });
    }
  }, [blog.title, blog.category, blog.cover_image_url]);

  const coverImage = blog.cover_image_url || generatedCover;

  return (
    <Box position="relative" h="full">
      <Link
        as={RouterLink}
        to={`/blogs/${categorySlug}/${blog.slug}`}
        _hover={{ textDecoration: 'none' }}
        display="block"
        h="full"
      >
        <Box 
          bg={cardBg}
          borderRadius={{ base: 'xl', md: '2xl' }}
          overflow="hidden"
          border="1px solid"
          borderColor={borderColor}
          transition="all 0.3s ease-in-out"
          _hover={{ 
            transform: { base: 'none', md: 'translateY(-4px)' },
            boxShadow: { base: 'md', md: '0 20px 40px rgba(0, 0, 0, 0.1)' },
            borderColor: 'blue.300'
          }}
          h="full"
          display="flex"
          flexDirection="column"
        >
          {/* Cover Image - Original or Auto-Generated */}
          <Box 
            position="relative" 
            overflow="hidden"
            // Fixed aspect ratio for consistent card heights
            paddingBottom={{ base: '50%', md: '52.5%' }}
            bg={coverLoading ? "gray.200" : "gray.100"}
            flexShrink={0}
          >
            {coverLoading ? (
              <Skeleton 
                position="absolute"
                top={0}
                left={0}
                width="100%"
                height="100%"
                startColor="gray.100"
                endColor="gray.300"
                speed={0.8}
              />
            ) : coverImage ? (
              <>
                <Image 
                  src={coverImage}
                  alt={blog.title}
                  position="absolute"
                  top={0}
                  left={0}
                  width="100%"
                  height="100%"
                  objectFit="cover"
                  loading="lazy"
                  transition="transform 0.3s ease-in-out"
                  _groupHover={{ transform: 'scale(1.05)' }}
                />
                <Box
                  position="absolute"
                  top={0}
                  left={0}
                  right={0}
                  bottom={0}
                  bg="linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.2) 100%)"
                />
              </>
            ) : null}
          </Box>

          {/* Content */}
          <Box 
            p={{ base: 3, sm: 4, md: 5 }} 
            flex="1" 
            display="flex" 
            flexDirection="column"
          >
            {/* Title */}
            <Heading 
              fontSize={{ base: 'sm', sm: 'md', md: 'lg' }}
              mb={{ base: 1.5, md: 2 }}
              color={textColor}
              fontFamily="'Poppins', sans-serif"
              fontWeight="600"
              lineHeight="1.3"
              noOfLines={2}
            >
              {blog.title}
            </Heading>

            {/* Excerpt - hidden on very small screens */}
            <Text 
              fontSize={{ base: 'xs', sm: 'sm', md: 'sm' }}
              color={mutedColor} 
              mb={{ base: 2, md: 3 }}
              lineHeight="1.5"
              noOfLines={{ base: 2, md: 3 }}
              flex="1"
              fontFamily="'Poppins', sans-serif"
              display={{ base: 'none', sm: '-webkit-box' }}
            >
              {blog.excerpt}
            </Text>

            {/* Meta Information */}
            <HStack 
              spacing={{ base: 2, md: 3 }} 
              color={mutedColor} 
              fontSize={{ base: '2xs', sm: 'xs', md: 'sm' }}
              flexWrap="wrap"
              mt="auto"
            >
              <HStack spacing={1}>
                <FaUser size={10} />
                <Text fontWeight="500" noOfLines={1}>
                  {blog.author_name || 'Author'}
                </Text>
              </HStack>
              <HStack spacing={1} display={{ base: 'none', sm: 'flex' }}>
                <FaCalendarAlt size={10} />
                <Text noOfLines={1}>
                  {formatDate(blog.published_at)}
                </Text>
              </HStack>
              {blog.category && (
                <Badge 
                  colorScheme="blue" 
                  fontSize={{ base: '2xs', md: 'xs' }}
                  px={2}
                  py={0.5}
                  borderRadius="full"
                  display={{ base: 'none', md: 'inline-flex' }}
                >
                  {blog.category}
                </Badge>
              )}
            </HStack>
          </Box>
        </Box>
      </Link>
    </Box>
  );
};

const BLOGS_PER_PAGE = 6;

const Blogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const toast = useToast();

  // Theme colors - ALL hooks must be at top level
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');
  const mutedColor = useColorModeValue('gray.600', 'gray.400');
  const inputBg = useColorModeValue('white', 'gray.700');

  const fetchBlogs = async (pageNum = 0, append = false, category = 'All', search = '') => {
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    const from = pageNum * BLOGS_PER_PAGE;
    const to = from + BLOGS_PER_PAGE - 1;

    let query = supabase
      .from('blog_posts')
      .select('id, slug, title, excerpt, cover_image_url, category, created_at, published_at, author_name', { count: 'exact' })
      .order('published_at', { ascending: false });

    // Apply category filter
    if (category !== 'All') {
      query = query.eq('category', category);
    }

    // Apply search filter
    if (search) {
      query = query.or(`title.ilike.%${search}%,excerpt.ilike.%${search}%`);
    }

    const { data, error, count } = await query.range(from, to);

    if (error) {
      setError(error.message);
    } else {
      if (append) {
        setBlogs(prev => [...prev, ...data]);
      } else {
        setBlogs(data);
      }
      // Check if there are more blogs to load
      setHasMore(from + data.length < count);
    }

    setLoading(false);
    setLoadingMore(false);
  };

  // Fetch unique categories (optimized with distinct)
  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('category')
      .not('category', 'is', null)
      .order('category')
      .limit(100); // Limit fetch for better performance

    if (!error && data) {
      // Get unique categories and limit to 5
      const uniqueCategories = [...new Set(data.map(item => item.category))].slice(0, 5);
      setCategories(uniqueCategories);
    }
  };

  useEffect(() => {
    fetchBlogs(0, false, selectedCategory, searchQuery);
    fetchCategories();

    // Inject structured data for blogs page
    const websiteSchema = generateWebSiteSchema();
    const breadcrumbSchema = generateBreadcrumbSchema([
      { name: 'Home', url: 'https://growlytic.app' },
      { name: 'Blogs', url: 'https://growlytic.app/blogs' }
    ]);
    injectMultipleSchemas([websiteSchema, breadcrumbSchema]);

    // Cleanup on unmount
    return () => {
      removeStructuredData();
    };
  }, [selectedCategory, searchQuery]);

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setPage(0);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setPage(0);
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchBlogs(nextPage, true, selectedCategory, searchQuery);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Box bg={bgColor} minH="100vh" py={12}>
        <Container maxW="container.xl">
          <Center py={20}>
            <VStack spacing={6}>
              <Spinner size="xl" thickness="4px" color="blue.500" />
              <Text fontSize="lg" color={mutedColor} fontWeight="medium">
                Loading...
              </Text>
            </VStack>
          </Center>
        </Container>
      </Box>
    );
  }

  if (error) {
    return (
      <Box bg={bgColor} minH="100vh" py={12}>
        <Container maxW="container.xl">
          <Center py={20}>
            <Text color="red.500" fontSize="lg">{error}</Text>
          </Center>
        </Container>
      </Box>
    );
  }

  return (
    <Box bg={bgColor} minH="100vh" py={12}>
      <Container maxW="container.xl">
        <VStack spacing={12} align="stretch">
          {/* Header - Hidden on mobile */}
          <Box textAlign="center" mb={8} display={{ base: 'none', md: 'block' }}>
            <Heading 
              size="3xl" 
              mb={4} 
              color={textColor} 
              fontWeight="900"
              fontFamily="'Poppins', sans-serif"
              letterSpacing="tight"
            >
             Tech Articles & Industry Guides
            </Heading>
            <Text 
              fontSize="xl" 
              color={mutedColor}
              fontFamily="'Poppins', sans-serif"
              fontWeight="400"
              maxW="600px"
              mx="auto"
            >
Skills and professional development coverage to advance your career.
</Text>
          </Box>

          {/* Category Filter Bar */}
          <Box 
            bg={cardBg}
            borderRadius="xl"
            p={{ base: 3, md: 4 }}
            border="1px solid"
            borderColor={borderColor}
            boxShadow="sm"
          >
            <Flex 
              direction={{ base: 'column', md: 'row' }}
              gap={{ base: 3, md: 4 }}
              align={{ base: 'stretch', md: 'center' }}
            >
              {/* Category Buttons */}
              <HStack 
                spacing={{ base: 2, md: 3 }} 
                overflowX="auto"
                flex="1"
                css={{
                  '&::-webkit-scrollbar': {
                    height: '4px',
                  },
                  '&::-webkit-scrollbar-track': {
                    background: 'transparent',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    background: '#CBD5E0',
                    borderRadius: '4px',
                  },
                }}
              >
                <Button
                  size={{ base: 'sm', md: 'md' }}
                  variant={selectedCategory === 'All' ? 'solid' : 'ghost'}
                  colorScheme={selectedCategory === 'All' ? 'blue' : 'gray'}
                  onClick={() => handleCategoryChange('All')}
                  borderRadius="lg"
                  fontWeight="600"
                  flexShrink={0}
                  px={{ base: 4, md: 6 }}
                  position="relative"
                  _hover={{
                    bg: selectedCategory === 'All' ? 'blue.600' : 'gray.100',
                    boxShadow: selectedCategory === 'All' ? 'md' : 'sm',
                  }}
                  _dark={{
                    _hover: {
                      bg: selectedCategory === 'All' ? 'blue.600' : 'whiteAlpha.200',
                    }
                  }}
                  transition="all 0.2s ease-in-out"
                >
                  All
                </Button>
                {categories.map((category) => (
                  <Button
                    key={category}
                    size={{ base: 'sm', md: 'md' }}
                    variant={selectedCategory === category ? 'solid' : 'ghost'}
                    colorScheme={selectedCategory === category ? 'blue' : 'gray'}
                    onClick={() => handleCategoryChange(category)}
                    borderRadius="lg"
                    fontWeight="600"
                    flexShrink={0}
                    px={{ base: 4, md: 6 }}
                    position="relative"
                    _hover={{
                      bg: selectedCategory === category ? 'blue.600' : 'gray.100',
                      boxShadow: selectedCategory === category ? 'md' : 'sm',
                    }}
                    _dark={{
                      _hover: {
                        bg: selectedCategory === category ? 'blue.600' : 'whiteAlpha.200',
                      }
                    }}
                    transition="all 0.2s ease-in-out"
                  >
                    {category}
                  </Button>
                ))}
              </HStack>

              {/* Search Input */}
              <InputGroup 
                size={{ base: 'sm', md: 'md' }} 
                maxW={{ base: '100%', md: '300px' }}
                flexShrink={0}
              >
                <InputLeftElement pointerEvents="none">
                  <FaSearch color="gray.400" />
                </InputLeftElement>
                <Input
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  borderRadius="lg"
                  bg={inputBg}
                  _focus={{
                    borderColor: 'blue.400',
                    boxShadow: '0 0 0 1px #3182ce',
                  }}
                />
              </InputGroup>
            </Flex>
          </Box>

          {loading ? (
            <SimpleGrid 
              columns={{ base: 1, sm: 2, md: 2, lg: 3 }} 
              spacing={{ base: 6, md: 8 }}
            >
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Box
                  key={i}
                  bg={cardBg}
                  borderRadius={{ base: 'xl', md: '2xl' }}
                  overflow="hidden"
                  border="1px solid"
                  borderColor={borderColor}
                >
                  <Skeleton height={{ base: '200px', md: '250px' }} />
                  <Box p={{ base: 5, md: 6 }}>
                    <HStack spacing={3} mb={3}>
                      <Skeleton height="20px" width="60px" borderRadius="full" />
                      <Skeleton height="20px" width="80px" borderRadius="full" />
                    </HStack>
                    <SkeletonText mt={2} noOfLines={2} spacing={3} skeletonHeight={5} mb={3} />
                    <SkeletonText noOfLines={3} spacing={3} skeletonHeight={3} mb={4} />
                    <Skeleton height="16px" width="120px" />
                  </Box>
                </Box>
              ))}
            </SimpleGrid>
          ) : blogs.length === 0 ? (
            <Center py={20}>
              <VStack spacing={4}>
                <Text fontSize="xl" color={mutedColor} fontWeight="medium">
                  No stories available yet.
                </Text>
                <Text color={mutedColor}>
                  Check back soon for amazing content!
                </Text>
              </VStack>
            </Center>
          ) : (
            <>
              {/* Blogs with interleaved ads */}
              {(() => {
                const items = [];
                const adsAfterItems = [6, 15]; // Show ad after 6th and 15th item
                let blogIndex = 0;
                let currentBatch = [];
                
                blogs.forEach((blog, idx) => {
                  currentBatch.push(
                    <BlogCard
                      key={blog.id}
                      blog={blog}
                      cardBg={cardBg}
                      borderColor={borderColor}
                      textColor={textColor}
                      mutedColor={mutedColor}
                      formatDate={formatDate}
                    />
                  );
                  blogIndex++;
                  
                  if (adsAfterItems.includes(blogIndex) || idx === blogs.length - 1) {
                    items.push(
                      <SimpleGrid 
                        key={`grid-${blogIndex}`}
                        columns={{ base: 1, sm: 2, md: 2, lg: 3 }} 
                        spacing={{ base: 4, sm: 4, md: 6, lg: 8 }}
                      >
                        {currentBatch}
                      </SimpleGrid>
                    );
                    if (adsAfterItems.includes(blogIndex) && idx !== blogs.length - 1) {
                      items.push(<DisplayAd key={`ad-${blogIndex}`} />);
                    }
                    currentBatch = [];
                  }
                });
                
                return items;
              })()}

              {/* Load More Button */}
              {hasMore && (
                <Center mt={10}>
                  <Button
                    onClick={loadMore}
                    isLoading={loadingMore}
                    loadingText="Loading..."
                    size="lg"
                    colorScheme="blue"
                    variant="outline"
                    borderRadius="full"
                    px={8}
                    rightIcon={<FaChevronDown />}
                    _hover={{
                      transform: 'translateY(-2px)',
                      boxShadow: 'lg',
                      bg: 'blue.50',
                    }}
                    transition="all 0.2s"
                  >
                    Load More Articles
                  </Button>
                </Center>
              )}

              {/* Display Ad - After Blog Grid */}
              <DisplayAd />
            </>
          )}
        </VStack>
      </Container>
    </Box>
  );
};

export default Blogs; 