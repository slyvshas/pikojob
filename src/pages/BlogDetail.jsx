import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import {
  Box,
  Heading,
  Text,
  Image,
  VStack,
  HStack,
  Badge,
  Divider,
  Spinner,
  Container,
  useColorModeValue,
  Center,
  Button,
  Flex,
  IconButton,
  useToast,
} from '@chakra-ui/react';
import { FaArrowLeft, FaCalendarAlt, FaUser, FaTag, FaBookmark, FaRegBookmark } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const BlogDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savedBlogs, setSavedBlogs] = useState(new Set());
  const { user } = useAuth();
  const toast = useToast();

  // Theme colors
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');
  const mutedColor = useColorModeValue('gray.600', 'gray.400');
  const blockquoteBg = useColorModeValue('blue.50', 'blue.900');
  const codeBg = useColorModeValue('gray.100', 'gray.700');
  const tableHeaderBg = useColorModeValue('gray.50', 'gray.700');

  useEffect(() => {
    const fetchBlog = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .single();
      if (error) setError(error.message);
      else setBlog(data);
      setLoading(false);
    };
    fetchBlog();

    if (user) {
      fetchSavedBlogs();
    }
  }, [slug, user]);

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
            <VStack spacing={6}>
              <Text color="red.500" fontSize="lg">{error}</Text>
              <Button onClick={() => navigate('/blogs')} colorScheme="blue">
                Back to Blogs
              </Button>
            </VStack>
          </Center>
        </Container>
      </Box>
    );
  }

  if (!blog) {
    return (
      <Box bg={bgColor} minH="100vh" py={12}>
        <Container maxW="container.xl">
          <Center py={20}>
            <VStack spacing={6}>
              <Text fontSize="xl" color={mutedColor}>Blog not found.</Text>
              <Button onClick={() => navigate('/blogs')} colorScheme="blue">
                Back to Blogs
              </Button>
            </VStack>
          </Center>
        </Container>
      </Box>
    );
  }

  return (
    <Box bg={bgColor} minH="100vh" py={12}>
      <Container maxW="container.xl" px={0}>
        <VStack spacing={8} align="stretch">
          {/* Header with Back Button */}
          <Flex justify="space-between" align="center" px={8}>
            <Button
              leftIcon={<FaArrowLeft />}
              variant="ghost"
              onClick={() => navigate('/blogs')}
              color={mutedColor}
              _hover={{ color: textColor, bg: cardBg }}
            >
              Back
            </Button>
            <IconButton
              aria-label={savedBlogs.has(blog.slug) ? 'Unsave blog' : 'Save blog'}
              icon={savedBlogs.has(blog.slug) ? <FaBookmark /> : <FaRegBookmark />}
              color={savedBlogs.has(blog.slug) ? 'blue.500' : mutedColor}
              variant="ghost"
              onClick={() => handleSaveBlog(blog.slug)}
              _hover={{ bg: 'blue.50' }}
            />
          </Flex>

          {/* Blog Content */}
          <Box bg={cardBg} borderRadius="2xl" overflow="hidden" border="1px solid" borderColor={borderColor}>
            {/* Cover Image */}
            {blog.cover_image_url && (
              <Box position="relative">
                <Image 
                  src={blog.cover_image_url} 
                  alt={blog.title} 
                  w="100%"
                  h="400px"
                  objectFit="cover"
                />
                <Box
                  position="absolute"
                  top={0}
                  left={0}
                  right={0}
                  bottom={0}
                  bg="linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.4) 100%)"
                />
              </Box>
            )}

            {/* Content */}
            <Box p={0}>
              {/* Title */}
              <Box px={12} pt={8}>
                <Heading 
                  size="2xl" 
                  mb={4} 
                  color={textColor}
                  fontFamily="'Poppins', sans-serif"
                  fontWeight="900"
                  lineHeight="1.2"
                  letterSpacing="tight"
                >
                  {blog.title}
                </Heading>

                {/* Excerpt */}
                <Text 
                  fontSize="xl" 
                  color={mutedColor} 
                  mb={6}
                  lineHeight="1.6"
                  fontFamily="'Poppins', sans-serif"
                  fontWeight="400"
                >
                  {blog.excerpt}
                </Text>

                {/* Meta Information */}
                <VStack align="start" spacing={4} mb={8}>
                  <HStack spacing={6} color={mutedColor} fontSize="md">
                    <HStack spacing={2}>
                      <FaUser size={14} />
                      <Text fontWeight="500">
                        {blog.author_name || 'Unknown Author'}
                      </Text>
                    </HStack>
                    <HStack spacing={2}>
                      <FaCalendarAlt size={14} />
                      <Text>
                        {formatDate(blog.published_at)}
                      </Text>
                    </HStack>
                  </HStack>

                  {/* Tags */}
                  {blog.tags && blog.tags.length > 0 && (
                    <Flex wrap="wrap" gap={3}>
                      {blog.tags.map((tag, idx) => (
                        <Badge 
                          key={idx} 
                          colorScheme="blue" 
                          variant="subtle"
                          fontSize="sm"
                          px={4}
                          py={2}
                          borderRadius="full"
                          fontWeight="500"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </Flex>
                  )}
                </VStack>

                <Divider my={8} borderColor={borderColor} />
              </Box>

              {/* Blog Content */}
              <Box 
                className="tiptap-content" 
                fontSize="lg" 
                color={textColor}
                lineHeight="1.8"
                fontFamily="'Poppins', sans-serif"
                fontWeight="400"
                px={12}
                pb={12}
                sx={{
                  'h1, h2, h3, h4, h5, h6': {
                    fontFamily: "'Poppins', sans-serif",
                    fontWeight: '700',
                    color: textColor,
                    mt: '2rem',
                    mb: '1rem',
                    lineHeight: '1.3',
                  },
                  'h1': { fontSize: '2.5rem' },
                  'h2': { fontSize: '2rem' },
                  'h3': { fontSize: '1.75rem' },
                  'h4': { fontSize: '1.5rem' },
                  'h5': { fontSize: '1.25rem' },
                  'h6': { fontSize: '1.125rem' },
                  'p': {
                    mb: '1.5rem',
                    fontSize: '1.125rem',
                    lineHeight: '1.8',
                    fontFamily: "'Poppins', sans-serif",
                  },
                  'ul, ol': {
                    mb: '1.5rem',
                    pl: '2rem',
                  },
                  'li': {
                    mb: '0.5rem',
                    fontSize: '1.125rem',
                    lineHeight: '1.8',
                    fontFamily: "'Poppins', sans-serif",
                  },
                  'blockquote': {
                    borderLeft: '4px solid',
                    borderColor: 'blue.500',
                    pl: '2rem',
                    py: '1rem',
                    my: '2rem',
                    bg: blockquoteBg,
                    borderRadius: 'md',
                    fontStyle: 'italic',
                    fontSize: '1.125rem',
                    fontFamily: "'Poppins', sans-serif",
                  },
                  'code': {
                    bg: codeBg,
                    px: '0.5rem',
                    py: '0.25rem',
                    borderRadius: 'md',
                    fontSize: '0.875rem',
                    fontFamily: "'Poppins', sans-serif",
                  },
                  'pre': {
                    bg: codeBg,
                    p: '1.5rem',
                    borderRadius: 'lg',
                    overflow: 'auto',
                    fontSize: '0.875rem',
                    fontFamily: "'Poppins', sans-serif",
                    my: '2rem',
                  },
                  'a': {
                    color: 'blue.500',
                    textDecoration: 'underline',
                    _hover: {
                      color: 'blue.600',
                    },
                  },
                  'img': {
                    borderRadius: 'lg',
                    my: '2rem',
                    maxW: '100%',
                    h: 'auto',
                  },
                  'table': {
                    width: '100%',
                    borderCollapse: 'collapse',
                    my: '2rem',
                  },
                  'th, td': {
                    border: '1px solid',
                    borderColor: borderColor,
                    p: '0.75rem',
                    textAlign: 'left',
                    fontFamily: "'Poppins', sans-serif",
                  },
                  'th': {
                    bg: tableHeaderBg,
                    fontWeight: '600',
                  },
                }}
                dangerouslySetInnerHTML={{ __html: blog.content }} 
              />
            </Box>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
};

export default BlogDetail; 