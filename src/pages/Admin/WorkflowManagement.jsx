import React, { useState } from 'react';
import {
  Box,
  Container,
  Heading,
  VStack,
  HStack,
  Button,
  Text,
  Progress,
  Alert,
  AlertIcon,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Badge,
  useToast,
  useColorModeValue,
  Stat,
  StatLabel,
  StatNumber,
  StatGroup,
  Spinner,
  Code,
} from '@chakra-ui/react';
import { FaSync, FaCloudDownloadAlt, FaDatabase, FaCheckCircle } from 'react-icons/fa';
import { triggerWorkflowIngestion } from '../../lib/workflowIngestion';
import { supabase } from '../../lib/supabase';

const WorkflowManagement = () => {
  const [isIngesting, setIsIngesting] = useState(false);
  const [ingestionProgress, setIngestionProgress] = useState(null);
  const [ingestionResult, setIngestionResult] = useState(null);
  const [stats, setStats] = useState({
    totalWorkflows: 0,
    totalCategories: 0,
    totalDownloads: 0,
    recentWorkflows: 0,
  });
  const [loadingStats, setLoadingStats] = useState(false);

  const toast = useToast();
  const cardBg = useColorModeValue('white', 'gray.800');
  const bgColor = useColorModeValue('gray.50', 'gray.900');

  React.useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      // Get workflow count
      const { count: workflowCount } = await supabase
        .from('workflows')
        .select('*', { count: 'exact', head: true });

      // Get category count
      const { count: categoryCount } = await supabase
        .from('categories')
        .select('*', { count: 'exact', head: true });

      // Get total downloads
      const { data: downloadData } = await supabase
        .from('workflows')
        .select('downloads_count');
      
      const totalDownloads = downloadData?.reduce((sum, workflow) => 
        sum + (workflow.downloads_count || 0), 0) || 0;

      // Get recent workflows (last 7 days)
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      const { count: recentCount } = await supabase
        .from('workflows')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', weekAgo.toISOString());

      setStats({
        totalWorkflows: workflowCount || 0,
        totalCategories: categoryCount || 0,
        totalDownloads,
        recentWorkflows: recentCount || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast({
        title: 'Error',
        description: 'Failed to load statistics.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoadingStats(false);
    }
  };

  const handleIngestion = async () => {
    setIsIngesting(true);
    setIngestionProgress(null);
    setIngestionResult(null);

    toast({
      title: 'Starting Ingestion',
      description: 'Fetching workflows from GitHub...',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });

    try {
      const result = await triggerWorkflowIngestion();
      setIngestionResult(result);
      
      if (result.success) {
        toast({
          title: 'Ingestion Complete',
          description: result.message,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        // Refresh stats after successful ingestion
        await fetchStats();
      } else {
        toast({
          title: 'Ingestion Failed',
          description: result.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Ingestion error:', error);
      setIngestionResult({
        success: false,
        error: error.message,
        message: `Ingestion failed: ${error.message}`
      });
      toast({
        title: 'Ingestion Failed',
        description: 'An unexpected error occurred.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsIngesting(false);
    }
  };

  const handleCreateBucket = async () => {
    try {
      const { data, error } = await supabase.storage.createBucket('workflow-json', {
        public: true,
        allowedMimeTypes: ['application/json'],
        fileSizeLimit: 1024 * 1024, // 1MB
      });

      if (error) {
        throw error;
      }

      toast({
        title: 'Storage Bucket Created',
        description: 'The workflow-json storage bucket has been created.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error creating bucket:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create storage bucket.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Box bg={bgColor} minH="100vh" py={8}>
      <Container maxW="container.lg">
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <VStack spacing={4} textAlign="center">
            <Heading size="xl" color="green.600">
              N8N Workflow Management
            </Heading>
            <Text fontSize="lg" color="gray.600">
              Manage and import workflows from the GitHub repository
            </Text>
          </VStack>

          {/* Statistics */}
          <Card bg={cardBg}>
            <CardHeader>
              <HStack justify="space-between">
                <Heading size="md">Statistics</Heading>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={fetchStats}
                  isLoading={loadingStats}
                  leftIcon={<FaSync />}
                >
                  Refresh
                </Button>
              </HStack>
            </CardHeader>
            <CardBody pt={0}>
              {loadingStats ? (
                <Spinner />
              ) : (
                <StatGroup>
                  <Stat>
                    <StatLabel>Total Workflows</StatLabel>
                    <StatNumber color="green.500">{stats.totalWorkflows}</StatNumber>
                  </Stat>
                  <Stat>
                    <StatLabel>Categories</StatLabel>
                    <StatNumber color="blue.500">{stats.totalCategories}</StatNumber>
                  </Stat>
                  <Stat>
                    <StatLabel>Total Downloads</StatLabel>
                    <StatNumber color="purple.500">{stats.totalDownloads}</StatNumber>
                  </Stat>
                  <Stat>
                    <StatLabel>Recent (7 days)</StatLabel>
                    <StatNumber color="orange.500">{stats.recentWorkflows}</StatNumber>
                  </Stat>
                </StatGroup>
              )}
            </CardBody>
          </Card>

          {/* Ingestion Control */}
          <Card bg={cardBg}>
            <CardHeader>
              <Heading size="md">Data Ingestion</Heading>
            </CardHeader>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <Text color="gray.600">
                  Import workflows from the GitHub repository: 
                  <Code mx={2}>enescingoz/awesome-n8n-templates</Code>
                </Text>

                {/* Ingestion Button */}
                <HStack spacing={4}>
                  <Button
                    colorScheme="green"
                    size="lg"
                    leftIcon={<FaCloudDownloadAlt />}
                    onClick={handleIngestion}
                    isLoading={isIngesting}
                    loadingText="Processing..."
                    flex="1"
                  >
                    Import Workflows from GitHub
                  </Button>
                  <Button
                    colorScheme="blue"
                    variant="outline"
                    leftIcon={<FaDatabase />}
                    onClick={handleCreateBucket}
                  >
                    Create Storage Bucket
                  </Button>
                </HStack>

                {/* Progress Display */}
                {ingestionProgress && (
                  <Box>
                    <Text fontSize="sm" mb={2}>
                      Processing: {ingestionProgress.current}
                    </Text>
                    <Progress
                      value={(ingestionProgress.processed / ingestionProgress.total) * 100}
                      colorScheme="green"
                      size="lg"
                      borderRadius="md"
                    />
                    <Text fontSize="xs" color="gray.500" mt={1}>
                      {ingestionProgress.processed} of {ingestionProgress.total} workflows processed
                    </Text>
                  </Box>
                )}

                {/* Result Display */}
                {ingestionResult && (
                  <Alert status={ingestionResult.success ? 'success' : 'error'}>
                    <AlertIcon />
                    <VStack align="start" spacing={1}>
                      <Text fontWeight="semibold">
                        {ingestionResult.success ? 'Ingestion Completed' : 'Ingestion Failed'}
                      </Text>
                      <Text fontSize="sm">{ingestionResult.message}</Text>
                      {ingestionResult.success && (
                        <HStack spacing={2} mt={2}>
                          <Badge colorScheme="green">
                            <FaCheckCircle style={{ marginRight: '4px' }} />
                            {ingestionResult.processed} workflows processed
                          </Badge>
                        </HStack>
                      )}
                    </VStack>
                  </Alert>
                )}
              </VStack>
            </CardBody>
          </Card>

          {/* Instructions */}
          <Card bg={cardBg}>
            <CardHeader>
              <Heading size="md">Setup Instructions</Heading>
            </CardHeader>
            <CardBody>
              <VStack spacing={4} align="stretch">
                <Text fontWeight="semibold" color="gray.700" _dark={{ color: 'gray.200' }}>
                  Before importing workflows, make sure you have:
                </Text>
                
                <VStack align="stretch" spacing={2} pl={4}>
                  <Text fontSize="sm">
                    1. Created the database schema by running the SQL file:
                    <Code ml={2}>n8n_workflows_schema.sql</Code>
                  </Text>
                  <Text fontSize="sm">
                    2. Created the storage bucket 
                    <Code mx={2}>workflow-json</Code>
                    with public read access
                  </Text>
                  <Text fontSize="sm">
                    3. Configured your admin permissions in the RLS policies
                  </Text>
                  <Text fontSize="sm">
                    4. Enabled public access to the storage bucket for JSON files
                  </Text>
                </VStack>

                <Divider />

                <Text fontSize="sm" color="gray.600">
                  The ingestion process will:
                </Text>
                <VStack align="stretch" spacing={1} pl={4}>
                  <Text fontSize="xs">• Fetch markdown files from the GitHub repository</Text>
                  <Text fontSize="xs">• Parse workflow information from the markdown</Text>
                  <Text fontSize="xs">• Download JSON files and store them in Supabase Storage</Text>
                  <Text fontSize="xs">• Insert or update workflow metadata in the database</Text>
                  <Text fontSize="xs">• Extract tools and categorize workflows automatically</Text>
                </VStack>
              </VStack>
            </CardBody>
          </Card>
        </VStack>
      </Container>
    </Box>
  );
};

export default WorkflowManagement;