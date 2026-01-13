import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Container,
  Heading,
  SimpleGrid,
  VStack,
  Text,
  Button,
  Input,
  InputGroup,
  InputLeftElement,
  useColorModeValue,
  HStack,
  Badge,
  Image,
  Flex,
  useToast,
  IconButton,
  Select,
  Stack,
  Divider,
  Skeleton,
  SkeletonText,
  Center,
  Spinner,
} from '@chakra-ui/react'
import { SearchIcon } from '@chakra-ui/icons'
import { FaMapMarkerAlt, FaBriefcase, FaBookmark, FaRegBookmark, FaArrowRight } from 'react-icons/fa'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

const JobList = () => {
  const [jobs, setJobs] = useState([])
  const [savedJobs, setSavedJobs] = useState(new Set())
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const toast = useToast()
  const { user } = useAuth()

  const [selectedEmploymentType, setSelectedEmploymentType] = useState('')
  const [selectedLocation, setSelectedLocation] = useState('')
  const [employmentTypes, setEmploymentTypes] = useState([])
  const [locations, setLocations] = useState([])

  // Theme colors
  const bgColor = useColorModeValue('gray.50', 'gray.900')
  const cardBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const textColor = useColorModeValue('gray.800', 'white')
  const mutedColor = useColorModeValue('gray.600', 'gray.400')

  useEffect(() => {
    fetchJobs()
    if (user) {
      fetchSavedJobs()
    }
  }, [user])

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('job_postings')
        .select('id, title, company_name, location, employment_type, salary_range, description, requirements, company_logo_url, application_link, created_at')
        .order('created_at', { ascending: false })
        .limit(200); // Reasonable limit for better performance

      if (error) throw error
      
      const validJobs = data?.filter(job => job.id && typeof job.id === 'string') || []
      setJobs(validJobs)

      const uniqueEmploymentTypes = [...new Set(validJobs.map(job => job.employment_type).filter(Boolean))]
      const uniqueLocations = [...new Set(validJobs.map(job => job.location).filter(Boolean))]
      setEmploymentTypes(uniqueEmploymentTypes)
      setLocations(uniqueLocations)

    } catch (error) {
      console.error('Error fetching jobs:', error)
      toast({
        title: 'Error',
        description: 'Failed to load jobs',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchSavedJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('saved_jobs')
        .select('job_id')
        .eq('user_id', user.id)

      if (error) throw error

      const savedJobIds = new Set(data.map(item => item.job_id))
      setSavedJobs(savedJobIds)
    } catch (error) {
      console.error('Error fetching saved jobs:', error)
    }
  }

  const handleSaveJob = async (jobId) => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to save jobs',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      })
      navigate('/login')
      return
    }

    try {
      if (savedJobs.has(jobId)) {
        // Unsave job
        const { error } = await supabase
          .from('saved_jobs')
          .delete()
          .eq('user_id', user.id)
          .eq('job_id', jobId)

        if (error) throw error

        setSavedJobs(prev => {
          const newSet = new Set(prev)
          newSet.delete(jobId)
          return newSet
        })

        toast({
          title: 'Job Unsaved',
          description: 'Job has been removed from your saved jobs',
          status: 'info',
          duration: 3000,
          isClosable: true,
        })
      } else {
        // Save job
        const { error } = await supabase
          .from('saved_jobs')
          .insert([{ user_id: user.id, job_id: jobId }])

        if (error) throw error

        setSavedJobs(prev => new Set([...prev, jobId]))

        toast({
          title: 'Job Saved',
          description: 'Job has been added to your saved jobs',
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
      }
    } catch (error) {
      console.error('Error saving/unsaving job:', error)
      toast({
        title: 'Error',
        description: 'Failed to save/unsave job',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  const filterJobs = (jobs) => {
    return jobs.filter(
      (job) =>
        (job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.location?.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (selectedEmploymentType === '' || job.employment_type === selectedEmploymentType) &&
        (selectedLocation === '' || job.location === selectedLocation)
    )
  }

  const JobCard = ({ job }) => (
    <Box
      p={6}
      bg={cardBg}
      borderRadius="xl"
      border="1px solid"
      borderColor={borderColor}
      _hover={{ 
        transform: 'translateY(-2px)', 
        boxShadow: '0 4px 20px rgba(59, 130, 246, 0.15)',
        borderColor: 'blue.300',
        bg: useColorModeValue('blue.50', 'blue.900'),
        transition: 'all 0.3s ease-in-out'
      }}
      cursor="pointer"
      onClick={() => navigate(`/jobs/${job.id}`)}
      position="relative"
    >
      {/* Save button */}
      <IconButton
        aria-label={savedJobs.has(job.id) ? 'Unsave job' : 'Save job'}
        icon={savedJobs.has(job.id) ? <FaBookmark /> : <FaRegBookmark />}
        color={savedJobs.has(job.id) ? 'blue.500' : mutedColor}
        variant="ghost"
        size="sm"
        position="absolute"
        top={4}
        right={4}
        onClick={(e) => {
          e.stopPropagation()
          handleSaveJob(job.id)
        }}
        _hover={{ bg: 'blue.50' }}
      />

      {/* Company logo */}
      {job.company_logo_url && (
        <Box mb={4}>
          <Image
            src={job.company_logo_url}
            alt={`${job.company_name} logo`}
            boxSize="48px"
            objectFit="contain"
            borderRadius="lg"
            bg="gray.50"
            p={2}
          />
        </Box>
      )}

      {/* Job title */}
      <Heading size="md" mb={2} color={textColor} lineHeight="tight">
        {job.title}
      </Heading>

      {/* Company name */}
      <Text color={mutedColor} fontSize="sm" mb={4}>
        {job.company_name}
      </Text>

      {/* Job details */}
      <VStack align="start" spacing={2} mb={4}>
        <HStack spacing={2} color={mutedColor} fontSize="sm">
          <FaMapMarkerAlt size={12} />
          <Text>{job.location}</Text>
        </HStack>
        <HStack spacing={2} color={mutedColor} fontSize="sm">
          <FaBriefcase size={12} />
          <Text>{job.employment_type}</Text>
        </HStack>
      </VStack>

      {/* Tags */}
      {job.tags && (
        <Flex wrap="wrap" gap={1} mb={4}>
          {job.tags.split(',').slice(0, 3).map((tag, index) => (
            <Badge
              key={index}
              colorScheme="blue"
              variant="subtle"
              fontSize="xs"
              px={2}
              py={1}
              borderRadius="full"
            >
              {tag.trim()}
            </Badge>
          ))}
          {job.tags.split(',').length > 3 && (
            <Badge
              colorScheme="gray"
              variant="subtle"
              fontSize="xs"
              px={2}
              py={1}
              borderRadius="full"
            >
              +{job.tags.split(',').length - 3}
            </Badge>
          )}
        </Flex>
      )}

      {/* View job button */}
      <Button
        rightIcon={<FaArrowRight />}
        variant="ghost"
        colorScheme="blue"
        size="sm"
        w="full"
        mt="auto"
        _hover={{ bg: 'blue.50' }}
      >
        View Details
      </Button>
    </Box>
  )

  const LoadingSkeleton = () => (
    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
      {[...Array(6)].map((_, index) => (
        <Box key={index} p={6} bg={cardBg} borderRadius="xl" border="1px solid" borderColor={borderColor}>
          <Skeleton height="48px" width="48px" mb={4} borderRadius="lg" />
          <Skeleton height="20px" mb={2} />
          <Skeleton height="16px" width="60%" mb={4} />
          <SkeletonText noOfLines={2} spacing={2} />
          <Skeleton height="16px" width="40%" mt={4} />
        </Box>
      ))}
    </SimpleGrid>
  )

  const filteredJobs = filterJobs(jobs)

  return (
    <Box bg={bgColor} minH="100vh" py={8}>
      <Container maxW="container.xl">
        {loading ? (
          <VStack spacing={8} align="stretch">
            {/* Header Skeleton */}
            <Box textAlign="center" mb={8}>
              <Skeleton height="40px" width="400px" mx="auto" mb={4} />
              <Skeleton height="24px" width="300px" mx="auto" />
            </Box>

            {/* Filters Skeleton */}
            <Box bg={cardBg} p={6} borderRadius="xl" border="1px solid" borderColor={borderColor}>
              <VStack spacing={4}>
                <Skeleton height="40px" width="100%" borderRadius="md" />
                <Stack direction={{ base: 'column', md: 'row' }} spacing={4} width="100%">
                  <Skeleton height="40px" flex={1} borderRadius="md" />
                  <Skeleton height="40px" flex={1} borderRadius="md" />
                </Stack>
              </VStack>
            </Box>

            {/* Job Cards Skeleton */}
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Box
                  key={i}
                  p={6}
                  bg={cardBg}
                  borderRadius="xl"
                  border="1px solid"
                  borderColor={borderColor}
                >
                  <Skeleton height="48px" width="48px" mb={4} borderRadius="lg" />
                  <SkeletonText noOfLines={2} spacing={3} skeletonHeight={5} mb={2} />
                  <Skeleton height="16px" width="120px" mb={4} />
                  <SkeletonText noOfLines={2} spacing={2} skeletonHeight={3} mb={4} />
                  <Skeleton height="36px" width="100%" borderRadius="md" />
                </Box>
              ))}
            </SimpleGrid>
          </VStack>
        ) : (
          <VStack spacing={8} align="stretch">
            {/* Header */}
            <Box textAlign="center" mb={8}>
              <Heading size="2xl" mb={2} color={textColor} fontWeight="bold">
                Find Your Next Opportunity
              </Heading>
              <Text color={mutedColor} fontSize="lg">
                Discover amazing jobs from top companies
              </Text>
            </Box>

            {/* Search and Filters */}
            <Box bg={cardBg} p={6} borderRadius="xl" border="1px solid" borderColor={borderColor}>
              <VStack spacing={4}>
                {/* Search */}
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <SearchIcon color={mutedColor} />
                  </InputLeftElement>
                  <Input
                    type="text"
                    placeholder="Search jobs, companies, or locations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    size="lg"
                    borderRadius="lg"
                    borderColor={borderColor}
                    _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)' }}
                  />
                </InputGroup>

                {/* Filters */}
                <HStack spacing={4} w="full">
                  <Box flex="1">
                    <Select
                      placeholder="All Employment Types"
                      value={selectedEmploymentType}
                      onChange={(e) => setSelectedEmploymentType(e.target.value)}
                      size="lg"
                      borderRadius="lg"
                      borderColor={borderColor}
                      _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)' }}
                    >
                      {employmentTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </Select>
                  </Box>
                  <Box flex="1">
                    <Select
                      placeholder="All Locations"
                      value={selectedLocation}
                      onChange={(e) => setSelectedLocation(e.target.value)}
                      size="lg"
                      borderRadius="lg"
                      borderColor={borderColor}
                      _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)' }}
                    >
                      {locations.map(location => (
                        <option key={location} value={location}>{location}</option>
                      ))}
                    </Select>
                  </Box>
                </HStack>
              </VStack>
            </Box>

            {/* Results */}
            <Box>
              {filteredJobs.length === 0 ? (
                <Center py={12}>
                  <VStack spacing={4}>
                    <Text fontSize="lg" color={mutedColor}>
                      {searchTerm || selectedEmploymentType || selectedLocation 
                        ? 'No jobs found matching your criteria.'
                        : 'No jobs available at the moment.'
                      }
                    </Text>
                    {(searchTerm || selectedEmploymentType || selectedLocation) && (
                      <Button
                        variant="ghost"
                        colorScheme="blue"
                        onClick={() => {
                          setSearchTerm('')
                          setSelectedEmploymentType('')
                          setSelectedLocation('')
                        }}
                      >
                        Clear filters
                      </Button>
                    )}
                  </VStack>
                </Center>
              ) : (
                <>
                  <Text color={mutedColor} mb={4}>
                    Showing {filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''}
                  </Text>
                  <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                    {filteredJobs.map((job) => (
                      <JobCard key={job.id} job={job} />
                    ))}
                  </SimpleGrid>
                </>
              )}
            </Box>
          </VStack>
        )}
      </Container>
    </Box>
  )
}

export default JobList 