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
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { FaBookmark, FaRegBookmark } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const Blogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [savedBlogs, setSavedBlogs] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const toast = useToast();

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

  return (
    <Box maxW="900px" mx="auto" py={10} px={4}>
      <Heading mb={8} textAlign="center" color="blue.600">Blogs</Heading>
      {loading ? (
        <Text>Loading...</Text>
      ) : error ? (
        <Text color="red.500">{error}</Text>
      ) : blogs.length === 0 ? (
        <Text>No blogs available.</Text>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
          {blogs.map((blog) => (
            <Box key={blog.id} position="relative">
              <Link
                as={RouterLink}
                to={`/blogs/${blog.slug}`}
                _hover={{ textDecoration: 'none' }}
                display="block"
              >
                <Box borderWidth="1px" borderRadius="lg" p={4} bg="white" boxShadow="md" transition="box-shadow 0.2s" _hover={{ boxShadow: 'xl' }}>
                  {blog.cover_image_url && (
                    <Image src={blog.cover_image_url} alt={blog.title} borderRadius="md" mb={3} maxH="180px" objectFit="cover" w="100%" />
                  )}
                  <Heading size="md" mb={2} pr={8}>{blog.title}</Heading>
                  <Text fontSize="sm" color="gray.600" mb={2}>{blog.excerpt}</Text>
                  <Divider my={2} />
                  <HStack justifyContent="space-between">
                    <Text fontSize="xs" color="gray.500">By {blog.author_name || 'Unknown'}</Text>
                    <Text fontSize="xs" color="gray.500">{blog.published_at ? new Date(blog.published_at).toLocaleDateString() : ''}</Text>
                  </HStack>
                  {blog.tags && blog.tags.length > 0 && (
                    <HStack mt={2} spacing={2} flexWrap="wrap">
                      {blog.tags.map((tag, idx) => (
                        <Badge key={idx} colorScheme="blue">{tag}</Badge>
                      ))}
                    </HStack>
                  )}
                </Box>
              </Link>
              <IconButton
                aria-label={savedBlogs.has(blog.slug) ? 'Unsave blog' : 'Save blog'}
                icon={savedBlogs.has(blog.slug) ? <FaBookmark /> : <FaRegBookmark />}
                colorScheme={savedBlogs.has(blog.slug) ? 'green' : 'gray'}
                variant="ghost"
                size="sm"
                position="absolute"
                top={2}
                right={2}
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
    </Box>
  );
};

export default Blogs; 