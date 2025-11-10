import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  SimpleGrid,
  Icon,
  Stack,
  useColorModeValue
} from '@chakra-ui/react'
import { FaRocket, FaUsers, FaLightbulb, FaHeart } from 'react-icons/fa'

const Feature = ({ title, text, icon }) => {
  return (
    <Stack
      bg={useColorModeValue('white', 'gray.800')}
      p={6}
      rounded="lg"
      shadow="md"
      _hover={{
        transform: 'translateY(-4px)',
        shadow: 'xl',
      }}
      transition="all 0.3s ease"
    >
      <Icon as={icon} w={10} h={10} color="blue.500" mb={2} />
      <Text fontWeight="600" fontSize="lg">{title}</Text>
      <Text color={useColorModeValue('gray.600', 'gray.400')}>{text}</Text>
    </Stack>
  )
}

const AboutUs = () => {
  const bgColor = useColorModeValue('gray.50', 'gray.900')

  return (
    <Box bg={bgColor} minH="calc(100vh - 64px)" py={12}>
      <Container maxW="container.xl">
        <VStack spacing={12} align="stretch">
          {/* Hero Section */}
          <VStack spacing={4} textAlign="center">
            <Heading
              as="h1"
              size="2xl"
              bgGradient="linear(to-r, blue.400, purple.500)"
              bgClip="text"
            >
              About Growlytic
            </Heading>
            <Text fontSize="xl" color={useColorModeValue('gray.600', 'gray.400')} maxW="3xl">
              Your one-stop platform for career growth, learning opportunities, and professional development.
            </Text>
          </VStack>

          {/* Mission Section */}
          <Box
            bg={useColorModeValue('white', 'gray.800')}
            p={8}
            rounded="lg"
            shadow="lg"
          >
            <Heading as="h2" size="xl" mb={4} color="blue.500">
              Our Mission
            </Heading>
            <Text fontSize="lg" color={useColorModeValue('gray.700', 'gray.300')} lineHeight="tall">
              At Growlytic, we believe that everyone deserves access to quality career opportunities and educational resources. 
              Our platform connects job seekers with exciting opportunities, provides free learning resources, and keeps you 
              updated with the latest in professional development. We're committed to empowering individuals to achieve their 
              career goals and unlock their full potential.
            </Text>
          </Box>

          {/* Values Section */}
          <VStack spacing={6} align="stretch">
            <Heading as="h2" size="xl" textAlign="center">
              What We Offer
            </Heading>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
              <Feature
                icon={FaRocket}
                title="Job Opportunities"
                text="Browse thousands of job postings across various industries and find your perfect match."
              />
              <Feature
                icon={FaLightbulb}
                title="Free Learning"
                text="Access free courses and books to upskill yourself and stay competitive in the job market."
              />
              <Feature
                icon={FaUsers}
                title="Community"
                text="Join a community of like-minded professionals sharing opportunities and insights."
              />
              <Feature
                icon={FaHeart}
                title="Free Forever"
                text="All our resources are completely free because we believe education should be accessible to all."
              />
            </SimpleGrid>
          </VStack>

          {/* Story Section */}
          <Box
            bg={useColorModeValue('blue.50', 'gray.800')}
            p={8}
            rounded="lg"
            borderLeft="4px"
            borderColor="blue.500"
          >
            <Heading as="h2" size="lg" mb={4}>
              Our Story
            </Heading>
            <Text fontSize="md" color={useColorModeValue('gray.700', 'gray.300')} lineHeight="tall">
              Growlytic was born from the vision of making career resources accessible to everyone. We started as a small 
              project to help job seekers find opportunities, but quickly grew into a comprehensive platform that includes 
              free courses, books, scholarships, and more. Today, we serve thousands of users worldwide, helping them 
              navigate their career paths and achieve their professional dreams.
            </Text>
          </Box>
        </VStack>
      </Container>
    </Box>
  )
}

export default AboutUs
