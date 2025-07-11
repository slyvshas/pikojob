import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
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
} from '@chakra-ui/react';

const BlogDetail = () => {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
  }, [slug]);

  if (loading) return <Box py={20} textAlign="center"><Spinner size="xl" /></Box>;
  if (error) return <Box py={20} textAlign="center"><Text color="red.500">{error}</Text></Box>;
  if (!blog) return <Box py={20} textAlign="center"><Text>Blog not found.</Text></Box>;

  return (
    <Box maxW="800px" mx="auto" py={10} px={4}>
      {blog.cover_image_url && (
        <Image src={blog.cover_image_url} alt={blog.title} borderRadius="md" mb={6} maxH="350px" objectFit="cover" w="100%" />
      )}
      <Heading mb={2} color="blue.700">{blog.title}</Heading>
      <Text fontSize="lg" color="gray.600" mb={4}>{blog.excerpt}</Text>
      <HStack spacing={4} mb={2}>
        <Text fontSize="sm" color="gray.500">By {blog.author_name || 'Unknown'}</Text>
        <Text fontSize="sm" color="gray.500">{blog.published_at ? new Date(blog.published_at).toLocaleDateString() : ''}</Text>
      </HStack>
      {blog.tags && blog.tags.length > 0 && (
        <HStack mb={4} spacing={2} flexWrap="wrap">
          {blog.tags.map((tag, idx) => (
            <Badge key={idx} colorScheme="blue">{tag}</Badge>
          ))}
        </HStack>
      )}
      <Divider my={4} />
      <Box className="tiptap-content" fontSize="md" color="gray.800" dangerouslySetInnerHTML={{ __html: blog.content }} />
    </Box>
  );
};

export default BlogDetail; 