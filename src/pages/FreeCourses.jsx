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
  Select,
} from '@chakra-ui/react';
import { FaExternalLinkAlt, FaFilter, FaTimes, FaBook, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import BlogSlideUp from '../components/BlogSlideUp';
import { useAuth } from '../context/AuthContext';
import { keyframes } from '@emotion/react';

// Logo slider animation
const scroll = keyframes`
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
`;

// University and platform logos data
const partnerLogos = [
  // Ivy League Universities
  { name: 'Harvard University', logo: 'https://upload.wikimedia.org/wikipedia/commons/c/cc/Harvard_University_coat_of_arms.svg' },
  { name: 'Yale University', logo: 'https://upload.wikimedia.org/wikipedia/commons/6/6e/Yale_University_logo.svg' },
  { name: 'Princeton University', logo: 'https://upload.wikimedia.org/wikipedia/commons/d/d0/Princeton_seal.svg' },
  { name: 'Columbia University', logo: 'https://upload.wikimedia.org/wikipedia/commons/e/ef/Columbia_coat_of_arms_no_crest.png' },
  { name: 'MIT', logo: 'https://upload.wikimedia.org/wikipedia/en/4/44/MIT_Seal.svg' },
  { name: 'Stanford University', logo: 'https://upload.wikimedia.org/wikipedia/commons/b/b5/Seal_of_Leland_Stanford_Junior_University.svg' },
  // Course Platforms
  { name: 'Coursera', logo: 'https://upload.wikimedia.org/wikipedia/commons/9/97/Coursera-Logo_600x600.svg' },
  { name: 'edX', logo: 'https://upload.wikimedia.org/wikipedia/commons/8/8f/EdX.svg' },
  { name: 'Udemy', logo: 'https://upload.wikimedia.org/wikipedia/commons/e/e3/Udemy_logo.svg' },
  { name: 'Khan Academy', logo: 'https://upload.wikimedia.org/wikipedia/commons/e/e5/Khan_Academy_Logo_Old_version_2015.png' },
  { name: 'LinkedIn Learning', logo: 'https://upload.wikimedia.org/wikipedia/commons/c/ca/LinkedIn_logo_initials.png' },
  { name: 'Google', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg' },
];

const FreeCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const { isOpen, onToggle } = useDisclosure();
  const cardBg = useColorModeValue('white', 'gray.800');
  const [blogSlideUpOpen, setBlogSlideUpOpen] = useState(false);
  const [activeBlogSlug, setActiveBlogSlug] = useState(null);
  const toast = useToast();
  const { isAdmin } = useAuth();

  // Pagination state
  const ITEMS_PER_PAGE_OPTIONS = [9, 18, 27, 36];
  const [itemsPerPage, setItemsPerPage] = useState(9);
  const currentPage = parseInt(searchParams.get('page')) || 1;

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
        .select('id, title, provider, link, category, description, created_at')
        .order('created_at', { ascending: false })
        .limit(2000); // Set limit higher than current record count to get all courses
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

  // Pagination calculations
  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCourses = filteredCourses.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      const newParams = new URLSearchParams(searchParams);
      newParams.set('page', '1');
      setSearchParams(newParams);
    }
  }, [filteredCourses.length, itemsPerPage, currentPage, totalPages, searchParams, setSearchParams]);

  // Update URL when filters change
  const updateFilters = (type, values) => {
    const newParams = new URLSearchParams(searchParams);
    
    if (values.length === 0) {
      newParams.delete(type);
    } else {
      newParams.set(type, values.join(','));
    }
    
    // Reset to page 1 when filters change
    newParams.set('page', '1');
    
    setSearchParams(newParams);
  };

  const handlePageChange = (newPage) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', newPage.toString());
    setSearchParams(newParams);
    // Scroll to top of page
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(parseInt(e.target.value));
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handleCategoryChange = (values) => {
    updateFilters('categories', values);
  };

  const handleProviderChange = (values) => {
    updateFilters('providers', values);
  };

  const clearAllFilters = () => {
    const newParams = new URLSearchParams();
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  return (
    <Box maxW="1200px" mx="auto" py={10} px={4}>
      
      {/* Trusted Partners Text */}
      <Text textAlign="center" color="gray.500" fontSize="sm" mb={4}>
        Courses from world-class universities and platforms
      </Text>

      {/* Logo Slider */}
      <Box 
        mb={10} 
        overflow="hidden" 
        position="relative"
        py={4}
        _before={{
          content: '""',
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: '80px',
          background: 'linear-gradient(to right, white, transparent)',
          zIndex: 2,
        }}
        _after={{
          content: '""',
          position: 'absolute',
          right: 0,
          top: 0,
          bottom: 0,
          width: '80px',
          background: 'linear-gradient(to left, white, transparent)',
          zIndex: 2,
        }}
      >
        <Flex
          animation={`${scroll} 30s linear infinite`}
          width="fit-content"
          _hover={{ animationPlayState: 'paused' }}
        >
          {/* Double the logos for seamless infinite scroll */}
          {[...partnerLogos, ...partnerLogos].map((partner, index) => (
            <Box
              key={`${partner.name}-${index}`}
              mx={6}
              minW="100px"
              display="flex"
              alignItems="center"
              justifyContent="center"
              opacity={0.7}
              transition="all 0.3s"
              _hover={{ opacity: 1, transform: 'scale(1.1)' }}
              title={partner.name}
            >
              <Box
                as="img"
                src={partner.logo}
                alt={partner.name}
                maxH="45px"
                maxW="100px"
                objectFit="contain"
                filter="grayscale(100%)"
                _hover={{ filter: 'grayscale(0%)' }}
                transition="filter 0.3s"
              />
            </Box>
          ))}
        </Flex>
      </Box>
      
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
  <HStack spacing={4} flexWrap="wrap">
    <Text color="gray.600">
      Showing {filteredCourses.length > 0 ? startIndex + 1 : 0}-{Math.min(endIndex, filteredCourses.length)} of {filteredCourses.length} courses
    </Text>
    <HStack>
      <Text fontSize="sm" color="gray.500">Per page:</Text>
      <Select 
        size="sm" 
        w="70px" 
        value={itemsPerPage} 
        onChange={handleItemsPerPageChange}
      >
        {ITEMS_PER_PAGE_OPTIONS.map(opt => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </Select>
    </HStack>
  </HStack>
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
        <>
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {paginatedCourses.map((course) => {
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

                 {/* Course Content */}
                 <Box p={6} pt={12} display="flex" flexDirection="column" height="100%">
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
                    flex="1"
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
                   <HStack spacing={2} mt="auto">
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
                          colorScheme="blue"
                          variant="solid"
                          size="sm"
                          width="100%"
                          rightIcon={<FaExternalLinkAlt />}
                          _hover={{ 
                            transform: 'translateY(-2px)',
                            boxShadow: 'md'
                          }}
                        >
                          Enroll Now
                        </Button>
                  </ChakraLink>
                   </HStack>
                </Box>
              </Card>
            );
          })}
        </SimpleGrid>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <Flex 
            justify="center" 
            align="center" 
            mt={10} 
            flexWrap="wrap" 
            gap={2}
          >
            <Button
              size="sm"
              variant="outline"
              leftIcon={<FaChevronLeft />}
              onClick={() => handlePageChange(currentPage - 1)}
              isDisabled={currentPage === 1}
              colorScheme="blue"
            >
              Previous
            </Button>
            
            <HStack spacing={1}>
              {getPageNumbers().map((page, index) => (
                page === '...' ? (
                  <Text key={`ellipsis-${index}`} px={2} color="gray.500">...</Text>
                ) : (
                  <Button
                    key={page}
                    size="sm"
                    variant={currentPage === page ? 'solid' : 'outline'}
                    colorScheme="blue"
                    onClick={() => handlePageChange(page)}
                    minW="40px"
                  >
                    {page}
                  </Button>
                )
              ))}
            </HStack>
            
            <Button
              size="sm"
              variant="outline"
              rightIcon={<FaChevronRight />}
              onClick={() => handlePageChange(currentPage + 1)}
              isDisabled={currentPage === totalPages}
              colorScheme="blue"
            >
              Next
            </Button>
          </Flex>
        )}
        </>
      )}
      <BlogSlideUp open={blogSlideUpOpen} slug={activeBlogSlug} onClose={() => setBlogSlideUpOpen(false)} />
    </Box>
  );
};

export default FreeCourses; 