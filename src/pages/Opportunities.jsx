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
  Link as ChakraLink,
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
import { FaExternalLinkAlt, FaFilter, FaTimes, FaBookmark, FaRegBookmark, FaBook, FaCalendarAlt, FaMapMarkerAlt } from 'react-icons/fa';
import BlogSlideUp from '../components/BlogSlideUp';
import { useAuth } from '../context/AuthContext';

const Opportunities = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [savedOpportunities, setSavedOpportunities] = useState(new Set());
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
  const selectedOrganizations = searchParams.get('organizations')?.split(',').filter(Boolean) || [];

  // Extract unique categories and organizations from opportunities
  const { categories, organizations } = useMemo(() => {
    const uniqueCategories = [...new Set(opportunities.map(opp => opp.category).filter(Boolean))].sort();
    const uniqueOrganizations = [...new Set(opportunities.map(opp => opp.organization).filter(Boolean))].sort();
    return { categories: uniqueCategories, organizations: uniqueOrganizations };
  }, [opportunities]);

  useEffect(() => {
    const fetchOpportunities = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('opportunities')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) setError(error.message);
      else setOpportunities(data);
      setLoading(false);
    };
    fetchOpportunities();
    
    if (user) {
      fetchSavedOpportunities();
    }
  }, [user]);

  const fetchSavedOpportunities = async () => {
    try {
      const { data, error } = await supabase
        .from('saved_opportunities')
        .select('opportunity_id')
        .eq('user_id', user.id);

      if (error) throw error;

      const savedOpportunityIds = new Set(data.map(item => item.opportunity_id));
      setSavedOpportunities(savedOpportunityIds);
    } catch (error) {
      console.error('Error fetching saved opportunities:', error);
    }
  };

  const handleSaveOpportunity = async (opportunityId) => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to save opportunities',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      if (savedOpportunities.has(opportunityId)) {
        // Unsave opportunity
        const { error } = await supabase
          .from('saved_opportunities')
          .delete()
          .eq('user_id', user.id)
          .eq('opportunity_id', opportunityId);

        if (error) throw error;

        setSavedOpportunities(prev => {
          const newSet = new Set(prev);
          newSet.delete(opportunityId);
          return newSet;
        });

        toast({
          title: 'Opportunity Unsaved',
          description: 'Opportunity has been removed from your saved opportunities',
          status: 'info',
          duration: 3000,
          isClosable: true,
        });
      } else {
        // Save opportunity
        const { error } = await supabase
          .from('saved_opportunities')
          .insert({
            user_id: user.id,
            opportunity_id: opportunityId,
          });

        if (error) throw error;

        setSavedOpportunities(prev => new Set([...prev, opportunityId]));

        toast({
          title: 'Opportunity Saved',
          description: 'Opportunity has been added to your saved opportunities',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error saving/unsaving opportunity:', error);
      toast({
        title: 'Error',
        description: 'Failed to save/unsave opportunity',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Filter opportunities based on selected filters
  const filteredOpportunities = useMemo(() => {
    return opportunities.filter(opportunity => {
      const categoryMatch = selectedCategories.length === 0 || selectedCategories.includes(opportunity.category);
      const organizationMatch = selectedOrganizations.length === 0 || selectedOrganizations.includes(opportunity.organization);
      return categoryMatch && organizationMatch;
    });
  }, [opportunities, selectedCategories, selectedOrganizations]);

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

  const handleOrganizationChange = (values) => {
    updateFilters('organizations', values);
  };

  const clearAllFilters = () => {
    setSearchParams({});
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

  return (
    <Box maxW="1200px" mx="auto" py={10} px={4}>
      <Heading mb={8} textAlign="center" color="blue.600">Opportunities</Heading>
      
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
            {(selectedCategories.length > 0 || selectedOrganizations.length > 0) && (
              <Badge colorScheme="blue" variant="subtle">
                {selectedCategories.length + selectedOrganizations.length} active
              </Badge>
            )}
          </HStack>
          <HStack flexWrap="wrap" gap={2} minWidth={0}>
            {(selectedCategories.length > 0 || selectedOrganizations.length > 0) && (
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
                        {formatCategory(category)}
                      </Checkbox>
                    ))}
                  </VStack>
                </CheckboxGroup>
              </AccordionPanel>
            </AccordionItem>

            {/* Organizations Filter */}
            <AccordionItem>
              <AccordionButton>
                <Box flex="1" textAlign="left">
                  <Text fontWeight="semibold">Organizations</Text>
                  {selectedOrganizations.length > 0 && (
                    <Text fontSize="sm" color="gray.500">
                      {selectedOrganizations.length} selected
                    </Text>
                  )}
                </Box>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel>
                <CheckboxGroup value={selectedOrganizations} onChange={handleOrganizationChange}>
                  <VStack align="start" spacing={2}>
                    {organizations.map((organization) => (
                      <Checkbox key={organization} value={organization}>
                        {organization}
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
          Showing {filteredOpportunities.length} of {opportunities.length} opportunities
        </Text>
        {(selectedCategories.length > 0 || selectedOrganizations.length > 0) && (
          <Wrap spacing={2} minWidth={0}>
            {selectedCategories.map((category) => (
              <WrapItem key={category}>
                <Badge colorScheme="blue" variant="subtle">
                  {formatCategory(category)}
                </Badge>
              </WrapItem>
            ))}
            {selectedOrganizations.map((organization) => (
              <WrapItem key={organization}>
                <Badge colorScheme="green" variant="subtle">
                  {organization}
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
      ) : filteredOpportunities.length === 0 ? (
        <Box textAlign="center" py={10}>
          <Text fontSize="lg" color="gray.500" mb={4}>
            No opportunities match your current filters
          </Text>
          {(selectedCategories.length > 0 || selectedOrganizations.length > 0) && (
            <Button onClick={clearAllFilters} colorScheme="blue">
              Clear Filters
            </Button>
          )}
        </Box>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {filteredOpportunities.map((opportunity) => {
            const isNew = (Date.now() - new Date(opportunity.created_at).getTime()) < 3 * 24 * 60 * 60 * 1000;
            const deadlineApproaching = isDeadlineApproaching(opportunity.deadline);
            const deadlinePassed = isDeadlinePassed(opportunity.deadline);
            
            return (
              <Card
                key={opportunity.id}
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

                {/* Save Button */}
                <Box
                  position="absolute"
                  top={3}
                  left={3}
                  zIndex={2}
                >
                  <IconButton
                    aria-label={savedOpportunities.has(opportunity.id) ? 'Unsave opportunity' : 'Save opportunity'}
                    icon={savedOpportunities.has(opportunity.id) ? <FaBookmark /> : <FaRegBookmark />}
                    colorScheme={savedOpportunities.has(opportunity.id) ? 'blue' : 'gray'}
                    variant="ghost"
                    size="sm"
                    bg="white"
                    _hover={{ bg: 'gray.50' }}
                    onClick={() => handleSaveOpportunity(opportunity.id)}
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

                  {/* Admin Blog Slug */}
                  {isAdmin && opportunity.blog_slug && (
                    <Text fontSize="xs" color="yellow.600" mb={3} fontFamily="mono">
                      Blog: {opportunity.blog_slug}
                    </Text>
                  )}

                  {/* Buttons Row */}
                  <HStack spacing={2} mt={4}>
                    {/* Blog Info Button - Prioritized */}
                    {opportunity.blog_slug && (
                      <Button
                        size="sm"
                        colorScheme="blue"
                        variant="solid"
                        flex={1}
                        leftIcon={<FaBook />}
                        onClick={() => { 
                          setActiveBlogSlug(opportunity.blog_slug); 
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

                    {/* Opportunity Link - Compact */}
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
                        Apply Now
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

export default Opportunities; 