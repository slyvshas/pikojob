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
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  HStack,
  Container,
  useColorModeValue,
  Card,
  CardBody,
  CardHeader,
  Badge,
  Flex,
  Spacer,
  useBreakpointValue,
  Stack,
  Select,
  FormControl,
  FormLabel,
} from '@chakra-ui/react';
import MediumEditor from '../../components/MediumEditor.jsx';
import { DeleteIcon } from '@chakra-ui/icons';
import { FaEdit, FaPlus, FaFileAlt } from 'react-icons/fa';

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
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [postToDelete, setPostToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [postToEdit, setPostToEdit] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [editCoverImageFile, setEditCoverImageFile] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { 
    isOpen: isEditOpen, 
    onOpen: onEditOpen, 
    onClose: onEditClose 
  } = useDisclosure();
  const cancelRef = React.useRef();

  // Theme colors
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');
  const mutedColor = useColorModeValue('gray.600', 'gray.400');

  // Responsive values
  const containerMaxW = useBreakpointValue({ base: '100%', md: 'container.md', lg: 'container.lg' });
  const buttonSize = useBreakpointValue({ base: 'lg', md: 'md' });
  const inputSize = useBreakpointValue({ base: 'lg', md: 'md' });
  const headingSize = useBreakpointValue({ base: 'lg', md: 'xl' });

  useEffect(() => {
    fetchPosts();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('category')
      .not('category', 'is', null);
    
    if (data) {
      const uniqueCategories = [...new Set(data.map(item => item.category).filter(Boolean))];
      setCategories(uniqueCategories);
    }
  };

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
    const finalCategory = newCategory.trim() || category;
    const { error } = await supabase.from('blog_posts').insert([
      {
        title,
        slug,
        excerpt,
        content,
        cover_image_url: coverImageUrl,
        author_name: 'Piko staff',
        tags,
        category: finalCategory,
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
      setCategory('');
      setNewCategory('');
      fetchPosts();
      fetchCategories();
      toast({
        title: 'Blog posted!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    }
    setLoading(false);
  };

  // Improved delete logic with confirmation dialog
  const handleDelete = async () => {
    if (!postToDelete) return;
    
    setDeleteLoading(true);
    const { error } = await supabase.from('blog_posts').delete().eq('id', postToDelete.id);
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
    setDeleteLoading(false);
    setPostToDelete(null);
    onClose();
  };

  const openDeleteDialog = (post) => {
    setPostToDelete(post);
    onOpen();
  };

  const openEditDialog = (post) => {
    setPostToEdit(post);
    setEditContent(post.content);
    setEditCoverImageFile(null);
    onEditOpen();
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!postToEdit) return;
    
    setEditLoading(true);
    let coverImageUrl = postToEdit.cover_image_url;
    
    // Handle new cover image upload if provided
    if (editCoverImageFile) {
      const fileExt = editCoverImageFile.name.split('.').pop();
      const fileName = `${generateSlug(postToEdit.title)}-${Date.now()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('blog-images')
        .upload(fileName, editCoverImageFile);
      
      if (uploadError) {
        toast({
          title: 'Error uploading image',
          description: uploadError.message,
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        setEditLoading(false);
        return;
      }
      
      const { data: publicUrlData } = supabase.storage.from('blog-images').getPublicUrl(fileName);
      coverImageUrl = publicUrlData.publicUrl;
    }

    const { error } = await supabase
      .from('blog_posts')
      .update({
        title: postToEdit.title,
        excerpt: postToEdit.excerpt,
        content: editContent,
        cover_image_url: coverImageUrl,
        tags: postToEdit.tags,
        category: postToEdit.category,
      })
      .eq('id', postToEdit.id);
    
    if (error) {
      toast({
        title: 'Error updating blog',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } else {
      toast({
        title: 'Blog updated successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      fetchPosts();
      fetchCategories();
      onEditClose();
    }
    
    setEditLoading(false);
  };

  if (!isAdmin) {
    return (
      <Box bg={bgColor} minH="100vh" py={8}>
        <Container maxW={containerMaxW}>
          <Card bg={cardBg} p={8} textAlign="center">
            <Heading size={headingSize} color="red.500">Access denied. Admins only.</Heading>
          </Card>
        </Container>
      </Box>
    );
  }

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
              Blog Management
            </Heading>
            <Text color={mutedColor} fontSize={{ base: 'md', md: 'lg' }}>
              Create and manage your blog posts
            </Text>
          </Box>

          {/* Create New Blog Form */}
          <Card bg={cardBg} shadow="lg" borderRadius="xl">
            <CardHeader pb={4}>
              <HStack spacing={3}>
                <FaPlus color="blue" />
                <Heading size="md" color={textColor}>Create New Blog Post</Heading>
              </HStack>
            </CardHeader>
            <CardBody>
              <Box as="form" onSubmit={handleSubmit}>
                <VStack spacing={6} align="stretch">
                  <Input
                    type="text"
                    placeholder="Blog Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    size={inputSize}
                    bg="gray.50"
                    borderRadius="lg"
                    fontSize={{ base: 'md', md: 'sm' }}
                    _focus={{ bg: 'white', borderColor: 'blue.500' }}
                  />
                  <Textarea
                    placeholder="Brief excerpt/summary of the blog post..."
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    size={inputSize}
                    bg="gray.50"
                    borderRadius="lg"
                    fontSize={{ base: 'md', md: 'sm' }}
                    _focus={{ bg: 'white', borderColor: 'blue.500' }}
                    rows={3}
                  />
                  <Input
                    type="text"
                    placeholder="Tags (comma separated, e.g., tech, programming, tips)"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    size={inputSize}
                    bg="gray.50"
                    borderRadius="lg"
                    fontSize={{ base: 'md', md: 'sm' }}
                    _focus={{ bg: 'white', borderColor: 'blue.500' }}
                  />
                  
                  {/* Category Selection */}
                  <FormControl>
                    <FormLabel fontSize="sm" color={mutedColor} fontWeight="medium">
                      Category
                    </FormLabel>
                    <Select
                      placeholder="Select a category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      size={inputSize}
                      bg="gray.50"
                      borderRadius="lg"
                      fontSize={{ base: 'md', md: 'sm' }}
                      _focus={{ bg: 'white', borderColor: 'blue.500' }}
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </Select>
                  </FormControl>
                  
                  <Input
                    type="text"
                    placeholder="Or create a new category..."
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    size={inputSize}
                    bg="gray.50"
                    borderRadius="lg"
                    fontSize={{ base: 'md', md: 'sm' }}
                    _focus={{ bg: 'white', borderColor: 'blue.500' }}
                  />

                  <Input
                    type="file"
                    accept="image/*"
                    onChange={e => setCoverImageFile(e.target.files[0])}
                    size={inputSize}
                    bg="gray.50"
                    borderRadius="lg"
                    fontSize={{ base: 'md', md: 'sm' }}
                    _focus={{ bg: 'white', borderColor: 'blue.500' }}
                    p={2}
                  />
                  
                  {/* Content Editor */}
                  <Box>
                    <Text mb={3} fontSize="sm" color={mutedColor} fontWeight="medium">
                      Blog Content
                    </Text>
                    <MediumEditor value={content} onChange={setContent} />
                  </Box>

                  <Button 
                    type="submit" 
                    colorScheme="blue" 
                    isLoading={loading} 
                    size={buttonSize}
                    leftIcon={<FaFileAlt />}
                    w="full"
                    borderRadius="lg"
                    fontSize={{ base: 'md', md: 'sm' }}
                    py={{ base: 6, md: 4 }}
                  >
                    {loading ? 'Publishing...' : 'Publish Blog Post'}
                  </Button>
                  
                  {error && (
                    <Text color="red.500" fontSize="sm" textAlign="center">
                      {error}
                    </Text>
                  )}
                </VStack>
              </Box>
            </CardBody>
          </Card>

          {/* Existing Blog Posts */}
          <Card bg={cardBg} shadow="lg" borderRadius="xl">
            <CardHeader pb={4}>
              <HStack spacing={3}>
                <FaFileAlt color="blue" />
                <Heading size="md" color={textColor}>Existing Blog Posts</Heading>
              </HStack>
            </CardHeader>
            <CardBody>
              {loading ? (
                <Box textAlign="center" py={8}>
                  <Text color={mutedColor}>Loading posts...</Text>
                </Box>
              ) : posts.length === 0 ? (
                <Box textAlign="center" py={8}>
                  <Text color={mutedColor}>No blog posts yet. Create your first one above!</Text>
                </Box>
              ) : (
                <VStack spacing={4} align="stretch">
                  {posts.map((post) => (
                    <Card key={post.id} bg="gray.50" borderRadius="lg" p={4}>
                      <VStack align="stretch" spacing={3}>
                        <Flex align="center" justify="space-between">
                          <Heading size="sm" color={textColor} noOfLines={2}>
                            {post.title}
                          </Heading>
                          <HStack spacing={2}>
                            <IconButton
                              icon={<FaEdit />}
                              colorScheme="blue"
                              size="sm"
                              aria-label="Edit blog"
                              onClick={() => openEditDialog(post)}
                            />
                            <IconButton
                              icon={<DeleteIcon />}
                              colorScheme="red"
                              size="sm"
                              aria-label="Delete blog"
                              onClick={() => openDeleteDialog(post)}
                            />
                          </HStack>
                        </Flex>
                        
                        <Text fontSize="sm" color={mutedColor} noOfLines={2}>
                          {post.excerpt}
                        </Text>
                        
                        {/* Category Badge */}
                        {post.category && (
                          <Badge colorScheme="purple" variant="solid" fontSize="xs" w="fit-content">
                            {post.category}
                          </Badge>
                        )}
                        
                        {post.tags && post.tags.length > 0 && (
                          <Flex wrap="wrap" gap={2}>
                            {post.tags.slice(0, 3).map((tag, idx) => (
                              <Badge key={idx} colorScheme="blue" variant="subtle" fontSize="xs">
                                {tag}
                              </Badge>
                            ))}
                            {post.tags.length > 3 && (
                              <Badge colorScheme="gray" variant="subtle" fontSize="xs">
                                +{post.tags.length - 3}
                              </Badge>
                            )}
                          </Flex>
                        )}
                        
                        <Text fontSize="xs" color={mutedColor}>
                          Posted: {new Date(post.created_at).toLocaleDateString()}
                        </Text>
                      </VStack>
                    </Card>
                  ))}
                </VStack>
              )}
            </CardBody>
          </Card>
        </VStack>
      </Container>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent mx={4}>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Blog Post
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete "{postToDelete?.title}"? This action cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose} size="sm">
                Cancel
              </Button>
              <Button 
                colorScheme="red" 
                onClick={handleDelete} 
                ml={3}
                isLoading={deleteLoading}
                size="sm"
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {/* Edit Blog Modal */}
      <Modal isOpen={isEditOpen} onClose={onEditClose} size="full" scrollBehavior="inside">
        <ModalOverlay />
        <ModalContent mx={2} my={4} maxH="90vh">
          <ModalHeader>Edit Blog Post</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {postToEdit && (
              <Box as="form" onSubmit={handleEditSubmit}>
                <VStack spacing={6} align="stretch">
                  <Input
                    type="text"
                    placeholder="Blog Title"
                    value={postToEdit.title}
                    onChange={(e) => setPostToEdit({...postToEdit, title: e.target.value})}
                    size={inputSize}
                    bg="gray.50"
                    borderRadius="lg"
                    fontSize={{ base: 'md', md: 'sm' }}
                    _focus={{ bg: 'white', borderColor: 'blue.500' }}
                  />
                  <Textarea
                    placeholder="Excerpt"
                    value={postToEdit.excerpt}
                    onChange={(e) => setPostToEdit({...postToEdit, excerpt: e.target.value})}
                    size={inputSize}
                    bg="gray.50"
                    borderRadius="lg"
                    fontSize={{ base: 'md', md: 'sm' }}
                    _focus={{ bg: 'white', borderColor: 'blue.500' }}
                    rows={3}
                  />
                  <Input
                    type="text"
                    placeholder="Tags (comma separated)"
                    value={postToEdit.tags?.join(', ') || ''}
                    onChange={(e) => setPostToEdit({
                      ...postToEdit, 
                      tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                    })}
                    size={inputSize}
                    bg="gray.50"
                    borderRadius="lg"
                    fontSize={{ base: 'md', md: 'sm' }}
                    _focus={{ bg: 'white', borderColor: 'blue.500' }}
                  />
                  
                  {/* Category Selection */}
                  <FormControl>
                    <FormLabel fontSize="sm" color={mutedColor} fontWeight="medium">
                      Category
                    </FormLabel>
                    <Select
                      placeholder="Select a category"
                      value={postToEdit.category || ''}
                      onChange={(e) => setPostToEdit({...postToEdit, category: e.target.value})}
                      size={inputSize}
                      bg="gray.50"
                      borderRadius="lg"
                      fontSize={{ base: 'md', md: 'sm' }}
                      _focus={{ bg: 'white', borderColor: 'blue.500' }}
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </Select>
                  </FormControl>
                  
                  <Input
                    type="text"
                    placeholder="Or enter a new category..."
                    value={postToEdit.newCategory || ''}
                    onChange={(e) => setPostToEdit({...postToEdit, newCategory: e.target.value, category: e.target.value || postToEdit.category})}
                    size={inputSize}
                    bg="gray.50"
                    borderRadius="lg"
                    fontSize={{ base: 'md', md: 'sm' }}
                    _focus={{ bg: 'white', borderColor: 'blue.500' }}
                  />

                  <Input
                    type="file"
                    accept="image/*"
                    onChange={e => setEditCoverImageFile(e.target.files[0])}
                    size={inputSize}
                    bg="gray.50"
                    borderRadius="lg"
                    fontSize={{ base: 'md', md: 'sm' }}
                    _focus={{ bg: 'white', borderColor: 'blue.500' }}
                    p={2}
                  />
                  <Text fontSize="sm" color="gray.600">
                    Leave empty to keep current cover image
                  </Text>
                  
                  <Box>
                    <Text mb={3} fontSize="sm" color={mutedColor} fontWeight="medium">
                      Blog Content
                    </Text>
                    <MediumEditor value={editContent} onChange={setEditContent} />
                  </Box>
                  
                  <Stack direction={{ base: 'column', sm: 'row' }} spacing={3}>
                    <Button onClick={onEditClose} variant="outline" size={buttonSize} flex={1}>
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      colorScheme="blue" 
                      isLoading={editLoading}
                      size={buttonSize}
                      flex={1}
                    >
                      Update Blog
                    </Button>
                  </Stack>
                </VStack>
              </Box>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default BlogManagement; 