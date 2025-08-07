import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Card,
  Link as ChakraLink,
  Icon,
  Badge,
  HStack,
  Button,
  IconButton,
  useToast,
  Image,
} from '@chakra-ui/react';
import { FaExternalLinkAlt, FaBookmark, FaRegBookmark, FaBook, FaUser, FaBuilding } from 'react-icons/fa';
import BlogSlideUp from '../components/BlogSlideUp';
import { useAuth } from '../context/AuthContext';

const FreeBooks = () => {
  const [books, setBooks] = useState([]);
  const [savedBooks, setSavedBooks] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { isAdmin, user } = useAuth();
  const [blogSlideUpOpen, setBlogSlideUpOpen] = useState(false);
  const [activeBlogSlug, setActiveBlogSlug] = useState(null);
  const toast = useToast();

  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('free_books')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) setError(error.message);
      else setBooks(data);
      setLoading(false);
    };
    fetchBooks();
    
    if (user) {
      fetchSavedBooks();
    }
  }, [user]);

  const fetchSavedBooks = async () => {
    try {
      const { data, error } = await supabase
        .from('saved_books')
        .select('book_id')
        .eq('user_id', user.id);

      if (error) throw error;

      const savedBookIds = new Set(data.map(item => item.book_id));
      setSavedBooks(savedBookIds);
    } catch (error) {
      console.error('Error fetching saved books:', error);
    }
  };

  const handleSaveBook = async (bookId) => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to save books',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      if (savedBooks.has(bookId)) {
        // Unsave book
        const { error } = await supabase
          .from('saved_books')
          .delete()
          .eq('user_id', user.id)
          .eq('book_id', bookId);

        if (error) throw error;

        setSavedBooks(prev => {
          const newSet = new Set(prev);
          newSet.delete(bookId);
          return newSet;
        });

        toast({
          title: 'Book Unsaved',
          description: 'Book has been removed from your saved books',
          status: 'info',
          duration: 3000,
          isClosable: true,
        });
      } else {
        // Save book
        const { error } = await supabase
          .from('saved_books')
          .insert({
            user_id: user.id,
            book_id: bookId,
          });

        if (error) throw error;

        setSavedBooks(prev => new Set([...prev, bookId]));

        toast({
          title: 'Book Saved',
          description: 'Book has been added to your saved books',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error saving/unsaving book:', error);
      toast({
        title: 'Error',
        description: 'Failed to save/unsave book',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
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

  return (
    <Box maxW="1200px" mx="auto" py={10} px={4}>
      <Heading mb={8} textAlign="center" color="blue.600">Free Books</Heading>
      
      {/* Results Summary */}
      <HStack justify="space-between" align="center" mb={6} flexWrap="wrap" gap={2}>
        <Text color="gray.600" mb={2}>
          Showing {books.length} books
        </Text>
      </HStack>

      {loading ? (
        <Text>Loading...</Text>
      ) : error ? (
        <Text color="red.500">{error}</Text>
      ) : books.length === 0 ? (
        <Box textAlign="center" py={10}>
          <Text fontSize="lg" color="gray.500" mb={4}>
            No books available
          </Text>
        </Box>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
          {books.map((book) => {
            const isNew = (Date.now() - new Date(book.created_at).getTime()) < 3 * 24 * 60 * 60 * 1000;
            
            return (
              <Card
                key={book.id}
                bg="white"
                borderRadius="lg"
                boxShadow="sm"
                transition="all 0.3s ease"
                _hover={{ 
                  transform: 'translateY(-4px) scale(1.02)', 
                  boxShadow: 'xl', 
                  borderColor: 'blue.400',
                  bg: 'blue.50'
                }}
                border="1px solid"
                borderColor="gray.200"
                overflow="hidden"
                position="relative"
                maxW="400px"
                minH="200px"
                mx="auto"
                display="flex"
                flexDirection="row"
                cursor="pointer"
              >
                {/* Top Right Badges */}
                <Box
                  position="absolute"
                  top={2}
                  right={2}
                  zIndex={2}
                  display="flex"
                  gap={1}
                >
                  {isNew && (
                    <Badge 
                      colorScheme="green" 
                      variant="solid"
                      borderRadius="full"
                      px={1.5}
                      py={0.5}
                      fontSize="2xs"
                      fontWeight="medium"
                    >
                      New
                    </Badge>
                  )}
                </Box>

                {/* Save Button */}
                <Box
                  position="absolute"
                  top={2}
                  left={2}
                  zIndex={2}
                >
                  <IconButton
                    aria-label={savedBooks.has(book.id) ? 'Unsave book' : 'Save book'}
                    icon={savedBooks.has(book.id) ? <FaBookmark /> : <FaRegBookmark />}
                    colorScheme={savedBooks.has(book.id) ? 'blue' : 'gray'}
                    variant="ghost"
                    size="xs"
                    bg="white"
                    _hover={{ 
                      bg: 'blue.50',
                      transform: 'scale(1.1)',
                      color: 'blue.500'
                    }}
                    transition="all 0.2s ease"
                    onClick={() => handleSaveBook(book.id)}
                  />
                </Box>

                {/* Cover Image - Left Side */}
                <Box 
                  w="120px" 
                  h="200px" 
                  position="relative"
                  bg="gray.50"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  {book.cover_image_url ? (
                    <Image
                      src={book.cover_image_url}
                      alt={book.title}
                      w="100px"
                      h="140px"
                      objectFit="contain"
                      borderRadius="md"
                      fallbackSrc="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjE0MCIgdmlld0JveD0iMCAwIDEwMCAxNDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMCAyMEg4MFYxMjBIMjBWMjBaIiBmaWxsPSIjRjNGNEY2IiBzdHJva2U9IiM5Q0EzQUYiIHN0cm9rZS13aWR0aD0iMiIvPgo8cGF0aCBkPSJNMzAgMzBINzBWNzBIMzBWMzBaIiBmaWxsPSIjRjNGNEY2IiBzdHJva2U9IiM5Q0EzQUYiIHN0cm9rZS13aWR0aD0iMiIvPgo8cGF0aCBkPSJNMzAgODBINzBWMTAwSDMwVjgwWiIgZmlsbD0iI0YzRjRGNiIgc3Ryb2tlPSIjOUNBM0FGIiBzdHJva2Utd2lkdGg9IjIiLz4KPHN2ZyB4PSI1MCIgeT0iNzAiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgdmlld0JveD0iMCAwIDIwIDIwIiBmaWxsPSJub25lIj4KPHBhdGggZD0iTTEwIDVIMTVWMTVIMFYxMEg1VjVaIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPgo8L3N2Zz4K"
                    />
                  ) : (
                    <Box
                      w="100px"
                      h="140px"
                      bg="gray.200"
                      borderRadius="md"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Icon as={FaBook} color="gray.400" fontSize="2xl" />
                    </Box>
                  )}
                </Box>

                {/* Book Content - Right Side */}
                <Box p={4} flex="1" display="flex" flexDirection="column" position="relative">
                  {/* Top Right Badges */}
                  <Box
                    position="absolute"
                    top={2}
                    right={2}
                    zIndex={2}
                    display="flex"
                    gap={1}
                  >
                    {isNew && (
                      <Badge 
                        colorScheme="green" 
                        variant="solid"
                        borderRadius="full"
                        px={1.5}
                        py={0.5}
                        fontSize="2xs"
                        fontWeight="medium"
                      >
                        New
                      </Badge>
                    )}
                  </Box>

                  {/* Category Badge */}
                  {book.category && (
                    <Badge 
                      colorScheme={getCategoryColor(book.category)} 
                      variant="subtle"
                      fontSize="2xs"
                      mb={2}
                      borderRadius="full"
                      px={2}
                      py={0.5}
                      alignSelf="flex-start"
                    >
                      {formatCategory(book.category)}
                    </Badge>
                  )}

                  {/* Title */}
                  <Heading 
                    size="sm" 
                    mb={1}
                    color="gray.800"
                    lineHeight="1.2"
                    noOfLines={2}
                    fontSize="md"
                    pr={8}
                  >
                    {book.title}
                  </Heading>

                  {/* Author */}
                  {book.author && (
                    <HStack spacing={1} mb={1}>
                      <Icon as={FaUser} color="gray.400" fontSize="2xs" />
                      <Text fontSize="xs" color="blue.600" fontWeight="medium" noOfLines={1}>
                        {book.author}
                      </Text>
                    </HStack>
                  )}

                  {/* Publisher */}
                  {book.publisher && (
                    <HStack spacing={1} mb={2}>
                      <Icon as={FaBuilding} color="gray.400" fontSize="2xs" />
                      <Text fontSize="2xs" color="gray.500" noOfLines={1}>
                        {book.publisher}
                      </Text>
                    </HStack>
                  )}

                  {/* Book Details */}
                  <HStack spacing={2} mb={2} fontSize="2xs" color="gray.500" flexWrap="wrap">
                    {book.pages && (
                      <Text>{book.pages} pages</Text>
                    )}
                    {book.language && (
                      <Text>{book.language}</Text>
                    )}
                    {book.format && (
                      <Badge colorScheme={getFormatColor(book.format)} variant="subtle" fontSize="2xs">
                        {book.format.toUpperCase()}
                      </Badge>
                    )}
                  </HStack>

                  {/* Description */}
                  <Text 
                    color="gray.600" 
                    fontSize="xs" 
                    lineHeight="1.4"
                    mb={3}
                    noOfLines={2}
                    flex="1"
                  >
                    {book.description}
                  </Text>

                  {/* Admin Blog Slug */}
                  {isAdmin && book.blog_slug && (
                    <Text fontSize="2xs" color="yellow.600" mb={2} fontFamily="mono">
                      Blog: {book.blog_slug}
                    </Text>
                  )}

                  {/* Action Buttons */}
                  <HStack spacing={2} mt="auto">
                    {book.blog_slug && (
                      <Button
                        size="xs"
                        colorScheme="blue"
                        variant="solid"
                        flex="1"
                        leftIcon={<FaBook />}
                        onClick={() => { 
                          setActiveBlogSlug(book.blog_slug); 
                          setBlogSlideUpOpen(true); 
                        }}
                        _hover={{ 
                          bg: 'blue.600',
                          transform: 'translateY(-1px)',
                          boxShadow: 'md'
                        }}
                        transition="all 0.2s ease"
                        boxShadow="sm"
                      >
                        Learn More
                      </Button>
                    )}
                    <ChakraLink 
                      href={book.link} 
                      isExternal 
                      _hover={{ textDecoration: 'none' }}
                      flex="1"
                    >
                      <Button
                        colorScheme="gray"
                        variant="outline"
                        size="xs"
                        width="100%"
                        rightIcon={<FaExternalLinkAlt />}
                        _hover={{ 
                          bg: 'gray.50',
                          borderColor: 'gray.300',
                          transform: 'translateY(-1px)',
                          boxShadow: 'sm'
                        }}
                        transition="all 0.2s ease"
                      >
                        Download
                      </Button>
                    </ChakraLink>
                  </HStack>
                </Box>
              </Card>
            );
          })}
        </SimpleGrid>
      )}
      <BlogSlideUp open={blogSlideUpOpen} slug={activeBlogSlug} onClose={() => setBlogSlideUpOpen(false)} />
    </Box>
  );
};

export default FreeBooks; 