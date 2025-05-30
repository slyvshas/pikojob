import React, { useEffect, useState } from 'react'
import { FaMapMarkerAlt, FaBriefcase, FaClock, FaFileAlt, FaRegFileAlt, FaClipboardList } from 'react-icons/fa'
import { useParams, useNavigate } from 'react-router-dom'
import { FaMoneyBillWave } from 'react-icons/fa'

import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Divider,
  useColorModeValue,
  useToast,
  Alert,
  AlertIcon,
} from '@chakra-ui/react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

// UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const JobDetails = () => {
  const { id } = useParams()
  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  const toast = useToast()
  const { user } = useAuth()
  const cardBg = useColorModeValue('white', 'gray.800')

  useEffect(() => {
    if (!id) {
      setError('No job ID provided')
      setLoading(false)
      return
    }

    // Validate UUID format
    if (!UUID_REGEX.test(id)) {
      setError('Invalid job ID format')
      setLoading(false)
      return
    }

    fetchJobDetails()
  }, [id])

  const fetchJobDetails = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('job_postings')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          setError('Job not found')
        } else {
          throw error
        }
        return
      }

      setJob(data)
    } catch (error) {
      console.error('Error fetching job details:', error)
      setError('Failed to load job details')
      toast({
        title: 'Error',
        description: 'Failed to load job details',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleApply = () => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to apply for this job',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      })
      navigate('/login')
      return
    }

    if (job.external_apply_link) {
      window.open(job.external_apply_link, '_blank')
    } else {
      toast({
        title: 'No Application Link',
        description: 'This job does not have an application link available',
        status: 'info',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  if (loading) {
    return (
      <Container maxW="container.md" py={8}>
        <Text>Loading job details...</Text>
      </Container>
    )
  }

  if (error) {
    return (
      <Container maxW="container.md" py={8}>
        <Alert status="error">
          <AlertIcon />
          {error}
        </Alert>
        <Button mt={4} onClick={() => navigate('/jobs')}>
          Back to Jobs
        </Button>
      </Container>
    )
  }

  if (!job) {
    return (
      <Container maxW="container.md" py={8}>
        <Alert status="warning">
          <AlertIcon />
          Job not found
        </Alert>
        <Button mt={4} onClick={() => navigate('/jobs')}>
          Back to Jobs
        </Button>
      </Container>
    )
  }

  return (
    <Container maxW="container.md" py={10}>
      <Box bg={cardBg} p={8} borderRadius="2xl" boxShadow="lg">
        <VStack spacing={6} align="stretch">
          {/* Job Title and Salary */}
          <Box>
            <Heading size="xl" mb={2}>
              {job.title}
            </Heading>
  
            <HStack spacing={6} color="gray.600" fontWeight="medium">
              <HStack spacing={1}>
                <FaBriefcase />
                <Text>{job.company_name}</Text>
              </HStack>
              <HStack spacing={1}>
                <FaMapMarkerAlt />
                <Text>{job.location}</Text>
              </HStack>
              <HStack spacing={1}>
                <FaClock />
                <Text>{job.employment_type}</Text>
              </HStack>
            </HStack>
  
            <HStack fontSize="2xl" fontWeight="bold" color="green.500" mt={3}>
              <FaMoneyBillWave />
              <Text>{job.salary}</Text>
            </HStack>

          </Box>
  
          <Divider />
  
          {/* Job Description */}
          <Box>
            <Heading size="md" mb={2}>
              <HStack spacing={2} alignItems="center">
                <FaFileAlt />
                <Text>Job Description</Text>
              </HStack>
            </Heading>
            <Text color="gray.700" whiteSpace="pre-wrap">
              {job.description}
            </Text>
          </Box>
  
          {/* Full Description */}
          {job.full_description && (
            <Box>
              <Heading size="md" mb={2}>
                <HStack spacing={2} alignItems="center">
                  <FaRegFileAlt />
                  <Text>Full Description</Text>
                </HStack>
              </Heading>
              <Text color="gray.700" whiteSpace="pre-wrap">
                {job.full_description}
              </Text>
            </Box>
          )}
  
          {/* Requirements */}
          {job.requirements && (
            <Box>
              <Heading size="md" mb={2}>
                <HStack spacing={2} alignItems="center">
                  <FaClipboardList />
                  <Text>Requirements</Text>
                </HStack>
              </Heading>
              <Text color="gray.700" whiteSpace="pre-wrap">
                {job.requirements}
              </Text>
            </Box>
          )}
  
          {/* Apply Button */}
          <Button
            colorScheme="blue"
            size="lg"
            onClick={handleApply}
          >
            {!user ? 'Sign in to Apply' : 'Apply Now'}
          </Button>
        </VStack>
      </Box>
    </Container>
  )
  
  
}

export default JobDetails 