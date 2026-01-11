import { useState } from 'react'
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  VStack,
  Select,
  useToast,
  Container,
  Heading,
} from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const CreateJob = () => {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    company_name: '',
    company_logo_url: '',
    company_logo_ai_hint: '',
    company_description: '',
    location: '',
    description: '',
    full_description: '',
    requirements: '',
    employment_type: 'full-time',
    salary: '',
    external_apply_link: '',
    tags: '',
  })
  const toast = useToast()
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('You must be logged in to create a job post')
      }

      // Basic validation for required fields before preparing data
      if (!formData.title || !formData.company_name || !formData.location || !formData.description || !formData.requirements || !formData.employment_type || !formData.salary) {
         toast({
          title: 'Please fill in all required fields.',
          status: 'warning',
          duration: 3000,
          isClosable: true,
        })
        setLoading(false)
        return
      }

      // Prepare data for insertion, ensuring correct types and handling potential nulls
      const jobData = {
        title: formData.title,
        company_name: formData.company_name,
        company_logo_url: formData.company_logo_url || null, // Send null if empty string
        company_logo_ai_hint: formData.company_logo_ai_hint || null, // Send null if empty string
        company_description: formData.company_description || null, // Send null if empty string
        location: formData.location,
        description: formData.description,
        full_description: formData.full_description || null, // Send null if empty string
        requirements: formData.requirements,
        employment_type: formData.employment_type,
        salary: formData.salary,
        external_apply_link: formData.external_apply_link || null, // Send null if empty string
        // Assuming tags is a text column, send the raw string
        tags: formData.tags || null, // Send null if empty string
        created_by: user.id,
        // Let Supabase handle created_at and posted_date with default values if they exist
        // created_at: new Date().toISOString(),
        // posted_date: new Date().toISOString(),
      }

      const { data, error } = await supabase
        .from('job_postings')
        .insert([
          jobData
        ])
        .select()

      if (error) throw error

      toast({
        title: 'Job created successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })

      navigate('/')
    } catch (error) {
      toast({
        title: 'Error creating job',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container maxW="container.md" py={8}>
      <VStack spacing={8} align="stretch">
        <Heading>Create New Job Post</Heading>
        
        <Box as="form" onSubmit={handleSubmit}>
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Job Title</FormLabel>
              <Input
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Senior Software Engineer"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Company Name</FormLabel>
              <Input
                name="company_name"
                value={formData.company_name}
                onChange={handleChange}
                placeholder="Company name"
              />
            </FormControl>

            <FormControl>
              <FormLabel>Company Logo URL</FormLabel>
              <Input
                name="company_logo_url"
                value={formData.company_logo_url}
                onChange={handleChange}
                placeholder="e.g. https://company.com/logo.png"
              />
            </FormControl>

            <FormControl>
              <FormLabel>Company Logo AI Hint</FormLabel>
              <Input
                name="company_logo_ai_hint"
                value={formData.company_logo_ai_hint}
                onChange={handleChange}
                placeholder="e.g. a minimalist logo of a blue bird"
              />
            </FormControl>

            <FormControl>
              <FormLabel>Company Description (Short)</FormLabel>
              <Textarea
                name="company_description"
                value={formData.company_description}
                onChange={handleChange}
                placeholder="A brief description of the company..."
                rows={3}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Location</FormLabel>
              <Input
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g. Remote, New York, etc."
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Job Description (Short)</FormLabel>
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Short job teaser..."
                rows={3}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Full Job Description</FormLabel>
              <Textarea
                name="full_description"
                value={formData.full_description}
                onChange={handleChange}
                placeholder="Detailed job description..."
                rows={6}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Requirements</FormLabel>
              <Textarea
                name="requirements"
                value={formData.requirements}
                onChange={handleChange}
                placeholder="Required skills and qualifications..."
                rows={4}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Employment Type</FormLabel>
              <Select name="employment_type" value={formData.employment_type} onChange={handleChange}>
                <option value="full-time">Full Time</option>
                <option value="part-time">Part Time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
              </Select>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Salary Range</FormLabel>
              <Input
                name="salary"
                value={formData.salary}
                onChange={handleChange}
                placeholder="e.g. $80,000 - $100,000"
              />
            </FormControl>

            <FormControl>
              <FormLabel>External Apply Link</FormLabel>
              <Input
                name="external_apply_link"
                value={formData.external_apply_link}
                onChange={handleChange}
                placeholder="e.g. https://company.com/apply"
              />
            </FormControl>

            <FormControl>
              <FormLabel>Tags (comma-separated)</FormLabel>
              <Input
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="e.g. react, javascript, remote"
              />
            </FormControl>

            <Button
              type="submit"
              colorScheme="blue"
              size="lg"
              width="full"
              isLoading={loading}
            >
              Create Job Post
            </Button>
          </VStack>
        </Box>
      </VStack>
    </Container>
  )
}

export default CreateJob 