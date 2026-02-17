import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Input,
  Select,
  SimpleGrid,
  Spinner,
  Center,
  Alert,
  AlertIcon,
  InputGroup,
  InputLeftElement,
  VStack,
  HStack,
  Badge,
  useToast,
  Button,
  useColorModeValue,
  Flex,
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import { supabase } from '../lib/supabase';
import WorkflowCard from '../components/WorkflowCard';
import DisplayAd from '../components/DisplayAd';

const N8nWorkflows = () => {
  const [workflows, setWorkflows] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [filteredWorkflows, setFilteredWorkflows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [workflowsPerPage] = useState(12);
  const [error, setError] = useState(null);
  const toast = useToast();

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterWorkflows();
  }, [workflows, searchTerm, selectedCategory]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('N8n Workflows: Starting data fetch...');

      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      console.log('N8n Workflows: Categories result:', { categoriesData, categoriesError });

      if (categoriesError) {
        console.error('Categories error:', categoriesError);
        throw categoriesError;
      }

      // Fetch workflows with category information
      const { data: workflowsData, error: workflowsError } = await supabase
        .from('workflows')
        .select(`
          *,
          categories (
            id,
            name,
            slug
          )
        `)
        .order('created_at', { ascending: false });

      console.log('N8n Workflows: Workflows result:', { workflowsData, workflowsError });

      if (workflowsError) {
        console.error('Workflows error:', workflowsError);
        throw workflowsError;
      }

      console.log('N8n Workflows: Setting data - categories:', categoriesData?.length, 'workflows:', workflowsData?.length);

      setCategories(categoriesData || []);
      setWorkflows(workflowsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(`Failed to load workflows: ${error.message}`);
      toast({
        title: 'Error',
        description: `Failed to load workflows: ${error.message}`,
        status: 'error',
        duration: 10000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const filterWorkflows = () => {
    let filtered = workflows;

    // Filter by search term
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(workflow => 
        workflow.title.toLowerCase().includes(search) ||
        workflow.description?.toLowerCase().includes(search) ||
        workflow.tools_used?.some(tool => tool.toLowerCase().includes(search))
      );
    }

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(workflow => 
        workflow.categories?.slug === selectedCategory
      );
    }

    setFilteredWorkflows(filtered);
    setCurrentPage(1); // Reset to first page when filtering
  };

  // Calculate pagination
  const indexOfLastWorkflow = currentPage * workflowsPerPage;
  const indexOfFirstWorkflow = indexOfLastWorkflow - workflowsPerPage;
  const currentWorkflows = filteredWorkflows.slice(indexOfFirstWorkflow, indexOfLastWorkflow);
  const totalPages = Math.ceil(filteredWorkflows.length / workflowsPerPage);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCategorySelect = (categorySlug) => {
    setSelectedCategory(categorySlug);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <Center py={20}>
        <VStack spacing={4}>
          <Spinner size="xl" color="green.500" thickness="4px" />
          <Text>Loading N8N workflows...</Text>
        </VStack>
      </Center>
    );
  }

  if (error) {
    return (
      <Container maxW="container.xl" py={8}>
        <Alert status="error">
          <AlertIcon />
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Box bg={bgColor} minH="100vh" py={8}>
      <Container maxW="container.xl">
        {/* Header */}
        <VStack spacing={6} align="stretch" mb={8}>
          <VStack spacing={4} textAlign="center">
            <Heading 
              size="2xl" 
              bgGradient="linear(to-r, green.400, green.600, blue.500)"
              bgClip="text"
              fontWeight="extrabold"
            >
              N8N Workflow Templates
            </Heading>
            <Text fontSize="lg" color="gray.600" maxW="2xl">
              Discover and import powerful automation workflows for n8n. 
              Browse our collection of ready-to-use templates to accelerate your automation journey.
            </Text>
          </VStack>

          {/* Search and Filters */}
          <Box bg={cardBg} p={6} borderRadius="xl" shadow="sm">
            <VStack spacing={4}>
              <HStack w="full" spacing={4}>
                <InputGroup flex="2">
                  <InputLeftElement>
                    <SearchIcon color="gray.400" />
                  </InputLeftElement>
                  <Input
                    placeholder="Search workflows, tools, descriptions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    bg={bgColor}
                    border="2px"
                    borderColor="gray.200"
                    _hover={{ borderColor: 'green.300' }}
                    _focus={{ borderColor: 'green.500', boxShadow: '0 0 0 1px green.500' }}
                  />
                </InputGroup>
                <Select
                  placeholder="All Categories"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  bg={bgColor}
                  border="2px"
                  borderColor="gray.200"
                  _hover={{ borderColor: 'green.300' }}
                  _focus={{ borderColor: 'green.500', boxShadow: '0 0 0 1px green.500' }}
                  flex="1"
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.slug}>
                      {category.name}
                    </option>
                  ))}
                </Select>
              </HStack>

              {/* Active Filters */}
              {(searchTerm || selectedCategory) && (
                <HStack spacing={3} w="full" flexWrap="wrap">
                  <Text fontSize="sm" color="gray.600">Active filters:</Text>
                  {searchTerm && (
                    <Badge colorScheme="green" variant="subtle">
                      Search: {searchTerm}
                    </Badge>
                  )}
                  {selectedCategory && (
                    <Badge colorScheme="blue" variant="subtle">
                      Category: {categories.find(cat => cat.slug === selectedCategory)?.name}
                    </Badge>
                  )}
                  <Button size="xs" variant="ghost" onClick={clearFilters}>
                    Clear All
                  </Button>
                </HStack>
              )}

              <HStack spacing={3} w="full" justify="space-between" align="center">
                <Text fontSize="sm" color="gray.600">
                  {filteredWorkflows.length} workflow{filteredWorkflows.length !== 1 ? 's' : ''} found
                </Text>
                <HStack spacing={2} flexWrap="wrap">
                  <Text fontSize="sm" color="gray.500">Filter by category:</Text>
                  {categories.slice(0, 6).map((category) => (
                    <Button
                      key={category.id}
                      size="xs"
                      variant={selectedCategory === category.slug ? 'solid' : 'outline'}
                      colorScheme="green"
                      onClick={() => handleCategorySelect(category.slug)}
                    >
                      {category.name}
                    </Button>
                  ))}
                </HStack>
              </HStack>
            </VStack>
          </Box>
        </VStack>

        {/* Workflows Grid */}
        {currentWorkflows.length > 0 ? (
          <VStack spacing={8}>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} w="full">
              {currentWorkflows.map((workflow) => (
                <WorkflowCard key={workflow.id} workflow={workflow} />
              ))}
            </SimpleGrid>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <Flex justify="center" align="center" mt={8} gap={2} flexWrap="wrap">
                <Button
                  onClick={() => paginate(currentPage - 1)}
                  isDisabled={currentPage === 1}
                  variant="outline"
                  size="sm"
                >
                  Previous
                </Button>
                
                {/* Page numbers */}
                {Array.from({ length: totalPages }, (_, index) => {
                  const pageNum = index + 1;
                  const isCurrentPage = pageNum === currentPage;
                  
                  // Show first page, last page, current page, and pages around current
                  const showPage = 
                    pageNum === 1 ||
                    pageNum === totalPages ||
                    (pageNum >= currentPage - 2 && pageNum <= currentPage + 2);
                  
                  if (!showPage) {
                    // Show ellipsis for gaps
                    if (pageNum === currentPage - 3 || pageNum === currentPage + 3) {
                      return <Text key={pageNum} color="gray.500">...</Text>;
                    }
                    return null;
                  }
                  
                  return (
                    <Button
                      key={pageNum}
                      onClick={() => paginate(pageNum)}
                      variant={isCurrentPage ? "solid" : "outline"}
                      colorScheme={isCurrentPage ? "green" : "gray"}
                      size="sm"
                      minW="40px"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
                
                <Button
                  onClick={() => paginate(currentPage + 1)}
                  isDisabled={currentPage === totalPages}
                  variant="outline"
                  size="sm"
                >
                  Next
                </Button>
                
                {/* Page info */}
                <Text fontSize="sm" color="gray.600" ml={4}>
                  Page {currentPage} of {totalPages} 
                  ({filteredWorkflows.length} total workflows)
                </Text>
              </Flex>
            )}
          </VStack>
        ) : (
          <Center py={16}>
            <VStack spacing={4} textAlign="center">
              <Text fontSize="lg" color="gray.500">
                No workflows found matching your criteria.
              </Text>
              <Text fontSize="sm" color="gray.400">
                Try adjusting your search terms or filters.
              </Text>
              {(searchTerm || selectedCategory) && (
                <Button colorScheme="green" variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              )}n            </VStack>
          </Center>
        )}

        {/* Display Ad - After Workflow Grid */}
        <DisplayAd />
      </Container>
    </Box>
  );
};

export default N8nWorkflows;