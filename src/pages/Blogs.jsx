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
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { FaBookmark, FaRegBookmark, FaCalendarAlt, FaUser, FaTag } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const Blogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [savedBlogs, setSavedBlogs] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const toast = useToast();

  // Theme colors
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');
  const mutedColor = useColorModeValue('gray.600', 'gray.400');

  useEffect(() => {
    const fetchBlogs = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('published_at', { ascending: false });
      if (error) setError(error.message);
      else setBlogs(data);
      setLoading(false);
    };
    fetchBlogs();
    
    if (user) {
      fetchSavedBlogs();
    }
  }, [user]);

  const fetchSavedBlogs = async () => {
    try {
      const { data, error } = await supabase
        .from('saved_blogs')
        .select('blog_slug')
        .eq('user_id', user.id);

      if (error) throw error;

      const savedBlogSlugs = new Set(data.map(item => item.blog_slug));
      setSavedBlogs(savedBlogSlugs);
    } catch (error) {
      console.error('Error fetching saved blogs:', error);
    }
  };

  const handleSaveBlog = async (blogSlug) => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to save blogs',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      if (savedBlogs.has(blogSlug)) {
        // Unsave blog
        const { error } = await supabase
          .from('saved_blogs')
          .delete()
          .eq('user_id', user.id)
          .eq('blog_slug', blogSlug);

        if (error) throw error;

        setSavedBlogs(prev => {
          const newSet = new Set(prev);
          newSet.delete(blogSlug);
          return newSet;
        });

        toast({
          title: 'Blog Unsaved',
          description: 'Blog has been removed from your saved items',
          status: 'info',
          duration: 3000,
          isClosable: true,
        });
      } else {
        // Save blog
        const { error } = await supabase
          .from('saved_blogs')
          .insert({
            user_id: user.id,
            blog_slug: blogSlug,
          });

        if (error) throw error;

        setSavedBlogs(prev => new Set([...prev, blogSlug]));

        toast({
          title: 'Blog Saved',
          description: 'Blog has been added to your saved items',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error saving/unsaving blog:', error);
      toast({
        title: 'Error',
        description: 'Failed to save/unsave blog',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
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
          {/* Header */}
          <Box textAlign="center" mb={8}>
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

          {blogs.length === 0 ? (
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
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
              {blogs.map((blog) => (
                <Box key={blog.id} position="relative">
                  <Link
                    as={RouterLink}
                    to={`/blogs/${blog.slug}`}
                    _hover={{ textDecoration: 'none' }}
                    display="block"
                  >
                    <Box 
                      bg={cardBg}
                      borderRadius="2xl" 
                      overflow="hidden"
                      border="1px solid"
                      borderColor={borderColor}
                      transition="all 0.3s ease-in-out"
                      _hover={{ 
                        transform: 'translateY(-4px)',
                        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
                        borderColor: 'blue.300'
                      }}
                      h="full"
                      display="flex"
                      flexDirection="column"
                    >
                      {/* Cover Image */}
                      {blog.cover_image_url && (
                        <Box position="relative" overflow="hidden">
                          <Image 
                            src={blog.cover_image_url} 
                            alt={blog.title} 
                            w="100%"
                            h="200px"
                            objectFit="cover"
                            transition="transform 0.3s ease-in-out"
                            _groupHover={{ transform: 'scale(1.05)' }}
                          />
                          <Box
                            position="absolute"
                            top={0}
                            left={0}
                            right={0}
                            bottom={0}
                            bg="linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.3) 100%)"
                          />
                        </Box>
                      )}

                      {/* Content */}
                      <Box p={6} flex="1" display="flex" flexDirection="column">
                        {/* Title */}
                        <Heading 
                          size="lg" 
                          mb={3} 
                          color={textColor}
                          fontFamily="'Poppins', sans-serif"
                          fontWeight="700"
                          lineHeight="1.3"
                          noOfLines={2}
                        >
                          {blog.title}
                        </Heading>

                        {/* Excerpt */}
                        <Text 
                          fontSize="md" 
                          color={mutedColor} 
                          mb={4}
                          lineHeight="1.6"
                          noOfLines={3}
                          flex="1"
                          fontFamily="'Poppins', sans-serif"
                        >
                          {blog.excerpt}
                        </Text>

                        {/* Meta Information */}
                        <VStack align="start" spacing={3} mt="auto">
                          <HStack spacing={4} color={mutedColor} fontSize="sm">
                            <HStack spacing={1}>
                              <FaUser size={12} />
                              <Text fontWeight="500">
                                {blog.author_name || 'Unknown Author'}
                              </Text>
                            </HStack>
                            <HStack spacing={1}>
                              <FaCalendarAlt size={12} />
                              <Text>
                                {formatDate(blog.published_at)}
                              </Text>
                            </HStack>
                          </HStack>

                          {/* Tags */}
                          {blog.tags && blog.tags.length > 0 && (
                            <Flex wrap="wrap" gap={2}>
                              {blog.tags.slice(0, 3).map((tag, idx) => (
                                <Badge 
                                  key={idx} 
                                  colorScheme="blue" 
                                  variant="subtle"
                                  fontSize="xs"
                                  px={3}
                                  py={1}
                                  borderRadius="full"
                                  fontWeight="500"
                                >
                                  {tag}
                                </Badge>
                              ))}
                              {blog.tags.length > 3 && (
                                <Badge 
                                  colorScheme="gray" 
                                  variant="subtle"
                                  fontSize="xs"
                                  px={3}
                                  py={1}
                                  borderRadius="full"
                                >
                                  +{blog.tags.length - 3}
                                </Badge>
                              )}
                            </Flex>
                          )}
                        </VStack>
                      </Box>
                    </Box>
                  </Link>

                  {/* Save Button */}
                  <IconButton
                    aria-label={savedBlogs.has(blog.slug) ? 'Unsave blog' : 'Save blog'}
                    icon={savedBlogs.has(blog.slug) ? <FaBookmark /> : <FaRegBookmark />}
                    color={savedBlogs.has(blog.slug) ? 'blue.500' : mutedColor}
                    variant="ghost"
                    size="md"
                    position="absolute"
                    top={4}
                    right={4}
                    bg={cardBg}
                    borderRadius="full"
                    boxShadow="md"
                    _hover={{ 
                      bg: 'blue.50',
                      transform: 'scale(1.1)'
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleSaveBlog(blog.slug);
                    }}
                  />
                </Box>
              ))}
            </SimpleGrid>
          )}
        </VStack>
      </Container>
    </Box>
  );
};

export default Blogs; 