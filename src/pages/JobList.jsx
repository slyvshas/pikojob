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
} from '@chakra-ui/react'
import { SearchIcon } from '@chakra-ui/icons'
import { FaMapMarkerAlt, FaBriefcase, FaMoneyBillWave, FaBookmark, FaRegBookmark } from 'react-icons/fa'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

const JobList = () => {
  const [jobs, setJobs] = useState([])
  const [savedJobs, setSavedJobs] = useState(new Set())
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const cardBg = useColorModeValue('white', 'gray.800')
  const toast = useToast()
  const { user } = useAuth()

  const [selectedEmploymentType, setSelectedEmploymentType] = useState('')
  const [selectedLocation, setSelectedLocation] = useState('')
  const [employmentTypes, setEmploymentTypes] = useState([])
  const [locations, setLocations] = useState([])

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
        .select('*')
        .order('created_at', { ascending: false })

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
      borderRadius="2xl"
      boxShadow="md"
      _hover={{ transform: 'translateY(-4px)', transition: 'all 0.2s', boxShadow: 'xl' }}
      borderWidth="1px"
      borderColor={useColorModeValue('gray.200', 'gray.700')}
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
    >
      <VStack align="start" spacing={4}>
        <Flex justify="space-between" width="100%" align="center">
          {job.company_logo_url && (
            <Image
              src={job.company_logo_url}
              alt={`${job.company_name} logo`}
              boxSize="60px"
              objectFit="contain"
              borderRadius="md"
            />
          )}
          <IconButton
            aria-label={savedJobs.has(job.id) ? 'Unsave job' : 'Save job'}
            icon={savedJobs.has(job.id) ? <FaBookmark /> : <FaRegBookmark />}
            colorScheme={savedJobs.has(job.id) ? 'blue' : 'gray'}
            variant="ghost"
            onClick={() => handleSaveJob(job.id)}
          />
        </Flex>

        <Box>
          <Heading size="md" mb={1}>
            {job.title}
          </Heading>
          <Text fontWeight="medium" color="gray.600">
            {job.company_name}
          </Text>
        </Box>

        <VStack align="start" spacing={1} fontSize="sm" color="gray.500">
          <HStack>
            <FaMapMarkerAlt />
            <Text>{job.location}</Text>
          </HStack>
          <HStack>
            <FaBriefcase />
            <Text>{job.employment_type}</Text>
          </HStack>
          <HStack>
            <FaMoneyBillWave />
            <Text>{job.salary}</Text>
          </HStack>
        </VStack>

        {job.tags && (
          <Flex wrap="wrap" gap={2} mt={2}>
            {job.tags.split(',').map((tag, index) => (
              <Badge
                key={index}
                colorScheme="blue"
                variant="solid"
                borderRadius="full"
                px={2}
                py={1}
                fontSize="xs"
              >
                {tag.trim()}
              </Badge>
            ))}
          </Flex>
        )}
      </VStack>

      <Button
        onClick={() => navigate(`/jobs/${job.id}`)}
        colorScheme="blue"
        size="md"
        mt={6}
        width="100%"
        borderRadius="lg"
      >
        View Job
      </Button>
    </Box>
  )

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Heading>Browse Jobs</Heading>

        <InputGroup mb={6}>
          <InputLeftElement pointerEvents="none">
            <SearchIcon color="gray.300" />
          </InputLeftElement>
          <Input
            type="text"
            placeholder="Search jobs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </InputGroup>

        <HStack spacing={4} mb={6}>
          <Box flex="1">
            <Text mb={1}>Employment Type:</Text>
            <Select
              placeholder="All Types"
              value={selectedEmploymentType}
              onChange={(e) => setSelectedEmploymentType(e.target.value)}
              sx={{
                '.chakra-select__menu-list': {
                   maxHeight: '200px',
                   overflowY: 'auto',
                   fontSize: 'sm',
                }
              }}
            >
              {employmentTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </Select>
          </Box>
          <Box flex="1">
            <Text mb={1}>Location:</Text>
            <Select
              placeholder="All Locations"
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              sx={{
                '.chakra-select__menu-list': {
                   maxHeight: '200px',
                   overflowY: 'auto',
                   fontSize: 'sm',
                }
              }}
            >
              {locations.map(location => (
                <option key={location} value={location}>{location}</option>
              ))}
            </Select>
          </Box>
        </HStack>

        {loading ? (
          <Text>Loading jobs...</Text>
        ) : (
          <>
            {filterJobs(jobs).length === 0 ? (
              <Text>No jobs found matching your criteria.</Text>
            ) : (
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
                {filterJobs(jobs).map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </SimpleGrid>
            )}
          </>
        )}
      </VStack>
    </Container>
  )
}

export default JobList 