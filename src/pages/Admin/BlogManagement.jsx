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
} from '@chakra-ui/react';
import MediumEditor from '../../components/MediumEditor.jsx';
import { DeleteIcon } from '@chakra-ui/icons';
import { FaEdit } from 'react-icons/fa';

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
      onEditClose();
    }
    
    setEditLoading(false);
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
              <HStack position="absolute" top={2} right={2} spacing={1}>
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
            </Box>
          ))}
        </VStack>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Blog Post
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete "{postToDelete?.title}"? This action cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button 
                colorScheme="red" 
                onClick={handleDelete} 
                ml={3}
                isLoading={deleteLoading}
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {/* Edit Blog Modal */}
      <Modal isOpen={isEditOpen} onClose={onEditClose} size="6xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Blog Post</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {postToEdit && (
              <Box as="form" onSubmit={handleEditSubmit}>
                <VStack spacing={4} align="stretch">
                  <Input
                    type="text"
                    placeholder="Blog Title"
                    value={postToEdit.title}
                    onChange={(e) => setPostToEdit({...postToEdit, title: e.target.value})}
                    size="md"
                    bg="gray.50"
                  />
                  <Input
                    type="text"
                    placeholder="Excerpt"
                    value={postToEdit.excerpt}
                    onChange={(e) => setPostToEdit({...postToEdit, excerpt: e.target.value})}
                    size="md"
                    bg="gray.50"
                  />
                  <Input
                    type="text"
                    placeholder="Tags (comma separated)"
                    value={postToEdit.tags?.join(', ') || ''}
                    onChange={(e) => setPostToEdit({
                      ...postToEdit, 
                      tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                    })}
                    size="md"
                    bg="gray.50"
                  />
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={e => setEditCoverImageFile(e.target.files[0])}
                    size="md"
                    bg="gray.50"
                  />
                  <Text fontSize="sm" color="gray.600">
                    Leave empty to keep current cover image
                  </Text>
                  <MediumEditor value={editContent} onChange={setEditContent} />
                  <HStack justify="flex-end" spacing={3}>
                    <Button onClick={onEditClose}>Cancel</Button>
                    <Button 
                      type="submit" 
                      colorScheme="blue" 
                      isLoading={editLoading}
                    >
                      Update Blog
                    </Button>
                  </HStack>
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