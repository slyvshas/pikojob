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
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';

const Blogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
  }, []);

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
            <Link
              as={RouterLink}
              to={`/blogs/${blog.slug}`}
              _hover={{ textDecoration: 'none' }}
              key={blog.id}
              display="block"
            >
              <Box borderWidth="1px" borderRadius="lg" p={4} bg="white" boxShadow="md" transition="box-shadow 0.2s" _hover={{ boxShadow: 'xl' }}>
                {blog.cover_image_url && (
                  <Image src={blog.cover_image_url} alt={blog.title} borderRadius="md" mb={3} maxH="180px" objectFit="cover" w="100%" />
                )}
                <Heading size="md" mb={2}>{blog.title}</Heading>
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
          ))}
        </SimpleGrid>
      )}
    </Box>
  );
};

export default Blogs; 