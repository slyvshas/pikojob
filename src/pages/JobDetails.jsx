import React, { useEffect, useState } from 'react'
import { 
  FaMapMarkerAlt, 
  FaBriefcase, 
  FaClock, 
  FaFileAlt, 
  FaRegFileAlt, 
  FaClipboardList,
  FaArrowLeft,
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
  WrapItem,
  Stack
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
  const containerMaxW = useBreakpointValue({ base: '100%', md: 'container.lg', lg: 'container.xl' })
  
  // Additional color mode values
  const metaInfoBg = useColorModeValue('gray.50', 'gray.700')

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
        <Container maxW={containerMaxW} py={8} px={4}>
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
        <Container maxW={containerMaxW} py={8} px={4}>
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
      <Container maxW={containerMaxW} py={4} px={4}>
        {/* Header with Back Button */}
        <Flex mb={6} align="center" justify="space-between" flexWrap="wrap" gap={2}>
          <Button
            leftIcon={<FaArrowLeft />}
            variant="ghost"
            onClick={() => navigate('/jobs')}
            color={mutedColor}
            _hover={{ color: textColor, bg: cardBg }}
            size="md"
          >
            Back to Jobs
          </Button>
            <IconButton
              icon={<FaShare />}
              onClick={handleShare}
              variant="ghost"
              colorScheme="blue"
              aria-label="Share job"
              _hover={{ bg: 'blue.50' }}
              size="md"
          />
        </Flex>

        <Stack spacing={6}>
              {/* Job Header Card */}
          <Card bg={cardBg} shadow={cardShadow} borderRadius="xl" overflow="hidden">
            <CardBody p={{ base: 4, md: 6, lg: 8 }}>
                  <VStack spacing={6} align="stretch">
                    {/* Company and Job Title */}
                <Stack spacing={4}>
                  {/* Company Info */}
                  <HStack spacing={3} align="flex-start">
                          <Avatar
                            name={job.company_name || 'Company'}
                            src={job.company_logo_url}
                            size="lg"
                            bg="blue.500"
                            color="white"
                            flexShrink={0}
                          />
                    <VStack align="start" spacing={1} flex="1">
                      <Text fontSize={{ base: 'md', md: 'lg' }} fontWeight="semibold" color={mutedColor}>
                              {job.company_name || 'Company Name Not Available'}
                            </Text>
                            {job.company_description_short && (
                        <Text fontSize="sm" color={mutedColor} noOfLines={2}>
                                {job.company_description_short}
                              </Text>
                            )}
                          </VStack>
                        </HStack>

                  {/* Job Title */}
                  <Heading size={{ base: 'lg', md: 'xl' }} color={textColor} lineHeight="shorter">
                          {job.title || 'Job Title Not Available'}
                        </Heading>

                  
                </Stack>

                    {/* Job Meta Information */}
                    <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
                  <HStack spacing={3} p={4} bg={metaInfoBg} borderRadius="xl">
                    <Box p={2} bg="blue.100" borderRadius="lg" flexShrink={0}>
                          <FaMapMarkerAlt color="blue" />
                        </Box>
                    <VStack align="start" spacing={0} flex="1">
                          <Text fontSize="sm" color={mutedColor}>Location</Text>
                      <Text fontWeight="medium" color={textColor} fontSize="sm">
                            {job.location || 'Location not specified'}
                          </Text>
                        </VStack>
                      </HStack>
                  <HStack spacing={3} p={4} bg={metaInfoBg} borderRadius="xl">
                    <Box p={2} bg="purple.100" borderRadius="lg" flexShrink={0}>
                          <FaClock color="purple" />
                        </Box>
                    <VStack align="start" spacing={0} flex="1">
                          <Text fontSize="sm" color={mutedColor}>Type</Text>
                      <Text fontWeight="medium" color={textColor} fontSize="sm">
                            {job.employment_type || 'Type not specified'}
                          </Text>
                        </VStack>
                      </HStack>
                    </Grid>

                    {/* Action Buttons */}
                      <Button
                        colorScheme="blue"
                        size="md"
                        leftIcon={<FaExternalLinkAlt />}
                        onClick={handleApply}
                        isLoading={isApplying}
                        loadingText="Applying..."
                        _hover={{ transform: 'translateY(-2px)', shadow: 'lg' }}
                        transition="all 0.2s"
                        disabled={!job.external_apply_link}
                        w="full"
                      >
                        {!user ? 'Sign in to Apply' : 'Apply Now'}
                      </Button>
                  </VStack>
                </CardBody>
              </Card>

          {/* Content Grid */}
          <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={6}>
            {/* Main Content */}
            <GridItem>
              <VStack spacing={6} align="stretch">
              {/* Job Description */}
              {job.description && (
                  <Card bg={cardBg} shadow={cardShadow} borderRadius="xl">
                  <CardHeader pb={2}>
                    <HStack spacing={3}>
                      <Box p={2} bg="blue.100" borderRadius="lg">
                        <FaFileAlt color="blue" />
                      </Box>
                        <Heading size={{ base: 'md', md: 'lg' }} color={textColor}>Job Description</Heading>
                    </HStack>
                  </CardHeader>
                  <CardBody pt={2}>
                      <Text color={mutedColor} lineHeight="tall" whiteSpace="pre-wrap" fontSize="sm">
                      {job.description}
                    </Text>
                  </CardBody>
                </Card>
              )}

              {/* Full Description */}
              {job.full_description && (
                  <Card bg={cardBg} shadow={cardShadow} borderRadius="xl">
                  <CardHeader pb={2}>
                    <HStack spacing={3}>
                      <Box p={2} bg="purple.100" borderRadius="lg">
                        <FaRegFileAlt color="purple" />
                      </Box>
                        <Heading size={{ base: 'md', md: 'lg' }} color={textColor}>Full Description</Heading>
                    </HStack>
                  </CardHeader>
                  <CardBody pt={2}>
                      <Text color={mutedColor} lineHeight="tall" whiteSpace="pre-wrap" fontSize="sm">
                      {job.full_description}
                    </Text>
                  </CardBody>
                </Card>
              )}

              {/* Requirements */}
              {job.requirements && (
                  <Card bg={cardBg} shadow={cardShadow} borderRadius="xl">
                  <CardHeader pb={2}>
                    <HStack spacing={3}>
                      <Box p={2} bg="green.100" borderRadius="lg">
                        <FaClipboardList color="green" />
                      </Box>
                        <Heading size={{ base: 'md', md: 'lg' }} color={textColor}>Requirements</Heading>
                    </HStack>
                  </CardHeader>
                  <CardBody pt={2}>
                      <Text color={mutedColor} lineHeight="tall" whiteSpace="pre-wrap" fontSize="sm">
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
                <Card bg={cardBg} shadow={cardShadow} borderRadius="xl">
                <CardHeader>
                    <Heading size={{ base: 'sm', md: 'md' }} color={textColor}>Job Information</Heading>
                </CardHeader>
                <CardBody pt={2}>
                  <VStack spacing={4} align="stretch">
                    {job.created_at && (
                      <HStack justify="space-between">
                           <Text color={mutedColor} fontSize="sm">Posted</Text>
                           <Text fontWeight="medium" color={textColor} fontSize="sm">
                          {formatDate(job.created_at)}
                        </Text>
                      </HStack>
                    )}
                    {job.employment_type && (
                      <HStack justify="space-between">
                           <Text color={mutedColor} fontSize="sm">Employment Type</Text>
                           <Badge colorScheme="blue" fontSize="xs">{job.employment_type}</Badge>
                      </HStack>
                    )}
                    {job.location && (
                      <HStack justify="space-between">
                           <Text color={mutedColor} fontSize="sm">Location</Text>
                           <Text fontWeight="medium" color={textColor} textAlign="right" fontSize="sm" maxW="150px">
                          {job.location}
                        </Text>
                      </HStack>
                    )}
                    {job.external_apply_link && (
                      <HStack justify="space-between">
                           <Text color={mutedColor} fontSize="sm">Application</Text>
                           <Badge colorScheme="green" fontSize="xs">Available</Badge>
                         </HStack>
                       )}
                     </VStack>
                   </CardBody>
                 </Card>

                                   {/* Quick Info Card */}
                  {job.quick_info && Object.keys(job.quick_info).length > 0 && (
                    <Card bg={cardBg} shadow={cardShadow} borderRadius="xl">
                      <CardHeader>
                        <Heading size={{ base: 'sm', md: 'md' }} color={textColor}>Quick Info</Heading>
                      </CardHeader>
                      <CardBody pt={2}>
                        <VStack spacing={4} align="stretch">
                          {job.quick_info.experience_level && (
                            <HStack justify="space-between">
                              <Text color={mutedColor} fontSize="sm">Experience</Text>
                              <Badge colorScheme="purple" fontSize="xs">{job.quick_info.experience_level}</Badge>
                            </HStack>
                          )}
                          {job.quick_info.education_level && (
                            <HStack justify="space-between">
                              <Text color={mutedColor} fontSize="sm">Education</Text>
                              <Badge colorScheme="teal" fontSize="xs">{job.quick_info.education_level}</Badge>
                            </HStack>
                          )}
                          {job.quick_info.work_mode && (
                            <HStack justify="space-between">
                              <Text color={mutedColor} fontSize="sm">Work Mode</Text>
                              <Badge colorScheme="orange" fontSize="xs">{job.quick_info.work_mode}</Badge>
                            </HStack>
                          )}
                          {job.quick_info.industry && (
                            <HStack justify="space-between">
                              <Text color={mutedColor} fontSize="sm">Industry</Text>
                              <Text fontWeight="medium" color={textColor} textAlign="right" fontSize="sm" maxW="150px">
                                {job.quick_info.industry}
                              </Text>
                            </HStack>
                          )}
                          {job.quick_info.company_size && (
                            <HStack justify="space-between">
                              <Text color={mutedColor} fontSize="sm">Company Size</Text>
                              <Text fontWeight="medium" color={textColor} textAlign="right" fontSize="sm" maxW="150px">
                                {job.quick_info.company_size}
                              </Text>
                            </HStack>
                          )}
                          {job.quick_info.benefits && Array.isArray(job.quick_info.benefits) && job.quick_info.benefits.length > 0 && (
                            <HStack justify="space-between">
                              <Text color={mutedColor} fontSize="sm">Benefits</Text>
                              <VStack align="end" spacing={1}>
                                {job.quick_info.benefits.slice(0, 3).map((benefit, index) => (
                                  <Badge key={index} colorScheme="green" fontSize="xs">
                                    {benefit}
                                  </Badge>
                                ))}
                                {job.quick_info.benefits.length > 3 && (
                                  <Text fontSize="xs" color={mutedColor}>
                                    +{job.quick_info.benefits.length - 3} more
                                  </Text>
                                )}
                              </VStack>
                            </HStack>
                          )}
                          {job.quick_info.skills && Array.isArray(job.quick_info.skills) && job.quick_info.skills.length > 0 && (
                            <HStack justify="space-between">
                              <Text color={mutedColor} fontSize="sm">Skills</Text>
                              <VStack align="end" spacing={1}>
                                {job.quick_info.skills.slice(0, 3).map((skill, index) => (
                                  <Badge key={index} colorScheme="blue" fontSize="xs">
                                    {skill}
                                  </Badge>
                                ))}
                                {job.quick_info.skills.length > 3 && (
                                  <Text fontSize="xs" color={mutedColor}>
                                    +{job.quick_info.skills.length - 3} more
                                  </Text>
                                )}
                              </VStack>
                            </HStack>
                          )}
                          {job.quick_info.deadline && (
                            <HStack justify="space-between">
                              <Text color={mutedColor} fontSize="sm">Deadline</Text>
                              <Text fontWeight="medium" color={textColor} textAlign="right" fontSize="sm">
                                {formatDate(job.quick_info.deadline)}
                              </Text>
                      </HStack>
                    )}
                  </VStack>
                </CardBody>
              </Card>
                  )}
            </VStack>
          </GridItem>
        </Grid>
        </Stack>
      </Container>
    </Box>
  )
}

export default JobDetails