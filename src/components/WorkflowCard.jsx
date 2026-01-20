import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Button,
  Icon,
  Tooltip,
  useColorModeValue,
  useToast,
  Link as ChakraLink,
  Wrap,
  WrapItem,
  Flex,
  Spacer,
  IconButton,
  Progress,
  Avatar,
  AvatarGroup,
  Divider,
  ScaleFade,
  keyframes,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { 
  ExternalLinkIcon, 
  DownloadIcon, 
  CopyIcon, 
  ViewIcon,
  StarIcon,
  CheckIcon,
  ArrowForwardIcon,
} from '@chakra-ui/icons';
import { 
  FaRobot, 
  FaClock, 
  FaDownload, 
  FaTools, 
  FaBolt, 
  FaFire,
  FaGem,
  FaLayerGroup,
  FaPlay,
  FaCode,
  FaMagic,
  FaHeart,
  FaRegHeart,
  FaStar,
} from 'react-icons/fa';
import { supabase } from '../lib/supabase';

// Shimmer animation for premium look
const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

// Pulse animation for the import button
const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.02); }
`;

// Glow animation
const glow = keyframes`
  0%, 100% { box-shadow: 0 0 5px rgba(72, 187, 120, 0.3); }
  50% { box-shadow: 0 0 20px rgba(72, 187, 120, 0.6); }
