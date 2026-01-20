import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Button,
  Image,
  Icon,
  Tooltip,
  useColorModeValue,
  useToast,
  Link as ChakraLink,
  Wrap,
  WrapItem,
  Flex,
  Spacer,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { 
  ExternalLinkIcon, 
  DownloadIcon, 
  CopyIcon, 
  ViewIcon,
  StarIcon 
} from '@chakra-ui/icons';
import { FaRobot, FaClock, FaDownload, FaTools } from 'react-icons/fa';
import { supabase } from '../lib/supabase';

const WorkflowCard = ({ workflow }) => {
  const toast = useToast();
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const badgeBg = useColorModeValue('gray.50', 'gray.700');

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
      if (!workflow.json_storage_path) {
        // Fallback to source URL if no JSON storage path
        if (workflow.source_url) {
          const response = await fetch(workflow.source_url);
          if (response.ok) {
            const jsonContent = await response.text();
            await navigator.clipboard.writeText(jsonContent);
            
            toast({
              title: 'Copied to clipboard!',
              description: 'Workflow JSON has been copied to your clipboard.',
              status: 'success',
              duration: 3000,
              isClosable: true,
            });
            
            await incrementDownloadCount();
            return;
          }
        }
        
        toast({
          title: 'Error',
          description: 'No JSON file available for this workflow.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      // Get the public URL for the JSON file from Supabase Storage
      const { data } = supabase.storage
        .from('workflow-json')
        .getPublicUrl(workflow.json_storage_path);

      if (data?.publicUrl) {
        // Fetch the JSON content from YOUR site
        const response = await fetch(data.publicUrl);
        if (response.ok) {
          const jsonContent = await response.text();
          await navigator.clipboard.writeText(jsonContent);
          
          toast({
            title: 'Copied to clipboard!',
            description: 'Workflow JSON has been copied to your clipboard.',
            status: 'success',
            duration: 3000,
            isClosable: true,
          });

          // Increment download count
          await incrementDownloadCount();
        } else {
          // Fallback to source URL if storage file not found
          if (workflow.source_url) {
            const fallbackResponse = await fetch(workflow.source_url);
            if (fallbackResponse.ok) {
              const jsonContent = await fallbackResponse.text();
              await navigator.clipboard.writeText(jsonContent);
              
              toast({
                title: 'Copied to clipboard!',
                description: 'Workflow JSON has been copied to your clipboard.',
                status: 'success',
                duration: 3000,
                isClosable: true,
              });
              
              await incrementDownloadCount();
            } else {
              throw new Error('Failed to fetch JSON content');
            }
          } else {
            throw new Error('Failed to fetch JSON content');
          }
        }
      } else {
        throw new Error('Failed to get public URL');
      }
    } catch (error) {
      console.error('Error copying JSON:', error);
      toast({
        title: 'Error',
        description: 'Failed to copy workflow JSON. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDownloadJson = async () => {
    try {
      let jsonContent = '';
      
      if (workflow.json_storage_path) {
        // Try to get from Supabase Storage first
        const { data } = supabase.storage
          .from('workflow-json')
          .getPublicUrl(workflow.json_storage_path);

        if (data?.publicUrl) {
          const response = await fetch(data.publicUrl);
          if (response.ok) {
            jsonContent = await response.text();
          }
        }
      }
      
      // Fallback to source URL if storage fails or no storage path
      if (!jsonContent && workflow.source_url) {
        const response = await fetch(workflow.source_url);
        if (response.ok) {
          jsonContent = await response.text();
        }
      }
      
      if (!jsonContent) {
        toast({
          title: 'Error',
          description: 'No JSON file available for this workflow.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
        return;
      }
      
      // Create download link
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${workflow.slug || 'workflow'}.json`;
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

      // Increment download count
      await incrementDownloadCount();
    } catch (error) {
      console.error('Error downloading JSON:', error);
      toast({
        title: 'Error',
        description: 'Failed to download workflow JSON. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleImportToN8n = async () => {
    await handleCopyJson();
    
    // Open n8n in a new tab
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

  return (
    <Box
      bg={cardBg}
      borderRadius="xl"
      border="1px"
      borderColor={borderColor}
      p={6}
      _hover={{
        transform: 'translateY(-4px)',
        boxShadow: 'xl',
        borderColor: 'green.300',
      }}
      transition="all 0.3s ease"
      position="relative"
      overflow="hidden"
    >
      {/* Category Badge */}
      {workflow.categories && (
        <Badge
          position="absolute"
          top={3}
          right={3}
          colorScheme="blue"
          variant="subtle"
          fontSize="xs"
        >
          {workflow.categories.name}
        </Badge>
      )}

      <VStack align="stretch" spacing={4} h="full">
        {/* Header */}
        <VStack align="stretch" spacing={2}>
          <HStack justify="space-between" align="start">
            <Text
              fontSize="lg"
              fontWeight="bold"
              color="gray.800"
              _dark={{ color: 'white' }}
              lineHeight="1.2"
              noOfLines={2}
              flex="1"
              pr={2}
            >
              {workflow.title}
            </Text>
          </HStack>

          {/* Meta Information */}
          <HStack spacing={3} flexWrap="wrap">
            {workflow.difficulty_level && (
              <Badge colorScheme={getDifficultyColor(workflow.difficulty_level)} size="sm">
                {workflow.difficulty_level.charAt(0).toUpperCase() + workflow.difficulty_level.slice(1)}
              </Badge>
            )}
            {workflow.trigger_type && (
              <Badge colorScheme="purple" size="sm" variant="outline">
                <Icon as={FaClock} mr={1} boxSize={2} />
                {workflow.trigger_type}
              </Badge>
            )}
            <Badge colorScheme="gray" size="sm" variant="outline">
              <Icon as={FaDownload} mr={1} boxSize={2} />
              {workflow.downloads_count || 0} downloads
            </Badge>
          </HStack>
        </VStack>

        {/* Description */}
        <Text
          fontSize="sm"
          color={textColor}
          lineHeight="1.4"
          noOfLines={3}
          flex="1"
        >
          {workflow.description || 'No description available.'}
        </Text>

        {/* Tools Used */}
        {workflow.tools_used && workflow.tools_used.length > 0 && (
          <Box>
            <HStack spacing={1} mb={2}>
              <Icon as={FaTools} boxSize={3} color="gray.500" />
              <Text fontSize="xs" color="gray.500" fontWeight="semibold">
                TOOLS USED
              </Text>
            </HStack>
            <Wrap spacing={1}>
              {workflow.tools_used.slice(0, 6).map((tool, index) => (
                <WrapItem key={index}>
                  <Badge 
                    size="sm" 
                    bg={badgeBg}
                    color="gray.600"
                    _dark={{ bg: 'gray.600', color: 'gray.200' }}
                    fontSize="xs"
                  >
                    {tool}
                  </Badge>
                </WrapItem>
              ))}
              {workflow.tools_used.length > 6 && (
                <WrapItem>
                  <Badge size="sm" variant="outline" colorScheme="gray" fontSize="xs">
                    +{workflow.tools_used.length - 6} more
                  </Badge>
                </WrapItem>
              )}
            </Wrap>
          </Box>
        )}

        <Spacer />

        {/* Action Buttons */}
        <VStack spacing={3}>
          <Flex gap={2} w="full">
            <Button
              size="sm"
              colorScheme="green"
              variant="solid"
              onClick={handleImportToN8n}
              flex="1"
              leftIcon={<FaRobot />}
            >
              Import to N8N
            </Button>
            <Tooltip label="View Details" hasArrow>
              <Button
                as={RouterLink}
                to={`/n8n-workflows/${workflow.slug}`}
                size="sm"
                variant="outline"
                colorScheme="green"
              >
                <ViewIcon />
              </Button>
            </Tooltip>
          </Flex>
          
          <HStack spacing={2} w="full">
            <Tooltip label="Copy JSON to Clipboard" hasArrow>
              <Button
                size="xs"
                variant="ghost"
                onClick={handleCopyJson}
                flex="1"
                leftIcon={<CopyIcon />}
              >
                Copy JSON
              </Button>
            </Tooltip>
            <Tooltip label="Download JSON File" hasArrow>
              <Button
                size="xs"
                variant="ghost"
                onClick={handleDownloadJson}
                flex="1"
                leftIcon={<DownloadIcon />}
              >
                Download
              </Button>
            </Tooltip>
            {workflow.source_url && (
              <Tooltip label="View Source" hasArrow>
                <Button
                  as={ChakraLink}
                  href={workflow.source_url}
                  isExternal
                  size="xs"
                  variant="ghost"
                  leftIcon={<ExternalLinkIcon />}
                >
                  Source
                </Button>
              </Tooltip>
            )}
          </HStack>
        </VStack>
      </VStack>
    </Box>
  );
};

export default WorkflowCard;