import React, { useState, useEffect, useContext } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import {
  Box,
  Heading,
  Input,
  Textarea,
  Button,
  VStack,
  Text,
  useToast,
  Divider,
  IconButton,
} from '@chakra-ui/react';
import MediumEditor from '../../components/MediumEditor.jsx';
import { DeleteIcon } from '@chakra-ui/icons';

const BlogManagement = () => {
  const { user, isAdmin } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const toast = useToast();
  const [excerpt, setExcerpt] = useState('');
  const [coverImageFile, setCoverImageFile] = useState(null);
  const [tagsInput, setTagsInput] = useState(''); // comma-separated tags

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) setError(error.message);
    else setPosts(data);
    setLoading(false);
  };

  function generateSlug(title) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!title || !excerpt || !content) {
      setError('Title, excerpt, and content are required.');
      return;
    }
    setLoading(true);
    let coverImageUrl = '';
    if (coverImageFile) {
      const fileExt = coverImageFile.name.split('.').pop();
      const fileName = `${generateSlug(title)}-${Date.now()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('blog-images')
        .upload(fileName, coverImageFile);
      if (uploadError) {
        setError('Image upload failed: ' + uploadError.message);
        setLoading(false);
        return;
      }
      // Get public URL
      const { data: publicUrlData } = supabase.storage.from('blog-images').getPublicUrl(fileName);
      coverImageUrl = publicUrlData.publicUrl;
    }
    const slug = generateSlug(title);
    const tags = tagsInput.split(',').map(tag => tag.trim()).filter(Boolean);
    const { error } = await supabase.from('blog_posts').insert([
      {
        title,
        slug,
        excerpt,
        content,
        cover_image_url: coverImageUrl,
        author_name: 'Piko staff',
        tags,
        created_by: user?.id,
        published_at: new Date().toISOString(),
      },
    ]);
    if (error) {
      setError(error.message);
      toast({
        title: 'Error posting blog',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } else {
      setTitle('');
      setExcerpt('');
      setContent('');
      setCoverImageFile(null);
      setTagsInput('');
      fetchPosts();
      toast({
        title: 'Blog posted!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    }
    setLoading(false);
  };

  // Restore the blog list and add delete logic
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this blog post?')) return;
    setLoading(true);
    const { error } = await supabase.from('blog_posts').delete().eq('id', id);
    if (error) {
      toast({
        title: 'Error deleting blog',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } else {
      fetchPosts();
      toast({
        title: 'Blog deleted!',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    }
    setLoading(false);
  };

  if (!isAdmin) {
    return <Box p={8} textAlign="center"><Heading size="md">Access denied. Admins only.</Heading></Box>;
  }

  return (
    <Box maxW="700px" mx="auto" py={10} px={4}>
      <Heading mb={8} textAlign="center" color="blue.600">Blog Management</Heading>
      <Box as="form" onSubmit={handleSubmit} mb={12} p={6} borderRadius="lg" boxShadow="md" bg="white">
        <VStack spacing={4} align="stretch">
          <Heading size="md" mb={2}>Post a New Blog</Heading>
          <Input
            type="text"
            placeholder="Blog Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            size="md"
            bg="gray.50"
          />
          <Input
            type="text"
            placeholder="Excerpt"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            size="md"
            bg="gray.50"
          />
          {/* Replace Textarea with MediumEditor */}
          <MediumEditor value={content} onChange={setContent} />
          <Input
            type="file"
            accept="image/*"
            onChange={e => setCoverImageFile(e.target.files[0])}
            size="md"
            bg="gray.50"
          />
          <Input
            type="text"
            placeholder="Tags (comma separated)"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            size="md"
            bg="gray.50"
          />
          <Button type="submit" colorScheme="blue" isLoading={loading} size="md" alignSelf="flex-end">
            Post Blog
          </Button>
          {error && <Text color="red.500">{error}</Text>}
        </VStack>
      </Box>
      {/* Blog list with delete button */}
      <Heading size="md" mb={6} color="blue.700">Existing Blog Posts</Heading>
      {loading ? (
        <Text>Loading...</Text>
      ) : (
        <VStack spacing={4} align="stretch">
          {posts.map((post) => (
            <Box key={post.id} borderWidth="1px" borderRadius="lg" p={4} bg="white" boxShadow="sm" position="relative">
              <Heading size="sm">{post.title}</Heading>
              <Divider my={2} />
              <Box fontSize="md" color="gray.800" dangerouslySetInnerHTML={{ __html: post.content }} />
              <Text fontSize="xs" color="gray.500">
                Posted on {new Date(post.created_at).toLocaleString()}
              </Text>
              <IconButton
                icon={<DeleteIcon />}
                colorScheme="red"
                size="sm"
                aria-label="Delete blog"
                position="absolute"
                top={2}
                right={2}
                onClick={() => handleDelete(post.id)}
              />
            </Box>
          ))}
        </VStack>
      )}
    </Box>
  );
};

export default BlogManagement; 