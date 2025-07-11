import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Link as ChakraLink,
  Divider,
  Icon,
  Badge,
} from '@chakra-ui/react';
import { FaExternalLinkAlt } from 'react-icons/fa';

const FreeCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('free_courses')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) setError(error.message);
      else setCourses(data);
      setLoading(false);
    };
    fetchCourses();
  }, []);

  return (
    <Box maxW="900px" mx="auto" py={10} px={4}>
      <Heading mb={8} textAlign="center" color="blue.600">Free Courses</Heading>
      {loading ? (
        <Text>Loading...</Text>
      ) : error ? (
        <Text color="red.500">{error}</Text>
      ) : courses.length === 0 ? (
        <Text>No free courses available.</Text>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
          {courses.map((course) => {
            const isNew = (Date.now() - new Date(course.created_at).getTime()) < 3 * 24 * 60 * 60 * 1000;
            return (
              <Card
                key={course.id}
                boxShadow="lg"
                borderRadius="2xl"
                bg="white"
                borderLeft="6px solid #3182ce"
                transition="transform 0.2s, box-shadow 0.2s"
                _hover={{ transform: 'translateY(-6px) scale(1.02)', boxShadow: '2xl' }}
                p={0}
              >
                <CardHeader
                  bgGradient="linear(to-r, blue.500, blue.300)"
                  color="white"
                  borderTopLeftRadius="2xl"
                  borderTopRightRadius="2xl"
                  py={4}
                  px={6}
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  flexWrap="wrap"
                >
                  <Box>
                    <Heading size="md">{course.title}</Heading>
                    <Text fontSize="sm" color="whiteAlpha.800" mt={1}>{course.provider}</Text>
                  </Box>
                  {isNew && <Badge colorScheme="green" ml={2}>New</Badge>}
                </CardHeader>
                <CardBody px={6} py={4}>
                  <Text mb={4} color="gray.700" fontSize="md" fontWeight="medium">
                    {course.description}
                  </Text>
                  <Divider my={2} />
                  <ChakraLink href={course.link} isExternal color="blue.500" fontWeight="bold" fontSize="md">
                    Go to Course <Icon as={FaExternalLinkAlt} ml={1} />
                  </ChakraLink>
                </CardBody>
                <CardFooter px={6} py={3} bg="gray.50" borderBottomLeftRadius="2xl" borderBottomRightRadius="2xl">
                  <Text fontSize="xs" color="gray.500">
                    Posted on {new Date(course.created_at).toLocaleString()}
                  </Text>
                </CardFooter>
              </Card>
            );
          })}
        </SimpleGrid>
      )}
    </Box>
  );
};

export default FreeCourses; 