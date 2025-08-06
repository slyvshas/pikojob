import React, { useState, useEffect } from 'react'
import {
  Box,
  Container,
  Heading,
  VStack,
  Button,
  useToast,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  useDisclosure,
  Badge,
  HStack,
  Text,
} from '@chakra-ui/react'
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'

const JobManagement = () => {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingJob, setEditingJob] = useState(null)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const toast = useToast()
  const { user } = useAuth()

  const [formData, setFormData] = useState({
    title: '',
    company_name: '',
    company_logo_url: '',
    company_description_short: '',
    location: '',
    employment_type: '',
    salary: '',
    description: '',
    requirements: '',
    external_apply_link: '',
    tags: '',
    is_featured: 'false',
    // Quick Info fields
    industry: '',
    experience_level: '',
    company_size: '',
    work_mode: '',
    benefits: '',
    skills: '',
    deadline: '',
  })

  useEffect(() => {
    if (!user) return
    fetchJobs()
  }, [user])

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('job_postings')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setJobs(data)
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

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      // Prepare quick_info object
      const quickInfo = {}
      if (formData.industry) quickInfo.industry = formData.industry
      if (formData.experience_level) quickInfo.experience_level = formData.experience_level
      if (formData.company_size) quickInfo.company_size = formData.company_size
      if (formData.work_mode) quickInfo.work_mode = formData.work_mode
      if (formData.benefits) quickInfo.benefits = formData.benefits.split(',').map(b => b.trim()).filter(b => b)
      if (formData.skills) quickInfo.skills = formData.skills.split(',').map(s => s.trim()).filter(s => s)
      if (formData.deadline) quickInfo.deadline = formData.deadline

      const jobData = {
        ...formData,
        is_featured: formData.is_featured === 'true',
        created_by: user.id,
        requirements: formData.requirements || null,
        quick_info: Object.keys(quickInfo).length > 0 ? quickInfo : null,
        // Remove quick info fields from main data
        industry: undefined,
        experience_level: undefined,
        company_size: undefined,
        work_mode: undefined,
        benefits: undefined,
        skills: undefined,
        deadline: undefined,
      }

      if (editingJob) {
        // Update existing job
        const { error } = await supabase
          .from('job_postings')
          .update(jobData)
          .eq('id', editingJob.id)

        if (error) throw error

        toast({
          title: 'Success',
          description: 'Job updated successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
      } else {
        // Create new job
        const { error } = await supabase
          .from('job_postings')
          .insert([jobData])
          .select()

        if (error) throw error

        toast({
          title: 'Success',
          description: 'Job created successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
      }

      onClose()
      fetchJobs()
      resetForm()
    } catch (error) {
      console.error('Error saving job:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to save job',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  const handleEdit = (job) => {
    setEditingJob(job)
    const quickInfo = job.quick_info || {}
    
    setFormData({
      title: job.title,
      company_name: job.company_name,
      company_logo_url: job.company_logo_url,
      company_description_short: job.company_description_short || '',
      location: job.location,
      employment_type: job.employment_type,
      salary: job.salary,
      description: job.description,
      requirements: job.requirements || '',
      external_apply_link: job.external_apply_link,
      tags: job.tags,
      is_featured: job.is_featured ? 'true' : 'false',
      // Quick Info fields
      industry: quickInfo.industry || '',
      experience_level: quickInfo.experience_level || '',
      company_size: quickInfo.company_size || '',
      work_mode: quickInfo.work_mode || '',
      benefits: quickInfo.benefits ? quickInfo.benefits.join(', ') : '',
      skills: quickInfo.skills ? quickInfo.skills.join(', ') : '',
      deadline: quickInfo.deadline || '',
    })
    onOpen()
  }

  const handleDelete = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job?')) return

    try {
      const { error } = await supabase
        .from('job_postings')
        .delete()
        .eq('id', jobId)

      if (error) throw error

      toast({
        title: 'Success',
        description: 'Job deleted successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })

      fetchJobs()
    } catch (error) {
      console.error('Error deleting job:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete job',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  const resetForm = () => {
    setEditingJob(null)
    setFormData({
      title: '',
      company_name: '',
      company_logo_url: '',
      company_description_short: '',
      location: '',
      employment_type: '',
      salary: '',
      description: '',
      requirements: '',
      external_apply_link: '',
      tags: '',
      is_featured: 'false',
      // Quick Info fields
      industry: '',
      experience_level: '',
      company_size: '',
      work_mode: '',
      benefits: '',
      skills: '',
      deadline: '',
    })
  }

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <HStack justify="space-between">
          <Heading>Job Management</Heading>
          <Button
            leftIcon={<FaPlus />}
            colorScheme="blue"
            onClick={() => {
              resetForm()
              onOpen()
            }}
          >
            Add New Job
          </Button>
        </HStack>

        <Box overflowX="auto">
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Title</Th>
                <Th>Company</Th>
                <Th>Location</Th>
                <Th>Type</Th>
                <Th>Featured</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {jobs.map((job) => (
                <Tr key={job.id}>
                  <Td>{job.title}</Td>
                  <Td>{job.company_name}</Td>
                  <Td>{job.location}</Td>
                  <Td>{job.employment_type}</Td>
                  <Td>
                    {job.is_featured ? (
                      <Badge colorScheme="green">Featured</Badge>
                    ) : (
                      <Badge colorScheme="gray">Regular</Badge>
                    )}
                  </Td>
                  <Td>
                    <HStack spacing={2}>
                      <IconButton
                        icon={<FaEdit />}
                        aria-label="Edit job"
                        size="sm"
                        onClick={() => handleEdit(job)}
                      />
                      <IconButton
                        icon={<FaTrash />}
                        aria-label="Delete job"
                        size="sm"
                        colorScheme="red"
                        onClick={() => handleDelete(job.id)}
                      />
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>

        <Modal isOpen={isOpen} onClose={onClose} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>{editingJob ? 'Edit Job' : 'Add New Job'}</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <form onSubmit={handleSubmit}>
                <VStack spacing={4}>
                  <FormControl isRequired>
                    <FormLabel>Job Title</FormLabel>
                    <Input
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Company Name</FormLabel>
                    <Input
                      name="company_name"
                      value={formData.company_name}
                      onChange={handleInputChange}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Company Logo URL</FormLabel>
                    <Input
                      name="company_logo_url"
                      value={formData.company_logo_url}
                      onChange={handleInputChange}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Company Description (Short)</FormLabel>
                    <Textarea
                      name="company_description_short"
                      value={formData.company_description_short}
                      onChange={handleInputChange}
                      placeholder="A brief description of the company..."
                      rows={2}
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Location</FormLabel>
                    <Input
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Employment Type</FormLabel>
                    <Select
                      name="employment_type"
                      value={formData.employment_type}
                      onChange={handleInputChange}
                    >
                      <option value="">Select type</option>
                      <option value="full-time">Full Time</option>
                      <option value="part-time">Part Time</option>
                      <option value="contract">Contract</option>
                      <option value="internship">Internship</option>
                    </Select>
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Salary</FormLabel>
                    <Input
                      name="salary"
                      value={formData.salary}
                      onChange={handleInputChange}
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Description</FormLabel>
                    <Textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Requirements</FormLabel>
                    <Textarea
                      name="requirements"
                      value={formData.requirements}
                      onChange={handleInputChange}
                      placeholder="Enter job requirements (optional)"
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>External Apply Link</FormLabel>
                    <Input
                      name="external_apply_link"
                      value={formData.external_apply_link}
                      onChange={handleInputChange}
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Tags (comma-separated)</FormLabel>
                    <Input
                      name="tags"
                      value={formData.tags}
                      onChange={handleInputChange}
                      placeholder="e.g., React, Node.js, Python"
                    />
                  </FormControl>

                  {/* Quick Info Section */}
                  <Box w="100%" p={4} bg="gray.50" borderRadius="md">
                    <Text fontWeight="semibold" mb={3} color="gray.700">Quick Info (Optional)</Text>
                    <Text fontSize="sm" color="gray.600" mb={4}>
                      These fields will be displayed in the job details sidebar to provide quick information to job seekers.
                    </Text>
                    
                    <VStack spacing={3}>
                      <FormControl>
                        <FormLabel fontSize="sm">Industry</FormLabel>
                        <Input
                          name="industry"
                          value={formData.industry}
                          onChange={handleInputChange}
                          placeholder="e.g., Technology, Healthcare, Finance"
                          size="sm"
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel fontSize="sm">Experience Level</FormLabel>
                        <Select
                          name="experience_level"
                          value={formData.experience_level}
                          onChange={handleInputChange}
                          size="sm"
                        >
                          <option value="">Select Experience Level</option>
                          <option value="Entry Level">Entry Level</option>
                          <option value="Mid Level">Mid Level</option>
                          <option value="Senior Level">Senior Level</option>
                          <option value="Executive">Executive</option>
                        </Select>
                      </FormControl>

                      <FormControl>
                        <FormLabel fontSize="sm">Company Size</FormLabel>
                        <Select
                          name="company_size"
                          value={formData.company_size}
                          onChange={handleInputChange}
                          size="sm"
                        >
                          <option value="">Select Company Size</option>
                          <option value="1-10 employees">1-10 employees</option>
                          <option value="11-50 employees">11-50 employees</option>
                          <option value="51-200 employees">51-200 employees</option>
                          <option value="201-500 employees">201-500 employees</option>
                          <option value="501-1000 employees">501-1000 employees</option>
                          <option value="1000+ employees">1000+ employees</option>
                        </Select>
                      </FormControl>

                      <FormControl>
                        <FormLabel fontSize="sm">Work Mode</FormLabel>
                        <Select
                          name="work_mode"
                          value={formData.work_mode}
                          onChange={handleInputChange}
                          size="sm"
                        >
                          <option value="">Select Work Mode</option>
                          <option value="Remote">Remote</option>
                          <option value="On-site">On-site</option>
                          <option value="Hybrid">Hybrid</option>
                        </Select>
                      </FormControl>

                      <FormControl>
                        <FormLabel fontSize="sm">Benefits (comma-separated)</FormLabel>
                        <Input
                          name="benefits"
                          value={formData.benefits}
                          onChange={handleInputChange}
                          placeholder="e.g., Health Insurance, 401k, Flexible Hours"
                          size="sm"
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel fontSize="sm">Required Skills (comma-separated)</FormLabel>
                        <Input
                          name="skills"
                          value={formData.skills}
                          onChange={handleInputChange}
                          placeholder="e.g., React, Node.js, PostgreSQL"
                          size="sm"
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel fontSize="sm">Application Deadline</FormLabel>
                        <Input
                          name="deadline"
                          type="date"
                          value={formData.deadline}
                          onChange={handleInputChange}
                          size="sm"
                        />
                      </FormControl>
                    </VStack>
                  </Box>

                  <FormControl>
                    <FormLabel>Featured Job</FormLabel>
                    <Select
                      name="is_featured"
                      value={formData.is_featured}
                      onChange={handleInputChange}
                      bg={formData.is_featured === 'true' ? 'green.50' : 'white'}
                      borderColor={formData.is_featured === 'true' ? 'green.500' : 'gray.200'}
                      _hover={{ borderColor: formData.is_featured === 'true' ? 'green.600' : 'gray.300' }}
                    >
                      <option value="false">No</option>
                      <option value="true">Yes</option>
                    </Select>
                    <Text fontSize="sm" color="gray.500" mt={1}>
                      Featured jobs will be highlighted on the home page
                    </Text>
                  </FormControl>

                  <Button type="submit" colorScheme="blue" width="100%">
                    {editingJob ? 'Update Job' : 'Create Job'}
                  </Button>
                </VStack>
              </form>
            </ModalBody>
          </ModalContent>
        </Modal>
      </VStack>
    </Container>
  )
}

export default JobManagement 