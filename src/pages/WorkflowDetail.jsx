import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Badge,
  Button,
  Spinner,
  Center,
  Alert,
  AlertIcon,
  useToast,
  Divider,
  Code,
  Collapse,
  useColorModeValue,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Icon,
  Wrap,
  WrapItem,
  Flex,
  Spacer,
  Card,
  CardBody,
  Textarea,
  useDisclosure,
} from '@chakra-ui/react';
import { ChevronRightIcon, ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';
import { 
  FaRobot, 
  FaClock, 
  FaDownload, 
  FaTools, 
  FaExternalLinkAlt,
  FaCopy,
  FaCalendar,
  FaChartLine
} from 'react-icons/fa';
import { Link as RouterLink } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import DisplayAd from '../components/DisplayAd';

const WorkflowDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [workflow, setWorkflow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [jsonContent, setJsonContent] = useState('');
  const [loadingJson, setLoadingJson] = useState(false);
  const { isOpen: isJsonOpen, onToggle: onJsonToggle } = useDisclosure();

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.600', 'gray.300');

  useEffect(() => {
    if (slug) {
      fetchWorkflow();
    }
  }, [slug]);

  const fetchWorkflow = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: workflowData, error: workflowError } = await supabase
        .from('workflows')
        .select(`
          *,
          categories (
            id,
            name,
            slug
          )
        `)
        .eq('slug', slug)
        .single();

      if (workflowError) {
        if (workflowError.code === 'PGRST116') {
          throw new Error('Workflow not found');
        }
        throw workflowError;
      }

      setWorkflow(workflowData);
    } catch (error) {
      console.error('Error fetching workflow:', error);
      setError(error.message || 'Failed to load workflow.');
    } finally {
      setLoading(false);
    }
  };

  const loadJsonContent = async () => {
    if (!workflow?.json_storage_path || jsonContent) return;

    try {
      setLoadingJson(true);
      const { data } = supabase.storage
        .from('workflow-json')
        .getPublicUrl(workflow.json_storage_path);

      if (data?.publicUrl) {
        const response = await fetch(data.publicUrl);
        if (response.ok) {
          const content = await response.text();
          setJsonContent(content);
        } else {
          throw new Error('Failed to fetch JSON content');
        }
      } else {
        throw new Error('Failed to get public URL');
      }
    } catch (error) {
      console.error('Error loading JSON:', error);
      toast({
        title: 'Error',
        description: 'Failed to load workflow JSON content.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoadingJson(false);
    }
  };

  const handleJsonToggle = () => {
    if (!isJsonOpen && !jsonContent) {
      loadJsonContent();
    }
    onJsonToggle();
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner': return 'green';
      case 'intermediate': return 'yellow';
      case 'advanced': return 'red';
      default: return 'gray';
    }
  };

  const handleCopyJson = async () => {
    try {
      if (!jsonContent) {
        await loadJsonContent();
      }
      
      if (jsonContent) {
        await navigator.clipboard.writeText(jsonContent);
        toast({
          title: 'Copied to clipboard!',
          description: 'Workflow JSON has been copied to your clipboard.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        await incrementDownloadCount();
      }
    } catch (error) {
      console.error('Error copying JSON:', error);
      toast({
        title: 'Error',
        description: 'Failed to copy workflow JSON.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDownloadJson = async () => {
    try {
      if (!jsonContent) {
        await loadJsonContent();
      }

      if (jsonContent) {
        const blob = new Blob([jsonContent], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${workflow.slug}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        toast({
          title: 'Download started',
          description: 'Workflow JSON file is being downloaded.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        await incrementDownloadCount();
      }
    } catch (error) {
      console.error('Error downloading JSON:', error);
      toast({
        title: 'Error',
        description: 'Failed to download workflow JSON.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleImportToN8n = async () => {
    await handleCopyJson();
    window.open('https://app.n8n.io/workflows', '_blank');
    toast({
      title: 'Import Instructions',
      description: 'JSON copied! In n8n: Go to Workflows → Import → Paste JSON → Save → Activate',
      status: 'info',
      duration: 8000,
      isClosable: true,
    });
  };

  const incrementDownloadCount = async () => {
    try {
      const { error } = await supabase.rpc('increment_download_count', {
        workflow_id: workflow.id
      });
      if (error) {
        console.error('Error incrementing download count:', error);
      }
    } catch (error) {
      console.error('Error incrementing download count:', error);
    }
  };

  if (loading) {
    return (
      <Center py={20}>
        <VStack spacing={4}>
          <Spinner size="xl" color="green.500" thickness="4px" />
          <Text>Loading workflow...</Text>
        </VStack>
      </Center>
    );
  }

  if (error) {
    return (
      <Container maxW="container.xl" py={8}>
        <Alert status="error" mb={4}>
          <AlertIcon />
          {error}
        </Alert>
        <Button onClick={() => navigate('/n8n-workflows')}>
          Back to Workflows
        </Button>
      </Container>
    );
  }

  if (!workflow) {
    return (
      <Container maxW="container.xl" py={8}>
        <Alert status="info">
          <AlertIcon />
          Workflow not found.
        </Alert>
      </Container>
    );
  }

  return (
    <Box bg={bgColor} minH="100vh" py={8}>
      <Container maxW="container.lg">
        {/* Breadcrumb */}
        <Breadcrumb spacing="8px" separator={<ChevronRightIcon color="gray.500" />} mb={6}>
          <BreadcrumbItem>
            <BreadcrumbLink as={RouterLink} to="/n8n-workflows">
              N8N Workflows
            </BreadcrumbLink>
          </BreadcrumbItem>
          {workflow.categories && (
            <BreadcrumbItem>
              <BreadcrumbLink as={RouterLink} to={`/n8n-workflows?category=${workflow.categories.slug}`}>
                {workflow.categories.name}
              </BreadcrumbLink>
            </BreadcrumbItem>
          )}
          <BreadcrumbItem isCurrentPage>
            <BreadcrumbLink>{workflow.title}</BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>

        <VStack spacing={8} align="stretch">
          {/* Header */}
          <Card bg={cardBg}>
            <CardBody>
              <VStack align="stretch" spacing={6}>
                <VStack align="stretch" spacing={4}>
                  <HStack justify="space-between" align="start" flexWrap="wrap" gap={4}>
                    <Heading size="xl" color="gray.800" _dark={{ color: 'white' }}>
                      {workflow.title}
                    </Heading>
                    {workflow.categories && (
                      <Badge colorScheme="blue" p={2} fontSize="sm">
                        {workflow.categories.name}
                      </Badge>
                    )}
                  </HStack>

                  {/* Meta Information */}
                  <Wrap spacing={3}>
                    {workflow.difficulty_level && (
                      <WrapItem>
                        <Badge colorScheme={getDifficultyColor(workflow.difficulty_level)} p={2}>
                          {workflow.difficulty_level.charAt(0).toUpperCase() + workflow.difficulty_level.slice(1)}
                        </Badge>
                      </WrapItem>
                    )}
                    {workflow.trigger_type && (
                      <WrapItem>
                        <Badge colorScheme="purple" variant="outline" p={2}>
                          <Icon as={FaClock} mr={2} />
                          {workflow.trigger_type}
                        </Badge>
                      </WrapItem>
                    )}
                    <WrapItem>
                      <Badge colorScheme="gray" variant="outline" p={2}>
                        <Icon as={FaDownload} mr={2} />
                        {workflow.downloads_count || 0} downloads
                      </Badge>
                    </WrapItem>
                    {workflow.created_at && (
                      <WrapItem>
                        <Badge colorScheme="gray" variant="outline" p={2}>
                          <Icon as={FaCalendar} mr={2} />
                          Added {new Date(workflow.created_at).toLocaleDateString()}
                        </Badge>
                      </WrapItem>
                    )}
                  </Wrap>
                </VStack>

                {/* Description */}
                <Box>
                  <Text fontSize="lg" lineHeight="1.6" color={textColor}>
                    {workflow.description || 'No description available.'}
                  </Text>
                </Box>

                {/* Action Buttons */}
                <Flex gap={4} flexWrap="wrap">
                  <Button
                    colorScheme="green"
                    size="lg"
                    leftIcon={<FaRobot />}
                    onClick={handleImportToN8n}
                  >
                    Import to N8N
                  </Button>
                  <Button
                    variant="outline"
                    colorScheme="green"
                    size="lg"
                    leftIcon={<FaCopy />}
                    onClick={handleCopyJson}
                  >
                    Copy JSON
                  </Button>
                  <Button
                    variant="outline"
                    colorScheme="blue"
                    size="lg"
                    leftIcon={<FaDownload />}
                    onClick={handleDownloadJson}
                  >
                    Download JSON
                  </Button>
                  {workflow.source_url && (
                    <Button
                      variant="outline"
                      colorScheme="gray"
                      size="lg"
                      leftIcon={<FaExternalLinkAlt />}
                      as="a"
                      href={workflow.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View Source
                    </Button>
                  )}
                </Flex>
              </VStack>
            </CardBody>
          </Card>

          {/* Tools Used */}
          {workflow.tools_used && workflow.tools_used.length > 0 && (
            <Card bg={cardBg}>
              <CardBody>
                <VStack align="stretch" spacing={4}>
                  <HStack>
                    <Icon as={FaTools} color="green.500" />
                    <Heading size="md">Tools & Services Used</Heading>
                  </HStack>
                  <Wrap spacing={2}>
                    {workflow.tools_used.map((tool, index) => (
                      <WrapItem key={index}>
                        <Badge 
                          colorScheme="green" 
                          variant="subtle" 
                          p={2}
                          fontSize="sm"
                        >
                          {tool}
                        </Badge>
                      </WrapItem>
                    ))}
                  </Wrap>
                </VStack>
              </CardBody>
            </Card>
          )}

          {/* JSON Preview */}
          <Card bg={cardBg}>
            <CardBody>
              <VStack align="stretch" spacing={4}>
                <HStack justify="space-between">
                  <Heading size="md">Workflow JSON</Heading>
                  <Button
                    rightIcon={isJsonOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
                    variant="ghost"
                    onClick={handleJsonToggle}
                    size="sm"
                  >
                    {isJsonOpen ? 'Hide' : 'Show'} JSON
                  </Button>
                </HStack>
                
                <Collapse in={isJsonOpen} animateOpacity>
                  <Box>
                    {loadingJson ? (
                      <Center py={8}>
                        <Spinner color="green.500" />
                      </Center>
                    ) : jsonContent ? (
                      <Box position="relative">
                        <Textarea
                          value={jsonContent}
                          isReadOnly
                          fontFamily="mono"
                          fontSize="sm"
                          minH="400px"
                          maxH="600px"
                          resize="vertical"
                          bg={bgColor}
                          border="1px"
                          borderColor={borderColor}
                        />
                        <Button
                          position="absolute"
                          top={2}
                          right={2}
                          size="sm"
                          leftIcon={<FaCopy />}
                          onClick={handleCopyJson}
                          colorScheme="green"
                          variant="solid"
                        >
                          Copy
                        </Button>
                      </Box>
                    ) : (
                      <Text color={textColor}>
                        Failed to load JSON content.
                      </Text>
                    )}
                  </Box>
                </Collapse>
              </VStack>
            </CardBody>
          </Card>

          {/* Import Instructions */}
          <Card bg={cardBg} borderLeft="4px" borderLeftColor="green.400">
            <CardBody>
              <VStack align="stretch" spacing={3}>
                <Heading size="md" color="green.600">
                  How to Import This Workflow
                </Heading>
                <VStack align="stretch" spacing={2} pl={4}>
                  <Text>1. Copy the JSON content above or click "Copy JSON"</Text>
                  <Text>2. Open n8n in your browser</Text>
                  <Text>3. Go to <Code>Workflows</Code> → <Code>Import</Code></Text>
                  <Text>4. Paste the JSON content</Text>
                  <Text>5. Save and activate your workflow</Text>
                </VStack>
              </VStack>
            </CardBody>
          </Card>

          {/* Display Ad - After Workflow Content */}
          <DisplayAd />
        </VStack>
      </Container>
    </Box>
  );
};

export default WorkflowDetail;