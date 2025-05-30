import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  VStack,
  SimpleGrid,
  useColorModeValue,
  HStack,
  Badge,
  Image,
  Flex,
  IconButton,
} from '@chakra-ui/react'
import { FaMapMarkerAlt, FaBriefcase, FaMoneyBillWave, FaBookmark, FaRegBookmark, FaStar } from 'react-icons/fa'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

const Home = () => {
  const [featuredJobs, setFeaturedJobs] = useState([])
  const [savedJobs, setSavedJobs] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const cardBg = useColorModeValue('white', 'gray.800')
  const { user } = useAuth()

  useEffect(() => {
    fetchFeaturedJobs()
    if (user) {
      fetchSavedJobs()
    }
  }, [user])

  const fetchFeaturedJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('job_postings')
        .select('*')
        .eq('is_featured', true)
        .order('created_at', { ascending: false })
        .limit(6)

      if (error) throw error
      setFeaturedJobs(data || [])
    } catch (error) {
      console.error('Error fetching featured jobs:', error)
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
      } else {
        // Save job
        const { error } = await supabase
          .from('saved_jobs')
          .insert([{ user_id: user.id, job_id: jobId }])

        if (error) throw error

        setSavedJobs(prev => new Set([...prev, jobId]))
      }
    } catch (error) {
      console.error('Error saving/unsaving job:', error)
    }
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
      <VStack spacing={12} align="stretch">
        {/* Hero Section */}
        <Box textAlign="center" py={20}>
          <Heading size="2xl" mb={6}>
            Find Your Dream Job
          </Heading>
          <Text fontSize="xl" color="gray.600" mb={8}>
            Discover thousands of job opportunities with all the information you need
          </Text>
          <Button
            size="lg"
            colorScheme="blue"
            onClick={() => navigate('/jobs')}
          >
            Browse Jobs
          </Button>
        </Box>

        {/* Featured Jobs Section */}
        <Box>
          <HStack justify="space-between" mb={6}>
            <Heading size="lg">
              <HStack>
                <FaStar color="gold" />
                <Text>Featured Jobs</Text>
              </HStack>
            </Heading>
            <Button
              variant="ghost"
              colorScheme="blue"
              onClick={() => navigate('/jobs')}
            >
              View All
            </Button>
          </HStack>

          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {featuredJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </SimpleGrid>
        </Box>
      </VStack>
    </Container>
  )
}

export default Home 