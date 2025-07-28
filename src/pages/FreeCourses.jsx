import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Link as ChakraLink,
  Divider,
  Icon,
  Badge,
  VStack,
  HStack,
  Checkbox,
  CheckboxGroup,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Button,
  Flex,
  useColorModeValue,
  Collapse,
  useDisclosure,
} from '@chakra-ui/react';
import { FaExternalLinkAlt, FaFilter, FaTimes } from 'react-icons/fa';

const FreeCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const { isOpen, onToggle } = useDisclosure();
  const cardBg = useColorModeValue('white', 'gray.800');

  // Get filter values from URL
  const selectedCategories = searchParams.get('categories')?.split(',').filter(Boolean) || [];
  const selectedProviders = searchParams.get('providers')?.split(',').filter(Boolean) || [];

  // Extract unique categories and providers from courses
  const { categories, providers } = useMemo(() => {
    const uniqueCategories = [...new Set(courses.map(course => course.category).filter(Boolean))].sort();
    const uniqueProviders = [...new Set(courses.map(course => course.provider).filter(Boolean))].sort();
    return { categories: uniqueCategories, providers: uniqueProviders };
  }, [courses]);

  useEffect(() => {
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
    fetchCourses();
  }, []);

  // Filter courses based on selected filters
  const filteredCourses = useMemo(() => {
    return courses.filter(course => {
      const categoryMatch = selectedCategories.length === 0 || selectedCategories.includes(course.category);
      const providerMatch = selectedProviders.length === 0 || selectedProviders.includes(course.provider);
      return categoryMatch && providerMatch;
    });
  }, [courses, selectedCategories, selectedProviders]);

  // Update URL when filters change
  const updateFilters = (type, values) => {
    const newParams = new URLSearchParams(searchParams);
    
    if (values.length === 0) {
      newParams.delete(type);
    } else {
      newParams.set(type, values.join(','));
    }
    
    setSearchParams(newParams);
  };

  const handleCategoryChange = (values) => {
    updateFilters('categories', values);
  };

  const handleProviderChange = (values) => {
    updateFilters('providers', values);
  };

  const clearAllFilters = () => {
    setSearchParams({});
  };

  return (
    <Box maxW="1200px" mx="auto" py={10} px={4}>
      <Heading mb={8} textAlign="center" color="blue.600">Free Courses</Heading>
      
      {/* Filter Section */}
      <Box mb={8} bg={cardBg} borderRadius="lg" boxShadow="md" p={4}>
        <Flex justify="space-between" align="center" mb={4}>
          <HStack>
            <Icon as={FaFilter} color="blue.500" />
            <Text fontWeight="bold">Filters</Text>
            {(selectedCategories.length > 0 || selectedProviders.length > 0) && (
              <Badge colorScheme="blue" variant="subtle">
                {selectedCategories.length + selectedProviders.length} active
              </Badge>
            )}
          </HStack>
          <HStack>
            {(selectedCategories.length > 0 || selectedProviders.length > 0) && (
              <Button
                size="sm"
                variant="ghost"
                leftIcon={<FaTimes />}
                onClick={clearAllFilters}
                colorScheme="red"
              >
                Clear All
              </Button>
            )}
            <Button size="sm" onClick={onToggle} variant="outline">
              {isOpen ? 'Hide' : 'Show'} Filters
            </Button>
          </HStack>
        </Flex>
        
        <Collapse in={isOpen}>
          <Accordion allowMultiple>
            {/* Categories Filter */}
            <AccordionItem>
              <AccordionButton>
                <Box flex="1" textAlign="left">
                  <Text fontWeight="semibold">Categories</Text>
                  {selectedCategories.length > 0 && (
                    <Text fontSize="sm" color="gray.500">
                      {selectedCategories.length} selected
                    </Text>
                  )}
                </Box>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel>
                <CheckboxGroup value={selectedCategories} onChange={handleCategoryChange}>
                  <VStack align="start" spacing={2}>
                    {categories.map((category) => (
                      <Checkbox key={category} value={category}>
                        {category}
                      </Checkbox>
                    ))}
                  </VStack>
                </CheckboxGroup>
              </AccordionPanel>
            </AccordionItem>

            {/* Providers Filter */}
            <AccordionItem>
              <AccordionButton>
                <Box flex="1" textAlign="left">
                  <Text fontWeight="semibold">Providers</Text>
                  {selectedProviders.length > 0 && (
                    <Text fontSize="sm" color="gray.500">
                      {selectedProviders.length} selected
                    </Text>
                  )}
                </Box>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel>
                <CheckboxGroup value={selectedProviders} onChange={handleProviderChange}>
                  <VStack align="start" spacing={2}>
                    {providers.map((provider) => (
                      <Checkbox key={provider} value={provider}>
                        {provider}
                      </Checkbox>
                    ))}
                  </VStack>
                </CheckboxGroup>
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
        </Collapse>
      </Box>

      {/* Results Summary */}
      <Flex justify="space-between" align="center" mb={6}>
        <Text color="gray.600">
          Showing {filteredCourses.length} of {courses.length} courses
        </Text>
        {(selectedCategories.length > 0 || selectedProviders.length > 0) && (
          <HStack spacing={2}>
            {selectedCategories.map((category) => (
              <Badge key={category} colorScheme="blue" variant="subtle">
                {category}
              </Badge>
            ))}
            {selectedProviders.map((provider) => (
              <Badge key={provider} colorScheme="green" variant="subtle">
                {provider}
              </Badge>
            ))}
          </HStack>
        )}
      </Flex>

      {loading ? (
        <Text>Loading...</Text>
      ) : error ? (
        <Text color="red.500">{error}</Text>
      ) : filteredCourses.length === 0 ? (
        <Box textAlign="center" py={10}>
          <Text fontSize="lg" color="gray.500" mb={4}>
            No courses match your current filters
          </Text>
          {(selectedCategories.length > 0 || selectedProviders.length > 0) && (
            <Button onClick={clearAllFilters} colorScheme="blue">
              Clear Filters
            </Button>
          )}
        </Box>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
          {filteredCourses.map((course) => {
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
                  </VStack>
                </CardHeader>
                <CardBody px={6} py={4}>
                  <Text mb={4} color="gray.700" fontSize="md" fontWeight="medium">
                    {course.description}
                  </Text>
                  <Divider my={2} />
                  <ChakraLink href={course.link} isExternal color="blue.500" fontWeight="bold" fontSize="md">
                    Go to Course <Icon as={FaExternalLinkAlt} ml={1} />
                  </ChakraLink>
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
    </Box>
  );
};

export default FreeCourses; 