`;

// Tool icon mapping
const getToolIcon = (tool) => {
  const toolLower = tool?.toLowerCase() || '';
  if (toolLower.includes('openai') || toolLower.includes('gpt') || toolLower.includes('ai')) return '🤖';
  if (toolLower.includes('slack')) return '💬';
  if (toolLower.includes('google') || toolLower.includes('gmail')) return '📧';
  if (toolLower.includes('notion')) return '📝';
  if (toolLower.includes('discord')) return '🎮';
  if (toolLower.includes('telegram')) return '✈️';
  if (toolLower.includes('whatsapp')) return '📱';
  if (toolLower.includes('twitter') || toolLower.includes('x')) return '🐦';
  if (toolLower.includes('database') || toolLower.includes('sql') || toolLower.includes('postgres')) return '🗄️';
  if (toolLower.includes('sheet') || toolLower.includes('excel')) return '📊';
  if (toolLower.includes('webhook')) return '🔗';
  if (toolLower.includes('http') || toolLower.includes('api')) return '🌐';
  if (toolLower.includes('pdf')) return '📄';
  if (toolLower.includes('drive')) return '☁️';
  if (toolLower.includes('airtable')) return '📋';
  if (toolLower.includes('wordpress')) return '📰';
  return '⚡';
};

const WorkflowCard = ({ workflow }) => {
  const toast = useToast();
  const [isHovered, setIsHovered] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Enhanced color scheme
  const cardBg = useColorModeValue('white', 'gray.800');
  const cardBgHover = useColorModeValue('gray.50', 'gray.750');
  const borderColor = useColorModeValue('gray.100', 'gray.700');
  const borderHoverColor = useColorModeValue('green.300', 'green.400');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const titleColor = useColorModeValue('gray.800', 'white');
  const badgeBg = useColorModeValue('gray.100', 'gray.700');
  const accentGradient = 'linear(to-r, green.400, teal.400, blue.500)';
  const glassEffect = useColorModeValue(
    'rgba(255, 255, 255, 0.8)',
    'rgba(26, 32, 44, 0.8)'
  );

  const getDifficultyConfig = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner': 
        return { 
          color: 'green', 
          icon: FaPlay, 
          label: 'Beginner Friendly',
          gradient: 'linear(to-r, green.400, green.300)',
          progress: 33
        };
      case 'intermediate': 
        return { 
          color: 'yellow', 
          icon: FaLayerGroup, 
          label: 'Intermediate',
          gradient: 'linear(to-r, yellow.400, orange.300)',
          progress: 66
        };
      case 'advanced': 
        return { 
          color: 'red', 
          icon: FaFire, 
          label: 'Advanced',
          gradient: 'linear(to-r, red.400, pink.400)',
          progress: 100
        };
      default: 
        return { 
          color: 'gray', 
          icon: FaBolt, 
          label: 'All Levels',
          gradient: 'linear(to-r, gray.400, gray.300)',
          progress: 50
        };
    }
  };

  const difficultyConfig = getDifficultyConfig(workflow.difficulty_level);

  const handleCopyJson = async () => {
    setIsLoading(true);
    try {
      if (!workflow.json_storage_path) {
        // Fallback to source URL if no JSON storage path
        if (workflow.source_url) {
          const response = await fetch(workflow.source_url);
          if (response.ok) {
            const jsonContent = await response.text();
            await navigator.clipboard.writeText(jsonContent);
            
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
            
            toast({
              title: '✨ Copied to clipboard!',
              description: 'Workflow JSON is ready to paste into n8n.',
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
          
          setIsCopied(true);
          setTimeout(() => setIsCopied(false), 2000);
          
          toast({
            title: '✨ Copied to clipboard!',
            description: 'Workflow JSON is ready to paste into n8n.',
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
              
              setIsCopied(true);
              setTimeout(() => setIsCopied(false), 2000);
              
              toast({
                title: '✨ Copied to clipboard!',
                description: 'Workflow JSON is ready to paste into n8n.',
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
    } finally {
      setIsLoading(false);
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
      borderColor={isHovered ? borderHoverColor : borderColor}
      overflow="hidden"
      position="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      _hover={{
        transform: 'translateY(-4px)',
        boxShadow: '0 12px 24px rgba(0, 0, 0, 0.1)',
      }}
      transition="all 0.3s ease"
      h="full"
      display="flex"
      flexDirection="column"
    >
      {/* Slim Gradient Top Bar */}
      <Box
        h="3px"
        bgGradient={accentGradient}
        animation={isHovered ? `${shimmer} 2s infinite linear` : 'none'}
        backgroundSize="200% 100%"
      />

      {/* Compact Header */}
      <Flex 
        px={4} 
        pt={3} 
        pb={1} 
        justify="space-between" 
        align="center"
      >
        {/* Category Badge */}
        {workflow.categories && (
          <Badge
            bgGradient="linear(to-r, green.400, teal.400)"
            color="white"
            px={2}
            py={0.5}
            borderRadius="full"
            fontSize="2xs"
            fontWeight="bold"
            textTransform="uppercase"
          >
            {workflow.categories.name}
          </Badge>
        )}
        
        {/* Quick Actions */}
        <HStack spacing={1}>
          <IconButton
            icon={isLiked ? <FaHeart /> : <FaRegHeart />}
            size="xs"
            variant="ghost"
            color={isLiked ? 'red.400' : 'gray.400'}
            onClick={() => setIsLiked(!isLiked)}
            _hover={{ color: 'red.400' }}
            aria-label="Save"
          />
          <HStack spacing={1} fontSize="2xs" color="gray.500">
            <Icon as={FaDownload} boxSize={2.5} />
            <Text fontWeight="semibold">{workflow.downloads_count || 0}</Text>
          </HStack>
        </HStack>
      </Flex>

      <VStack align="stretch" spacing={2} px={4} pb={4} flex="1">
        {/* Title */}
        <Text
          fontSize="md"
          fontWeight="bold"
          color={titleColor}
          lineHeight="1.2"
          noOfLines={2}
          _hover={{ color: 'green.500' }}
          transition="color 0.2s"
        >
          {workflow.title}
        </Text>

        {/* Compact Meta Row */}
        <HStack spacing={2} flexWrap="wrap">
          {workflow.difficulty_level && (
            <HStack spacing={1} px={2} py={0.5} bg={`${difficultyConfig.color}.50`} _dark={{ bg: `${difficultyConfig.color}.900` }} borderRadius="md">
              <Icon as={difficultyConfig.icon} color={`${difficultyConfig.color}.500`} boxSize={2.5} />
              <Text fontSize="2xs" fontWeight="semibold" color={`${difficultyConfig.color}.600`} _dark={{ color: `${difficultyConfig.color}.300` }}>
                {workflow.difficulty_level}
              </Text>
            </HStack>
          )}
          {workflow.trigger_type && (
            <HStack spacing={1} px={2} py={0.5} bg="purple.50" _dark={{ bg: 'purple.900' }} borderRadius="md">
              <Icon as={FaClock} color="purple.500" boxSize={2.5} />
              <Text fontSize="2xs" fontWeight="semibold" color="purple.600" _dark={{ color: 'purple.300' }}>
                {workflow.trigger_type}
              </Text>
            </HStack>
          )}
        </HStack>

        {/* Description - Compact */}
        <Text
          fontSize="xs"
          color={textColor}
          lineHeight="1.5"
          noOfLines={2}
        >
          {workflow.description || 'One-click import to automate your workflow.'}
        </Text>

        {/* Tools - Compact inline */}
        {workflow.tools_used && workflow.tools_used.length > 0 && (
          <Wrap spacing={1}>
            {workflow.tools_used.slice(0, 4).map((tool, index) => (
              <WrapItem key={index}>
                <HStack
                  spacing={0.5}
                  bg={badgeBg}
                  px={2}
                  py={0.5}
                  borderRadius="full"
                >
                  <Text fontSize="xs">{getToolIcon(tool)}</Text>
                  <Text fontSize="2xs" fontWeight="medium" color={textColor}>
                    {tool}
                  </Text>
                </HStack>
              </WrapItem>
            ))}
            {workflow.tools_used.length > 4 && (
              <WrapItem>
                <Text fontSize="2xs" color="green.500" fontWeight="bold" px={1}>
                  +{workflow.tools_used.length - 4}
                </Text>
              </WrapItem>
            )}
          </Wrap>
        )}

        <Spacer />

        {/* Compact Action Buttons */}
        <VStack spacing={2} pt={2}>
          {/* Primary Import Button */}
          <Button
            size="sm"
            w="full"
            bgGradient={accentGradient}
            color="white"
            onClick={handleImportToN8n}
            isLoading={isLoading}
            leftIcon={<FaRobot size={12} />}
            fontWeight="bold"
            _hover={{
              bgGradient: 'linear(to-r, green.500, teal.500, blue.600)',
              transform: 'translateY(-1px)',
            }}
            borderRadius="lg"
            h={8}
          >
            Import to N8N
          </Button>

          {/* Secondary Actions - Inline */}
          <HStack spacing={2} w="full">
            <Button
              flex="1"
              size="xs"
              variant="outline"
              colorScheme="green"
              onClick={handleCopyJson}
              leftIcon={isCopied ? <CheckIcon boxSize={2.5} /> : <CopyIcon boxSize={2.5} />}
              borderRadius="md"
              h={7}
            >
              {isCopied ? 'Copied!' : 'Copy'}
            </Button>
            <Button
              flex="1"
              size="xs"
              variant="outline"
              colorScheme="gray"
              onClick={handleDownloadJson}
              leftIcon={<DownloadIcon boxSize={2.5} />}
              borderRadius="md"
              h={7}
            >
              Download
            </Button>
            <IconButton
              as={RouterLink}
              to={`/n8n-workflows/${workflow.slug}`}
              size="xs"
              variant="outline"
              colorScheme="gray"
              icon={<ViewIcon boxSize={3} />}
              borderRadius="md"
              h={7}
              aria-label="View details"
            />
          </HStack>
        </VStack>
      </VStack>
    </Box>
  );
};

export default WorkflowCard;