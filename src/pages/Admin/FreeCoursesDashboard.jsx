import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import {
  Box,
  Heading,
  Input,
  Textarea,
  Button,
  VStack,
  HStack,
  Text,
  useToast,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Link,
  Divider,
  Icon,
  Badge,
  Select,
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
} from '@chakra-ui/react';
import { FaExternalLinkAlt, FaTrash, FaEdit } from 'react-icons/fa';

const FreeCoursesDashboard = () => {
  const { user, isAdmin } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [link, setLink] = useState('');
  const [provider, setProvider] = useState('');
  const [category, setCategory] = useState('');
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [courseToDelete, setCourseToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [courseToEdit, setCourseToEdit] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { 
    isOpen: isEditOpen, 
    onOpen: onEditOpen, 
    onClose: onEditClose 
  } = useDisclosure();
  const cancelRef = React.useRef();

  // Predefined categories for courses
  const courseCategories = [
    'Programming & Development',
    'Data Science & Analytics',
    'Web Development',
    'Mobile Development',
    'Design & UX',
    'Business & Marketing',
    'Digital Marketing',
    'Project Management',
    'Cybersecurity',
    'Cloud Computing',
    'Artificial Intelligence',
    'Machine Learning',
    'DevOps',
    'Database Management',
    'Other'
  ];

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('free_courses')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) setError(error.message);
    else setCourses(data);
    setLoading(false);
  };

  const handleDeleteCourse = async () => {
    if (!courseToDelete) return;
    
    setDeleteLoading(true);
    const { error } = await supabase
      .from('free_courses')
      .delete()
      .eq('id', courseToDelete.id);
    
    if (error) {
      toast({
        title: 'Error deleting course',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } else {
      toast({
        title: 'Course deleted successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      fetchCourses();
    }
    
    setDeleteLoading(false);
    setCourseToDelete(null);
    onClose();
  };

  const openDeleteDialog = (course) => {
    setCourseToDelete(course);
    onOpen();
  };

  const openEditDialog = (course) => {
    setCourseToEdit(course);
    onEditOpen();
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!courseToEdit) return;
    
    setEditLoading(true);
    const { error } = await supabase
      .from('free_courses')
      .update({
        title: courseToEdit.title,
        description: courseToEdit.description,
        link: courseToEdit.link,
        provider: courseToEdit.provider,
        category: courseToEdit.category,
      })
      .eq('id', courseToEdit.id);
    
    if (error) {
      toast({
        title: 'Error updating course',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } else {
      toast({
        title: 'Course updated successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      fetchCourses();
      onEditClose();
    }
    
    setEditLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!title || !description || !link || !provider || !category) {
      setError('All fields are required.');
      return;
    }
    setLoading(true);
    const { error } = await supabase.from('free_courses').insert([
      {
        title,
        description,
        link,
        provider,
        category,
      },
    ]);
    if (error) setError(error.message);
    else {
      setTitle('');
      setDescription('');
      setLink('');
      setProvider('');
      setCategory('');
      fetchCourses();
      toast({
        title: 'Course posted!',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    }
    setLoading(false);
  };

  return (
    <Box maxW="900px" mx="auto" py={10} px={4}>
      <Heading mb={8} textAlign="center" color="blue.600">Free Courses Dashboard</Heading>
      {isAdmin && (
        <Box as="form" onSubmit={handleSubmit} mb={12} p={6} borderRadius="lg" boxShadow="md" bg="white">
          <VStack spacing={4} align="stretch">
            <Heading size="md" mb={2}>Post a New Free Course</Heading>
            <Input
              type="text"
              placeholder="Course Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              size="md"
              bg="gray.50"
            />
            <Input
              type="text"
              placeholder="Course Provider"
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              size="md"
              bg="gray.50"
            />
            <Select
              placeholder="Select Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              size="md"
              bg="gray.50"
            >
              {courseCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </Select>
            <Textarea
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              bg="gray.50"
            />
            <Input
              type="url"
              placeholder="Course Link (URL)"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              size="md"
              bg="gray.50"
            />
            <Button type="submit" colorScheme="blue" isLoading={loading} size="md" alignSelf="flex-end">
              Post Course
            </Button>
            {error && <Text color="red.500">{error}</Text>}
          </VStack>
        </Box>
      )}
      <Heading size="md" mb={6} color="blue.700">Existing Free Courses</Heading>
      {loading ? (
        <Text>Loading...</Text>
      ) : courses.length === 0 ? (
        <Text>No free courses available.</Text>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
          {courses.map((course) => {
            const isNew = (Date.now() - new Date(course.created_at).getTime()) < 3 * 24 * 60 * 60 * 1000;
            return (
              <Card
                key={course.id}
                boxShadow="lg"
                borderRadius="2xl"
                bg="white"
                borderLeft="6px solid #3182ce"
                transition="transform 0.2s, box-shadow 0.2s"
                _hover={{ transform: 'translateY(-6px) scale(1.02)', boxShadow: '2xl' }}
                p={0}
              >
                <CardHeader
                  bgGradient="linear(to-r, blue.500, blue.300)"
                  color="white"
                  borderTopLeftRadius="2xl"
                  borderTopRightRadius="2xl"
                  py={4}
                  px={6}
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  flexWrap="wrap"
                >
                  <Box>
                    <Heading size="md">{course.title}</Heading>
                    <Text fontSize="sm" color="whiteAlpha.800" mt={1}>{course.provider}</Text>
                    {course.category && (
                      <Badge colorScheme="purple" mt={2} fontSize="xs">
                        {course.category}
                      </Badge>
                    )}
                  </Box>
                  <VStack align="end" spacing={1}>
                    {isNew && <Badge colorScheme="green">New</Badge>}
                    <HStack spacing={1}>
                      <IconButton
                        icon={<FaEdit />}
                        aria-label="Edit course"
                        size="sm"
                        variant="ghost"
                        color="white"
                        _hover={{ bg: 'whiteAlpha.200' }}
                        onClick={() => openEditDialog(course)}
                      />
                      <IconButton
                        icon={<FaTrash />}
                        aria-label="Delete course"
                        size="sm"
                        variant="ghost"
                        color="white"
                        _hover={{ bg: 'whiteAlpha.200' }}
                        onClick={() => openDeleteDialog(course)}
                      />
                    </HStack>
                  </VStack>
                </CardHeader>
                <CardBody px={6} py={4}>
                  <Text mb={4} color="gray.700" fontSize="md" fontWeight="medium">
                    {course.description}
                  </Text>
                  <Divider my={2} />
                  <Link href={course.link} isExternal color="blue.500" fontWeight="bold" fontSize="md">
                    Go to Course <Icon as={FaExternalLinkAlt} ml={1} />
                  </Link>
                </CardBody>
                <CardFooter px={6} py={3} bg="gray.50" borderBottomLeftRadius="2xl" borderBottomRightRadius="2xl">
                  <Text fontSize="xs" color="gray.500">
                    Posted on {new Date(course.created_at).toLocaleString()}
                  </Text>
                </CardFooter>
              </Card>
            );
          })}
        </SimpleGrid>
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
              Delete Course
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete "{courseToDelete?.title}"? This action cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button 
                colorScheme="red" 
                onClick={handleDeleteCourse} 
                ml={3}
                isLoading={deleteLoading}
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {/* Edit Course Modal */}
      <Modal isOpen={isEditOpen} onClose={onEditClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Course</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {courseToEdit && (
              <Box as="form" onSubmit={handleEditSubmit}>
                <VStack spacing={4} align="stretch">
                  <Input
                    type="text"
                    placeholder="Course Title"
                    value={courseToEdit.title}
                    onChange={(e) => setCourseToEdit({...courseToEdit, title: e.target.value})}
                    size="md"
                    bg="gray.50"
                  />
                  <Input
                    type="text"
                    placeholder="Course Provider"
                    value={courseToEdit.provider}
                    onChange={(e) => setCourseToEdit({...courseToEdit, provider: e.target.value})}
                    size="md"
                    bg="gray.50"
                  />
                  <Select
                    placeholder="Select Category"
                    value={courseToEdit.category || ''}
                    onChange={(e) => setCourseToEdit({...courseToEdit, category: e.target.value})}
                    size="md"
                    bg="gray.50"
                  >
                    {courseCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </Select>
                  <Textarea
                    placeholder="Description"
                    value={courseToEdit.description}
                    onChange={(e) => setCourseToEdit({...courseToEdit, description: e.target.value})}
                    rows={3}
                    bg="gray.50"
                  />
                  <Input
                    type="url"
                    placeholder="Course Link (URL)"
                    value={courseToEdit.link}
                    onChange={(e) => setCourseToEdit({...courseToEdit, link: e.target.value})}
                    size="md"
                    bg="gray.50"
                  />
                  <HStack justify="flex-end" spacing={3}>
                    <Button onClick={onEditClose}>Cancel</Button>
                    <Button 
                      type="submit" 
                      colorScheme="blue" 
                      isLoading={editLoading}
                    >
                      Update Course
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

export default FreeCoursesDashboard; 