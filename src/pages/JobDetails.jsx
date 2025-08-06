import React, { useEffect, useState } from 'react'
import { 
  FaMapMarkerAlt, 
  FaBriefcase, 
  FaClock, 
  FaFileAlt, 
  FaRegFileAlt, 
  FaClipboardList,
  FaMoneyBillWave,
  FaArrowLeft,
  FaBookmark,
  FaRegBookmark,
  FaShare,
  FaBuilding,
  FaCalendarAlt,
  FaUsers,
  FaExternalLinkAlt,
  FaCheckCircle,
  FaStar
} from 'react-icons/fa'
import { useParams, useNavigate } from 'react-router-dom'

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
  Badge,
  Grid,
  GridItem,
  Card,
  CardBody,
  CardHeader,
  IconButton,
  Flex,
  Avatar,
  Spinner,
  Center,
  useBreakpointValue,
  Tag,
  TagLabel,
  Wrap,
  WrapItem
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
  const [isSaved, setIsSaved] = useState(false)
  const [isApplying, setIsApplying] = useState(false)
  const navigate = useNavigate()
  const toast = useToast()
  const { user } = useAuth()
  
  // Theme colors
  const bgGradient = useColorModeValue(
    'linear(to-br, blue.50, purple.50, pink.50)',
    'linear(to-br, gray.900, blue.900, purple.900)'
  )
  const cardBg = useColorModeValue('white', 'gray.800')
  const cardShadow = useColorModeValue('xl', 'dark-lg')
  const textColor = useColorModeValue('gray.800', 'white')
  const mutedColor = useColorModeValue('gray.600', 'gray.400')
  
  // Responsive values
  const containerMaxW = useBreakpointValue({ base: 'container.sm', md: 'container.lg', lg: 'container.xl' })

  // All hooks at the top level
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
      
      // Check if job is already saved (you might want to implement this logic)
      // checkIfJobIsSaved(data.id)
      
    } catch (error) {
      console.error('Error fetching job details:', error)
      setError('Failed to load job details. Please try again.')
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

  const handleApply = async () => {
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

    if (!job?.external_apply_link) {
      toast({
        title: 'No Application Link',
        description: 'This job does not have an application link available',
        status: 'info',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    setIsApplying(true)
    
    try {
      // Optional: Track application in your database
      // await trackJobApplication(job.id, user.id)
      
      // Open external application link
      window.open(job.external_apply_link, '_blank', 'noopener,noreferrer')
      
      toast({
        title: 'Application Started',
        description: 'Redirecting to application page...',
        status: 'success',
        duration: 2000,
        isClosable: true,
      })
    } catch (error) {
      console.error('Error applying to job:', error)
      toast({
        title: 'Application Error',
        description: 'There was an error processing your application',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setTimeout(() => setIsApplying(false), 1000) // Reset after delay
    }
  }

  const handleSave = async () => {
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
      // Toggle saved state optimistically
      const newSavedState = !isSaved
      setIsSaved(newSavedState)
      
      if (newSavedState) {
        // Save job to database
        const { error } = await supabase
          .from('saved_jobs')
          .insert([{
            user_id: user.id,
            job_id: job.id,
            created_at: new Date().toISOString()
          }])
        
        if (error) throw error
        
        toast({
          title: 'Job Saved',
          description: 'Job added to your saved items',
          status: 'success',
          duration: 2000,
          isClosable: true,
        })
      } else {
        // Remove job from database
        const { error } = await supabase
          .from('saved_jobs')
          .delete()
          .match({ user_id: user.id, job_id: job.id })
        
        if (error) throw error
        
        toast({
          title: 'Job Unsaved',
          description: 'Job removed from your saved items',
          status: 'success',
          duration: 2000,
          isClosable: true,
        })
      }
    } catch (error) {
      console.error('Error saving job:', error)
      // Revert the optimistic update
      setIsSaved(!isSaved)
      toast({
        title: 'Save Error',
        description: 'Could not save job. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  const handleShare = async () => {
    try {
      const url = window.location.href
      
      if (navigator.share) {
        // Use native sharing if available
        await navigator.share({
          title: job?.title || 'Job Opportunity',
          text: `Check out this job opportunity: ${job?.title} at ${job?.company_name}`,
          url: url
        })
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(url)
        toast({
          title: 'Link Copied',
          description: 'Job link copied to clipboard',
          status: 'success',
          duration: 2000,
          isClosable: true,
        })
      }
    } catch (err) {
      console.error('Error sharing:', err)
      toast({
        title: 'Share Failed',
        description: 'Could not share job link',
        status: 'error',
        duration: 2000,
        isClosable: true,
      })
    }
  }

  const formatSalary = (salary) => {
    if (!salary || salary === 'null' || salary === '') {
      return 'Salary not specified'
    }
    return salary
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Date not available'
    
    try {
      return new Date(dateString).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      })
    } catch (error) {
      return 'Date not available'
    }
  }

  if (loading) {
    return (
      <Box minH="100vh" bgGradient={bgGradient}>
        <Container maxW={containerMaxW} py={8}>
          <Center minH="60vh">
            <VStack spacing={4}>
              <Spinner size="xl" thickness="4px" speed="0.65s" color="blue.500" />
              <Text fontSize="lg" color={mutedColor}>Loading job details...</Text>
            </VStack>
          </Center>
        </Container>
      </Box>
    )
  }

  if (error || !job) {
    return (
      <Box minH="100vh" bgGradient={bgGradient}>
        <Container maxW={containerMaxW} py={8}>
          <VStack spacing={6} align="center" minH="60vh" justify="center">
            <Alert status="error" borderRadius="xl" maxW="md">
              <AlertIcon />
              {error || 'Job not found'}
            </Alert>
            <Button 
              leftIcon={<FaArrowLeft />} 
              onClick={() => navigate('/jobs')}
              colorScheme="blue"
              size="lg"
            >
              Back to Jobs
            </Button>
          </VStack>
        </Container>
      </Box>
    )
  }

  return (
    <Box minH="100vh" bgGradient={bgGradient}>
      <Container maxW={containerMaxW} py={8}>
        {/* Header with Back Button */}
        <Flex mb={6} align="center" justify="space-between">
          <Button
            leftIcon={<FaArrowLeft />}
            variant="ghost"
            onClick={() => navigate('/jobs')}
            color={mutedColor}
            _hover={{ color: textColor, bg: cardBg }}
          >
            Back to Jobs
          </Button>
          <HStack spacing={2}>
            <IconButton
              icon={<FaShare />}
              onClick={handleShare}
              variant="ghost"
              colorScheme="blue"
              aria-label="Share job"
              _hover={{ bg: 'blue.50' }}
            />
            <IconButton
              icon={isSaved ? <FaBookmark /> : <FaRegBookmark />}
              onClick={handleSave}
              variant="ghost"
              colorScheme={isSaved ? 'red' : 'gray'}
              aria-label={isSaved ? 'Unsave job' : 'Save job'}
              _hover={{ bg: isSaved ? 'red.50' : 'gray.50' }}
            />
          </HStack>
        </Flex>

        <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={8}>
          {/* Main Content */}
          <GridItem>
            <VStack spacing={6} align="stretch">
              {/* Job Header Card */}
              <Card bg={cardBg} shadow={cardShadow} borderRadius="2xl" overflow="hidden">
                <CardBody p={8}>
                  <VStack spacing={6} align="stretch">
                    {/* Company and Job Title */}
                    <Flex direction={{ base: 'column', md: 'row' }} justify="space-between" align={{ base: 'start', md: 'center' }}>
                      <Box flex="1">
                        <HStack mb={3} spacing={3}>
                          <Avatar
                            name={job.company_name || 'Company'}
                            src={job.company_logo_url}
                            size="md"
                            bg="blue.500"
                            color="white"
                          />
                          <VStack align="start" spacing={1}>
                            <Text fontSize="lg" fontWeight="semibold" color={mutedColor}>
                              {job.company_name || 'Company Name Not Available'}
                            </Text>
                            {job.company_description_short && (
                              <Text fontSize="sm" color={mutedColor} maxW="200px" noOfLines={2}>
                                {job.company_description_short}
                              </Text>
                            )}
                          </VStack>
                        </HStack>
                        <Heading size="xl" color={textColor} mb={4} lineHeight="shorter">
                          {job.title || 'Job Title Not Available'}
                        </Heading>
                      </Box>
                      <VStack align={{ base: 'start', md: 'end' }} spacing={2}>
                        <HStack spacing={2} fontSize="2xl" fontWeight="bold" color="green.500">
                          <FaMoneyBillWave />
                          <Text>{formatSalary(job.salary)}</Text>
                        </HStack>
                        <Badge colorScheme="green" fontSize="sm" px={3} py={1} borderRadius="full">
                          {job.salary && job.salary !== 'null' && job.salary !== '' ? 'Competitive Salary' : 'Salary TBD'}
                        </Badge>
                      </VStack>
                    </Flex>

                    {/* Job Meta Information */}
                    <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
                      <HStack spacing={3} p={4} bg={useColorModeValue('gray.50', 'gray.700')} borderRadius="xl">
                        <Box p={2} bg="blue.100" borderRadius="lg">
                          <FaMapMarkerAlt color="blue" />
                        </Box>
                        <VStack align="start" spacing={0}>
                          <Text fontSize="sm" color={mutedColor}>Location</Text>
                          <Text fontWeight="medium" color={textColor}>
                            {job.location || 'Location not specified'}
                          </Text>
                        </VStack>
                      </HStack>
                      <HStack spacing={3} p={4} bg={useColorModeValue('gray.50', 'gray.700')} borderRadius="xl">
                        <Box p={2} bg="purple.100" borderRadius="lg">
                          <FaClock color="purple" />
                        </Box>
                        <VStack align="start" spacing={0}>
                          <Text fontSize="sm" color={mutedColor}>Type</Text>
                          <Text fontWeight="medium" color={textColor}>
                            {job.employment_type || 'Type not specified'}
                          </Text>
                        </VStack>
                      </HStack>
                    </Grid>

                    {/* Action Buttons */}
                    <HStack spacing={4} pt={4}>
                      <Button
                        colorScheme="blue"
                        size="lg"
                        flex="1"
                        leftIcon={<FaExternalLinkAlt />}
                        onClick={handleApply}
                        isLoading={isApplying}
                        loadingText="Applying..."
                        _hover={{ transform: 'translateY(-2px)', shadow: 'lg' }}
                        transition="all 0.2s"
                        disabled={!job.external_apply_link}
                      >
                        {!user ? 'Sign in to Apply' : 'Apply Now'}
                      </Button>
                      <Button
                        variant="outline"
                        size="lg"
                        leftIcon={isSaved ? <FaBookmark /> : <FaRegBookmark />}
                        onClick={handleSave}
                        colorScheme={isSaved ? 'red' : 'gray'}
                      >
                        {isSaved ? 'Saved' : 'Save'}
                      </Button>
                    </HStack>
                  </VStack>
                </CardBody>
              </Card>

              {/* Job Description */}
              {job.description && (
                <Card bg={cardBg} shadow={cardShadow} borderRadius="2xl">
                  <CardHeader pb={2}>
                    <HStack spacing={3}>
                      <Box p={2} bg="blue.100" borderRadius="lg">
                        <FaFileAlt color="blue" />
                      </Box>
                      <Heading size="lg" color={textColor}>Job Description</Heading>
                    </HStack>
                  </CardHeader>
                  <CardBody pt={2}>
                    <Text color={mutedColor} lineHeight="tall" whiteSpace="pre-wrap">
                      {job.description}
                    </Text>
                  </CardBody>
                </Card>
              )}

              {/* Full Description */}
              {job.full_description && (
                <Card bg={cardBg} shadow={cardShadow} borderRadius="2xl">
                  <CardHeader pb={2}>
                    <HStack spacing={3}>
                      <Box p={2} bg="purple.100" borderRadius="lg">
                        <FaRegFileAlt color="purple" />
                      </Box>
                      <Heading size="lg" color={textColor}>Full Description</Heading>
                    </HStack>
                  </CardHeader>
                  <CardBody pt={2}>
                    <Text color={mutedColor} lineHeight="tall" whiteSpace="pre-wrap">
                      {job.full_description}
                    </Text>
                  </CardBody>
                </Card>
              )}

              {/* Requirements */}
              {job.requirements && (
                <Card bg={cardBg} shadow={cardShadow} borderRadius="2xl">
                  <CardHeader pb={2}>
                    <HStack spacing={3}>
                      <Box p={2} bg="green.100" borderRadius="lg">
                        <FaClipboardList color="green" />
                      </Box>
                      <Heading size="lg" color={textColor}>Requirements</Heading>
                    </HStack>
                  </CardHeader>
                  <CardBody pt={2}>
                    <Text color={mutedColor} lineHeight="tall" whiteSpace="pre-wrap">
                      {job.requirements}
                    </Text>
                  </CardBody>
                </Card>
              )}
            </VStack>
          </GridItem>

          {/* Sidebar */}
          <GridItem>
            <VStack spacing={6} align="stretch">
              {/* Basic Job Info Card */}
              <Card bg={cardBg} shadow={cardShadow} borderRadius="2xl">
                <CardHeader>
                  <Heading size="md" color={textColor}>Job Information</Heading>
                </CardHeader>
                <CardBody pt={2}>
                  <VStack spacing={4} align="stretch">
                    {job.created_at && (
                      <HStack justify="space-between">
                        <Text color={mutedColor}>Posted</Text>
                        <Text fontWeight="medium" color={textColor}>
                          {formatDate(job.created_at)}
                        </Text>
                      </HStack>
                    )}
                    {job.employment_type && (
                      <HStack justify="space-between">
                        <Text color={mutedColor}>Employment Type</Text>
                        <Badge colorScheme="blue">{job.employment_type}</Badge>
                      </HStack>
                    )}
                    {job.location && (
                      <HStack justify="space-between">
                        <Text color={mutedColor}>Location</Text>
                        <Text fontWeight="medium" color={textColor} textAlign="right">
                          {job.location}
                        </Text>
                      </HStack>
                    )}
                    {job.external_apply_link && (
                      <HStack justify="space-between">
                        <Text color={mutedColor}>Application</Text>
                        <Badge colorScheme="green">Available</Badge>
                      </HStack>
                    )}
                  </VStack>
                </CardBody>
              </Card>
            </VStack>
          </GridItem>
        </Grid>
      </Container>
    </Box>
  )
}

export default JobDetails