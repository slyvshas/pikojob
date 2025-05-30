import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Container,
  Heading,
  VStack,
  Button,
  useToast,
  SimpleGrid,
  Text,
  Image,
  Flex,
  IconButton,
  Badge,
  HStack,
} from '@chakra-ui/react'
import { FaBookmark, FaMapMarkerAlt, FaBriefcase, FaMoneyBillWave } from 'react-icons/fa'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

const SavedJobs = () => {
  const [savedJobs, setSavedJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const toast = useToast()
  const { user } = useAuth()

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    fetchSavedJobs()
  }, [user, navigate])

  const fetchSavedJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('saved_jobs')
        .select(`
          job_id,
          created_at,
          job_postings (
            id,
            title,
            company_name,
            company_logo_url,
            location,
            employment_type,
            salary,
            tags
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      setSavedJobs(data.map(item => ({
        ...item.job_postings,
        saved_at: item.created_at
      })))
    } catch (error) {
      console.error('Error fetching saved jobs:', error)
      toast({
        title: 'Error',
        description: 'Failed to load saved jobs',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUnsaveJob = async (jobId) => {
    try {
      const { error } = await supabase
        .from('saved_jobs')
        .delete()
        .eq('user_id', user.id)
        .eq('job_id', jobId)

      if (error) throw error

      setSavedJobs(prev => prev.filter(job => job.id !== jobId))

      toast({
        title: 'Job Unsaved',
        description: 'Job has been removed from your saved jobs',
        status: 'info',
        duration: 3000,
        isClosable: true,
      })
    } catch (error) {
      console.error('Error unsaving job:', error)
      toast({
        title: 'Error',
        description: 'Failed to unsave job',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  if (!user) {
    return (
      <Container maxW="container.md" py={8}>
        <Box textAlign="center">
          <Heading size="lg">Please sign in to view your saved jobs</Heading>
          <Button mt={4} onClick={() => navigate('/login')}>Sign In</Button>
        </Box>
      </Container>
    )
  }

  return (
    <Container maxW="container.md" py={8}>
      <VStack spacing={8} align="stretch">
        <Heading>Saved Jobs</Heading>

        <Box>
          {loading ? (
            <Text>Loading saved jobs...</Text>
          ) : savedJobs.length === 0 ? (
            <Text>You haven't saved any jobs yet.</Text>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
              {savedJobs.map((job) => (
                <Box
                  key={job.id}
                  p={6}
                  borderRadius="2xl"
                  boxShadow="md"
                  borderWidth="1px"
                  borderColor="gray.200"
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
                        aria-label="Unsave job"
                        icon={<FaBookmark />} // Or a different icon for unsave, like FaSolidBookmark
                        colorScheme="blue"
                        variant="ghost"
                        onClick={() => handleUnsaveJob(job.id)}
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
                      <Text>Saved on: {new Date(job.saved_at).toLocaleDateString()}</Text>
                    </VStack>

                    {job.tags && (
                      <Flex wrap="wrap" gap={2}>
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

                    <Button
                      onClick={() => navigate(`/jobs/${job.id}`)}
                      colorScheme="blue"
                      size="md"
                      width="100%"
                    >
                      View Job Details
                    </Button>
                  </VStack>
                </Box>
              ))}
            </SimpleGrid>
          )}
        </Box>
      </VStack>
    </Container>
  )
}

export default SavedJobs 