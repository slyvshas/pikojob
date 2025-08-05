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
} from '@chakra-ui/react';
import { FaPlus, FaEdit, FaTrash, FaExternalLinkAlt, FaMapMarkerAlt, FaCalendarAlt, FaBook } from 'react-icons/fa';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

const OpportunitiesDashboard = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingOpportunity, setEditingOpportunity] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const { isAdmin } = useAuth();
  const cardBg = useColorModeValue('white', 'gray.800');

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    organization: '',
    location: '',
    deadline: '',
    link: '',
    blog_slug: '',
  });

  useEffect(() => {
    fetchOpportunities();
  }, []);

  const fetchOpportunities = async () => {
    try {
      const { data, error } = await supabase
        .from('opportunities')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOpportunities(data);
    } catch (error) {
      console.error('Error fetching opportunities:', error);
      toast({
        title: 'Error',
        description: 'Failed to load opportunities',
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
      if (editingOpportunity) {
        // Update existing opportunity
        const { error } = await supabase
          .from('opportunities')
          .update(formData)
          .eq('id', editingOpportunity.id);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Opportunity updated successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        // Create new opportunity
        const { error } = await supabase
          .from('opportunities')
          .insert([formData]);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Opportunity created successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }

      fetchOpportunities();
      handleClose();
    } catch (error) {
      console.error('Error saving opportunity:', error);
      toast({
        title: 'Error',
        description: 'Failed to save opportunity',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleEdit = (opportunity) => {
    setEditingOpportunity(opportunity);
    setFormData({
      title: opportunity.title,
      description: opportunity.description || '',
      category: opportunity.category,
      organization: opportunity.organization || '',
      location: opportunity.location || '',
      deadline: opportunity.deadline || '',
      link: opportunity.link || '',
      blog_slug: opportunity.blog_slug || '',
    });
    onOpen();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this opportunity?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('opportunities')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Opportunity deleted successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      fetchOpportunities();
    } catch (error) {
      console.error('Error deleting opportunity:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete opportunity',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleClose = () => {
    setEditingOpportunity(null);
    setFormData({
      title: '',
      description: '',
      category: '',
      organization: '',
      location: '',
      deadline: '',
      link: '',
      blog_slug: '',
    });
    onClose();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Format category for display
  const formatCategory = (category) => {
    return category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Get category color scheme
  const getCategoryColor = (category) => {
    const colors = {
      conferences: 'blue',
      events: 'green',
      competitions: 'purple',
      fellowship: 'orange',
      scholarship: 'teal',
      exchange_programs: 'pink'
    };
    return colors[category] || 'gray';
  };

  // Check if deadline is approaching (within 30 days)
  const isDeadlineApproaching = (deadline) => {
    if (!deadline) return false;
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const diffTime = deadlineDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30 && diffDays >= 0;
  };

  // Check if deadline has passed
  const isDeadlinePassed = (deadline) => {
    if (!deadline) return false;
    const deadlineDate = new Date(deadline);
    const now = new Date();
    return deadlineDate < now;
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
          <Heading>Opportunities Management</Heading>
          <Button
            leftIcon={<FaPlus />}
            colorScheme="blue"
            onClick={() => onOpen()}
          >
            Add Opportunity
          </Button>
        </Flex>

        {loading ? (
          <Text>Loading opportunities...</Text>
        ) : opportunities.length === 0 ? (
          <Box textAlign="center" py={10}>
            <Text fontSize="lg" color="gray.500" mb={4}>
              No opportunities found
            </Text>
            <Button colorScheme="blue" onClick={() => onOpen()}>
              Add Your First Opportunity
            </Button>
          </Box>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {opportunities.map((opportunity) => {
              const deadlineApproaching = isDeadlineApproaching(opportunity.deadline);
              const deadlinePassed = isDeadlinePassed(opportunity.deadline);
              
              return (
                <Card
                  key={opportunity.id}
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
                    {deadlineApproaching && !deadlinePassed && (
                      <Badge 
                        colorScheme="orange" 
                        variant="solid"
                        borderRadius="full"
                        px={2}
                        py={1}
                        fontSize="xs"
                        fontWeight="medium"
                      >
                        Soon
                      </Badge>
                    )}
                    {deadlinePassed && (
                      <Badge 
                        colorScheme="red" 
                        variant="solid"
                        borderRadius="full"
                        px={2}
                        py={1}
                        fontSize="xs"
                        fontWeight="medium"
                      >
                        Closed
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
                      aria-label="Edit opportunity"
                      icon={<FaEdit />}
                      colorScheme="blue"
                      variant="ghost"
                      size="sm"
                      bg="white"
                      _hover={{ bg: 'gray.50' }}
                      onClick={() => handleEdit(opportunity)}
                    />
                    <IconButton
                      aria-label="Delete opportunity"
                      icon={<FaTrash />}
                      colorScheme="red"
                      variant="ghost"
                      size="sm"
                      bg="white"
                      _hover={{ bg: 'gray.50' }}
                      onClick={() => handleDelete(opportunity.id)}
                    />
                  </Box>

                  {/* Opportunity Content */}
                  <Box p={6} pt={12}>
                    {/* Category Badge */}
                    {opportunity.category && (
                      <Badge 
                        colorScheme={getCategoryColor(opportunity.category)} 
                        variant="subtle"
                        fontSize="xs"
                        mb={3}
                        borderRadius="full"
                        px={3}
                        py={1}
                      >
                        {formatCategory(opportunity.category)}
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
                      {opportunity.title}
                    </Heading>

                    {/* Organization */}
                    {opportunity.organization && (
                      <Text 
                        fontSize="sm" 
                        color="blue.600" 
                        fontWeight="medium"
                        mb={2}
                      >
                        {opportunity.organization}
                      </Text>
                    )}

                    {/* Location */}
                    {opportunity.location && (
                      <HStack spacing={1} mb={2}>
                        <Icon as={FaMapMarkerAlt} color="gray.500" fontSize="xs" />
                        <Text fontSize="xs" color="gray.600">
                          {opportunity.location}
                        </Text>
                      </HStack>
                    )}

                    {/* Deadline */}
                    {opportunity.deadline && (
                      <HStack spacing={1} mb={3}>
                        <Icon as={FaCalendarAlt} color="gray.500" fontSize="xs" />
                        <Text fontSize="xs" color={deadlinePassed ? 'red.500' : deadlineApproaching ? 'orange.500' : 'gray.600'}>
                          Deadline: {new Date(opportunity.deadline).toLocaleDateString()}
                        </Text>
                      </HStack>
                    )}

                    {/* Description */}
                    <Text 
                      color="gray.600" 
                      fontSize="sm" 
                      lineHeight="1.5"
                      mb={4}
                      noOfLines={3}
                    >
                      {opportunity.description}
                    </Text>

                    {/* Blog Slug */}
                    {opportunity.blog_slug && (
                      <Text fontSize="xs" color="yellow.600" mb={3} fontFamily="mono">
                        Blog: {opportunity.blog_slug}
                      </Text>
                    )}

                    {/* Action Buttons */}
                    <HStack spacing={2} mt={4}>
                      {opportunity.link && (
                        <ChakraLink 
                          href={opportunity.link} 
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
                            isDisabled={deadlinePassed}
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
              {editingOpportunity ? 'Edit Opportunity' : 'Add New Opportunity'}
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
                      placeholder="Enter opportunity title"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Description</FormLabel>
                    <Textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Enter opportunity description"
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
                      <option value="conferences">Conferences</option>
                      <option value="events">Events</option>
                      <option value="competitions">Competitions</option>
                      <option value="fellowship">Fellowship</option>
                      <option value="scholarship">Scholarship</option>
                      <option value="exchange_programs">Exchange Programs</option>
                    </Select>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Organization</FormLabel>
                    <Input
                      name="organization"
                      value={formData.organization}
                      onChange={handleInputChange}
                      placeholder="Enter organization name"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Location</FormLabel>
                    <Input
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="Enter location"
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Deadline</FormLabel>
                    <Input
                      name="deadline"
                      type="date"
                      value={formData.deadline}
                      onChange={handleInputChange}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Application Link</FormLabel>
                    <Input
                      name="link"
                      value={formData.link}
                      onChange={handleInputChange}
                      placeholder="Enter application URL"
                      type="url"
                    />
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
                  {editingOpportunity ? 'Update' : 'Create'} Opportunity
                </Button>
              </ModalFooter>
            </form>
          </ModalContent>
        </Modal>
      </VStack>
    </Container>
  );
};

export default OpportunitiesDashboard; 