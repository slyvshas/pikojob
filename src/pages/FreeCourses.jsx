import React, { useEffect, useState, useMemo } from 'react';
import { Wrap, WrapItem } from '@chakra-ui/react';
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
  IconButton,
  useToast,
} from '@chakra-ui/react';
import { FaExternalLinkAlt, FaFilter, FaTimes, FaBookmark, FaRegBookmark, FaBook } from 'react-icons/fa';
import BlogSlideUp from '../components/BlogSlideUp';
import { useAuth } from '../context/AuthContext';

const FreeCourses = () => {
  const [courses, setCourses] = useState([]);
  const [savedCourses, setSavedCourses] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const { isOpen, onToggle } = useDisclosure();
  const cardBg = useColorModeValue('white', 'gray.800');
  const { isAdmin, user } = useAuth();
  const [blogSlideUpOpen, setBlogSlideUpOpen] = useState(false);
  const [activeBlogSlug, setActiveBlogSlug] = useState(null);
  const toast = useToast();

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
    
    if (user) {
      fetchSavedCourses();
    }
  }, [user]);

  const fetchSavedCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('saved_courses')
        .select('course_id')
        .eq('user_id', user.id);

      if (error) throw error;

      const savedCourseIds = new Set(data.map(item => item.course_id));
      setSavedCourses(savedCourseIds);
    } catch (error) {
      console.error('Error fetching saved courses:', error);
    }
  };

  const handleSaveCourse = async (courseId) => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to save courses',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      if (savedCourses.has(courseId)) {
        // Unsave course
        const { error } = await supabase
          .from('saved_courses')
          .delete()
          .eq('user_id', user.id)
          .eq('course_id', courseId);

        if (error) throw error;

        setSavedCourses(prev => {
          const newSet = new Set(prev);
          newSet.delete(courseId);
          return newSet;
        });

        toast({
          title: 'Course Unsaved',
          description: 'Course has been removed from your saved courses',
          status: 'info',
          duration: 3000,
          isClosable: true,
        });
      } else {
        // Save course
        const { error } = await supabase
          .from('saved_courses')
          .insert({
            user_id: user.id,
            course_id: courseId,
          });

        if (error) throw error;

        setSavedCourses(prev => new Set([...prev, courseId]));

        toast({
          title: 'Course Saved',
          description: 'Course has been added to your saved courses',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error saving/unsaving course:', error);
      toast({
        title: 'Error',
        description: 'Failed to save/unsave course',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

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
        <Flex
          justify="space-between"
          align="center"
          mb={4}
          flexWrap="wrap"
          gap={2}
        >
          <HStack flexWrap="wrap" gap={2} minWidth={0}>
            <Icon as={FaFilter} color="blue.500" />
            <Text fontWeight="bold">Filters</Text>
            {(selectedCategories.length > 0 || selectedProviders.length > 0) && (
              <Badge colorScheme="blue" variant="subtle">
                {selectedCategories.length + selectedProviders.length} active
              </Badge>
            )}
          </HStack>
          <HStack flexWrap="wrap" gap={2} minWidth={0}>
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
      <Flex justify="space-between" align="center" mb={6} flexWrap="wrap" gap={2}>
  <Text color="gray.600" mb={2}>
    Showing {filteredCourses.length} of {courses.length} courses
  </Text>
  {(selectedCategories.length > 0 || selectedProviders.length > 0) && (
    <Wrap spacing={2} minWidth={0}>
      {selectedCategories.map((category) => (
        <WrapItem key={category}>
          <Badge colorScheme="blue" variant="subtle">
            {category}
          </Badge>
        </WrapItem>
      ))}
      {selectedProviders.map((provider) => (
        <WrapItem key={provider}>
          <Badge colorScheme="green" variant="subtle">
            {provider}
          </Badge>
        </WrapItem>
      ))}
    </Wrap>
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
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {filteredCourses.map((course) => {
            const isNew = (Date.now() - new Date(course.created_at).getTime()) < 3 * 24 * 60 * 60 * 1000;
            return (
              <Card
                key={course.id}
                bg="white"
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

                 {/* Save Button */}
                 <Box
                   position="absolute"
                   top={3}
                   left={3}
                   zIndex={2}
                 >
                   <IconButton
                     aria-label={savedCourses.has(course.id) ? 'Unsave course' : 'Save course'}
                     icon={savedCourses.has(course.id) ? <FaBookmark /> : <FaRegBookmark />}
                     colorScheme={savedCourses.has(course.id) ? 'blue' : 'gray'}
                     variant="ghost"
                     size="sm"
                     bg="white"
                     _hover={{ bg: 'gray.50' }}
                     onClick={() => handleSaveCourse(course.id)}
                   />
                 </Box>

                 {/* Course Content */}
                 <Box p={6} pt={12}>
                   {/* Category Badge */}
                    {course.category && (
                     <Badge 
                       colorScheme="blue" 
                       variant="subtle"
                       fontSize="xs"
                       mb={3}
                       borderRadius="full"
                       px={3}
                       py={1}
                     >
                        {course.category}
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
                    {course.title}
                  </Heading>

                  {/* Provider */}
                  <Text 
                    fontSize="sm" 
                    color="blue.600" 
                    fontWeight="medium"
                    mb={3}
                  >
                    {course.provider}
                      </Text>

                  {/* Description */}
                  <Text 
                    color="gray.600" 
                    fontSize="sm" 
                    lineHeight="1.5"
                    mb={4}
                    noOfLines={3}
                  >
                    {course.description}
                  </Text>

                  {/* Admin Blog Slug */}
                  {isAdmin && course.blog_slug && (
                    <Text fontSize="xs" color="yellow.600" mb={3} fontFamily="mono">
                      Blog: {course.blog_slug}
                    </Text>
                  )}

                                                        {/* Buttons Row */}
                   <HStack spacing={2} mt={4}>
                                           {/* Blog Info Button - Prioritized */}
                      {course.blog_slug && (
                        <Button
                          size="sm"
                          colorScheme="blue"
                          variant="solid"
                          flex={1}
                          leftIcon={<FaBook />}
                          onClick={() => { 
                            setActiveBlogSlug(course.blog_slug); 
                            setBlogSlideUpOpen(true); 
                          }}
                          _hover={{ 
                            bg: 'blue.600',
                            transform: 'translateY(-1px)'
                          }}
                          boxShadow="md"
                        >
                          Learn More
                        </Button>
                      )}

                      {/* Course Link - Compact */}
                      <ChakraLink 
                        href={course.link} 
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
                          Access Only
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

export default FreeCourses; 