import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  VStack,
  HStack,
  Button,
  useToast,
  SimpleGrid,
  Text,
  Input,
  Textarea,
  Select,
  FormControl,
  FormLabel,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  IconButton,
  Badge,
  Flex,
  Link as ChakraLink,
  Icon,
  useColorModeValue,
  Image,
} from '@chakra-ui/react';
import { FaPlus, FaEdit, FaTrash, FaExternalLinkAlt, FaUser, FaBuilding, FaFileAlt, FaUpload } from 'react-icons/fa';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

const FreeBooksDashboard = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingBook, setEditingBook] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const { isAdmin } = useAuth();
  const cardBg = useColorModeValue('white', 'gray.800');

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    author: '',
    publisher: '',
    language: 'English',
    pages: '',
    format: '',
    link: '',
    cover_image_url: '',
    blog_slug: '',
  });
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const { data, error } = await supabase
        .from('free_books')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBooks(data);
    } catch (error) {
      console.error('Error fetching books:', error);
      toast({
        title: 'Error',
        description: 'Failed to load books',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.category) {
      toast({
        title: 'Validation Error',
        description: 'Title and category are required',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      // Upload image if selected
      let imageUrl = formData.cover_image_url;
      if (selectedFile) {
        imageUrl = await uploadImage();
        if (!imageUrl) {
          return; // Upload failed, don't proceed
        }
      }

      const bookData = {
        ...formData,
        cover_image_url: imageUrl
      };

      if (editingBook) {
        // Update existing book
        const { error } = await supabase
          .from('free_books')
          .update(bookData)
          .eq('id', editingBook.id);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Book updated successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        // Create new book
        const { error } = await supabase
          .from('free_books')
          .insert([bookData]);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Book created successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }

      fetchBooks();
      handleClose();
    } catch (error) {
      console.error('Error saving book:', error);
      toast({
        title: 'Error',
        description: 'Failed to save book',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleEdit = (book) => {
    setEditingBook(book);
    setFormData({
      title: book.title,
      description: book.description || '',
      category: book.category,
      author: book.author || '',
      publisher: book.publisher || '',
      language: book.language || 'English',
      pages: book.pages || '',
      format: book.format || '',
      link: book.link || '',
      cover_image_url: book.cover_image_url || '',
      blog_slug: book.blog_slug || '',
    });
    onOpen();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this book?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('free_books')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Book deleted successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      fetchBooks();
    } catch (error) {
      console.error('Error deleting book:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete book',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleClose = () => {
    setEditingBook(null);
    setFormData({
      title: '',
      description: '',
      category: '',
      author: '',
      publisher: '',
      language: 'English',
      pages: '',
      format: '',
      link: '',
      cover_image_url: '',
      blog_slug: '',
    });
    setSelectedFile(null);
    onClose();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Invalid file type',
          description: 'Please select an image file (JPG, PNG, etc.)',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Please select an image smaller than 5MB',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }
      
      setSelectedFile(file);
    }
  };

  const uploadImage = async () => {
    if (!selectedFile) return null;
    
    setUploading(true);
    try {
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `book-covers/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, selectedFile);
      
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);
      
      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: 'Upload failed',
        description: 'Failed to upload image. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  // Format category for display
  const formatCategory = (category) => {
    return category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Get category color scheme
  const getCategoryColor = (category) => {
    const colors = {
      programming: 'blue',
      design: 'purple',
      business: 'green',
      marketing: 'orange',
      finance: 'teal',
      self_help: 'pink',
      technology: 'cyan',
      science: 'red',
      fiction: 'yellow',
      non_fiction: 'gray'
    };
    return colors[category] || 'gray';
  };

  // Get format color scheme
  const getFormatColor = (format) => {
    const colors = {
      pdf: 'red',
      epub: 'blue',
      mobi: 'green',
      online: 'purple',
      multiple: 'orange'
    };
    return colors[format] || 'gray';
  };

  if (!isAdmin) {
    return (
      <Container maxW="container.md" py={8}>
        <Box textAlign="center">
          <Heading size="lg">Access Denied</Heading>
          <Text mt={4}>You need admin privileges to access this page.</Text>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Flex justify="space-between" align="center">
          <Heading>Free Books Management</Heading>
          <Button
            leftIcon={<FaPlus />}
            colorScheme="blue"
            onClick={() => onOpen()}
          >
            Add Book
          </Button>
        </Flex>

        {loading ? (
          <Text>Loading books...</Text>
        ) : books.length === 0 ? (
          <Box textAlign="center" py={10}>
            <Text fontSize="lg" color="gray.500" mb={4}>
              No books found
            </Text>
            <Button colorScheme="blue" onClick={() => onOpen()}>
              Add Your First Book
            </Button>
          </Box>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {books.map((book) => {
              const isNew = (Date.now() - new Date(book.created_at).getTime()) < 3 * 24 * 60 * 60 * 1000;
              
              return (
                <Card
                  key={book.id}
                  bg={cardBg}
                  borderRadius="xl"
                  boxShadow="0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
                  transition="all 0.3s ease"
                  _hover={{ 
                    transform: 'translateY(-4px)', 
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                    borderColor: 'blue.200'
                  }}
                  border="1px solid"
                  borderColor="gray.100"
                  overflow="hidden"
                  position="relative"
                >
                  {/* Top Right Badges */}
                  <Box
                    position="absolute"
                    top={3}
                    right={3}
                    zIndex={2}
                    display="flex"
                    gap={2}
                  >
                    {isNew && (
                      <Badge 
                        colorScheme="green" 
                        variant="solid"
                        borderRadius="full"
                        px={2}
                        py={1}
                        fontSize="xs"
                        fontWeight="medium"
                      >
                        New
                      </Badge>
                    )}
                  </Box>

                  {/* Admin Actions */}
                  <Box
                    position="absolute"
                    top={3}
                    left={3}
                    zIndex={2}
                    display="flex"
                    gap={1}
                  >
                    <IconButton
                      aria-label="Edit book"
                      icon={<FaEdit />}
                      colorScheme="blue"
                      variant="ghost"
                      size="sm"
                      bg="white"
                      _hover={{ bg: 'gray.50' }}
                      onClick={() => handleEdit(book)}
                    />
                    <IconButton
                      aria-label="Delete book"
                      icon={<FaTrash />}
                      colorScheme="red"
                      variant="ghost"
                      size="sm"
                      bg="white"
                      _hover={{ bg: 'gray.50' }}
                      onClick={() => handleDelete(book.id)}
                    />
                  </Box>

                  {/* Book Content */}
                  <Box p={6} pt={12}>
                    {/* Cover Image */}
                    {book.cover_image_url && (
                      <Box mb={4} textAlign="center">
                        <Image
                          src={book.cover_image_url}
                          alt={book.title}
                          maxH="150px"
                          objectFit="contain"
                          borderRadius="md"
                          mx="auto"
                        />
                      </Box>
                    )}

                    {/* Category Badge */}
                    {book.category && (
                      <Badge 
                        colorScheme={getCategoryColor(book.category)} 
                        variant="subtle"
                        fontSize="xs"
                        mb={3}
                        borderRadius="full"
                        px={3}
                        py={1}
                      >
                        {formatCategory(book.category)}
                      </Badge>
                    )}

                    {/* Title */}
                    <Heading 
                      size="md" 
                      mb={2}
                      color="gray.800"
                      lineHeight="1.3"
                      noOfLines={2}
                    >
                      {book.title}
                    </Heading>

                    {/* Author */}
                    {book.author && (
                      <HStack spacing={1} mb={2}>
                        <Icon as={FaUser} color="gray.500" fontSize="xs" />
                        <Text fontSize="sm" color="blue.600" fontWeight="medium">
                          {book.author}
                        </Text>
                      </HStack>
                    )}

                    {/* Publisher */}
                    {book.publisher && (
                      <HStack spacing={1} mb={2}>
                        <Icon as={FaBuilding} color="gray.500" fontSize="xs" />
                        <Text fontSize="xs" color="gray.600">
                          {book.publisher}
                        </Text>
                      </HStack>
                    )}

                    {/* Book Details */}
                    <HStack spacing={4} mb={3} fontSize="xs" color="gray.500">
                      {book.pages && (
                        <Text>{book.pages} pages</Text>
                      )}
                      {book.language && (
                        <Text>{book.language}</Text>
                      )}
                      {book.format && (
                        <Badge colorScheme={getFormatColor(book.format)} variant="subtle" fontSize="xs">
                          {book.format.toUpperCase()}
                        </Badge>
                      )}
                    </HStack>

                    {/* Description */}
                    <Text 
                      color="gray.600" 
                      fontSize="sm" 
                      lineHeight="1.5"
                      mb={4}
                      noOfLines={3}
                    >
                      {book.description}
                    </Text>

                    {/* Blog Slug */}
                    {book.blog_slug && (
                      <Text fontSize="xs" color="yellow.600" mb={3} fontFamily="mono">
                        Blog: {book.blog_slug}
                      </Text>
                    )}

                    {/* Action Buttons */}
                    <HStack spacing={2} mt={4}>
                      {book.link && (
                        <ChakraLink 
                          href={book.link} 
                          isExternal 
                          _hover={{ textDecoration: 'none' }}
                          flex={1}
                        >
                          <Button
                            colorScheme="gray"
                            variant="outline"
                            size="sm"
                            width="100%"
                            rightIcon={<FaExternalLinkAlt />}
                            _hover={{ 
                              bg: 'gray.50',
                              borderColor: 'gray.300'
                            }}
                          >
                            View Link
                          </Button>
                        </ChakraLink>
                      )}
                    </HStack>
                  </Box>
                </Card>
              );
            })}
          </SimpleGrid>
        )}

        {/* Add/Edit Modal */}
        <Modal isOpen={isOpen} onClose={handleClose} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              {editingBook ? 'Edit Book' : 'Add New Book'}
            </ModalHeader>
            <ModalCloseButton />
            <form onSubmit={handleSubmit}>
              <ModalBody>
                <VStack spacing={4}>
                  <FormControl isRequired>
                    <FormLabel>Title</FormLabel>
                    <Input
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="Enter book title"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Description</FormLabel>
                    <Textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Enter book description"
                      rows={4}
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Category</FormLabel>
                    <Select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      placeholder="Select category"
                    >
                      <option value="programming">Programming</option>
                      <option value="design">Design</option>
                      <option value="business">Business</option>
                      <option value="marketing">Marketing</option>
                      <option value="finance">Finance</option>
                      <option value="self_help">Self Help</option>
                      <option value="technology">Technology</option>
                      <option value="science">Science</option>
                      <option value="fiction">Fiction</option>
                      <option value="non_fiction">Non Fiction</option>
                    </Select>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Author</FormLabel>
                    <Input
                      name="author"
                      value={formData.author}
                      onChange={handleInputChange}
                      placeholder="Enter author name"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Publisher</FormLabel>
                    <Input
                      name="publisher"
                      value={formData.publisher}
                      onChange={handleInputChange}
                      placeholder="Enter publisher name"
                    />
                  </FormControl>

                  <HStack spacing={4} width="100%">
                    <FormControl>
                      <FormLabel>Language</FormLabel>
                      <Input
                        name="language"
                        value={formData.language}
                        onChange={handleInputChange}
                        placeholder="English"
                      />
                    </FormControl>

                    <FormControl>
                      <FormLabel>Pages</FormLabel>
                      <Input
                        name="pages"
                        type="number"
                        value={formData.pages}
                        onChange={handleInputChange}
                        placeholder="Number of pages"
                      />
                    </FormControl>
                  </HStack>

                  <FormControl>
                    <FormLabel>Format</FormLabel>
                    <Select
                      name="format"
                      value={formData.format}
                      onChange={handleInputChange}
                      placeholder="Select format"
                    >
                      <option value="pdf">PDF</option>
                      <option value="epub">EPUB</option>
                      <option value="mobi">MOBI</option>
                      <option value="online">Online</option>
                      <option value="multiple">Multiple Formats</option>
                    </Select>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Download Link</FormLabel>
                    <Input
                      name="link"
                      value={formData.link}
                      onChange={handleInputChange}
                      placeholder="Enter download URL"
                      type="url"
                    />
                  </FormControl>

                                     <FormControl>
                     <FormLabel>Cover Image</FormLabel>
                     <VStack spacing={3} align="start">
                       <HStack spacing={3} width="100%">
                         <Button
                           as="label"
                           htmlFor="cover-image-upload"
                           leftIcon={<FaUpload />}
                           colorScheme="blue"
                           variant="outline"
                           cursor="pointer"
                           isLoading={uploading}
                           loadingText="Uploading..."
                         >
                           {selectedFile ? selectedFile.name : 'Upload Cover Image'}
                         </Button>
                         {selectedFile && (
                           <Button
                             size="sm"
                             variant="ghost"
                             colorScheme="red"
                             onClick={() => setSelectedFile(null)}
                           >
                             Remove
                           </Button>
                         )}
                       </HStack>
                       <input
                         id="cover-image-upload"
                         type="file"
                         accept="image/*"
                         onChange={handleFileSelect}
                         style={{ display: 'none' }}
                       />
                       {formData.cover_image_url && !selectedFile && (
                         <Box>
                           <Text fontSize="sm" color="gray.600" mb={2}>
                             Current cover image:
                           </Text>
                           <Image
                             src={formData.cover_image_url}
                             alt="Current cover"
                             maxH="100px"
                             objectFit="contain"
                             borderRadius="md"
                           />
                         </Box>
                       )}
                       {selectedFile && (
                         <Box>
                           <Text fontSize="sm" color="gray.600" mb={2}>
                             Selected file: {selectedFile.name}
                           </Text>
                           <Text fontSize="xs" color="gray.500">
                             Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                           </Text>
                         </Box>
                       )}
                       <Text fontSize="xs" color="gray.500">
                         Supported formats: JPG, PNG, GIF. Max size: 5MB
                       </Text>
                     </VStack>
                   </FormControl>

                  <FormControl>
                    <FormLabel>Blog Slug (Optional)</FormLabel>
                    <Input
                      name="blog_slug"
                      value={formData.blog_slug}
                      onChange={handleInputChange}
                      placeholder="Enter related blog slug"
                    />
                  </FormControl>
                </VStack>
              </ModalBody>

              <ModalFooter>
                <Button variant="ghost" mr={3} onClick={handleClose}>
                  Cancel
                </Button>
                <Button colorScheme="blue" type="submit">
                  {editingBook ? 'Update' : 'Create'} Book
                </Button>
              </ModalFooter>
            </form>
          </ModalContent>
        </Modal>
      </VStack>
    </Container>
  );
};

export default FreeBooksDashboard; 