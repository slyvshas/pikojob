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
      borderRadius="2xl"
      border="1px"
      borderColor={isHovered ? borderHoverColor : borderColor}
      overflow="hidden"
      position="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      _hover={{
        transform: 'translateY(-8px) scale(1.02)',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(72, 187, 120, 0.3)',
      }}
      transition="all 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
      h="full"
      display="flex"
      flexDirection="column"
    >
      {/* Premium Gradient Top Bar */}
      <Box
        h="4px"
        bgGradient={accentGradient}
        animation={isHovered ? `${shimmer} 2s infinite linear` : 'none'}
        backgroundSize="200% 100%"
      />

      {/* Card Header with Category & Actions */}
      <Flex 
        px={5} 
        pt={4} 
        pb={2} 
        justify="space-between" 
        align="center"
        bg={isHovered ? useColorModeValue('green.50', 'gray.750') : 'transparent'}
        transition="all 0.3s ease"
      >
        {/* Category Badge */}
        {workflow.categories && (
          <Badge
            bgGradient="linear(to-r, green.400, teal.400)"
            color="white"
            px={3}
            py={1}
            borderRadius="full"
            fontSize="xs"
            fontWeight="bold"
            textTransform="uppercase"
            letterSpacing="wide"
            boxShadow="sm"
          >
            {workflow.categories.name}
          </Badge>
        )}
        
        {/* Quick Actions */}
        <HStack spacing={1}>
          <Tooltip label={isLiked ? 'Saved!' : 'Save for later'} hasArrow>
            <IconButton
              icon={isLiked ? <FaHeart /> : <FaRegHeart />}
              size="sm"
              variant="ghost"
              color={isLiked ? 'red.400' : 'gray.400'}
              onClick={() => setIsLiked(!isLiked)}
              _hover={{ color: 'red.400', transform: 'scale(1.2)' }}
              transition="all 0.2s"
              aria-label="Save workflow"
            />
          </Tooltip>
          <Tooltip label="Downloads" hasArrow>
            <HStack 
              spacing={1} 
              px={2} 
              py={1} 
              bg={badgeBg} 
              borderRadius="full"
              fontSize="xs"
              color="gray.500"
            >
              <Icon as={FaDownload} boxSize={3} />
              <Text fontWeight="semibold">{workflow.downloads_count || 0}</Text>
            </HStack>
          </Tooltip>
        </HStack>
      </Flex>

      <VStack align="stretch" spacing={4} p={5} pt={2} flex="1">
        {/* Title */}
        <Text
          fontSize="xl"
          fontWeight="bold"
          color={titleColor}
          lineHeight="1.3"
          noOfLines={2}
          _hover={{ color: 'green.500' }}
          transition="color 0.2s"
        >
          {workflow.title}
        </Text>

        {/* Difficulty & Trigger Type Row */}
        <HStack spacing={3} flexWrap="wrap">
          {workflow.difficulty_level && (
            <HStack 
              spacing={2} 
              bg={useColorModeValue(`${difficultyConfig.color}.50`, `${difficultyConfig.color}.900`)}
              px={3}
              py={1.5}
              borderRadius="lg"
              border="1px"
              borderColor={useColorModeValue(`${difficultyConfig.color}.200`, `${difficultyConfig.color}.700`)}
            >
              <Icon 
                as={difficultyConfig.icon} 
                color={`${difficultyConfig.color}.500`}
                boxSize={3}
              />
              <Text 
                fontSize="xs" 
                fontWeight="semibold" 
                color={`${difficultyConfig.color}.600`}
                _dark={{ color: `${difficultyConfig.color}.300` }}
              >
                {difficultyConfig.label}
              </Text>
            </HStack>
          )}
          {workflow.trigger_type && (
            <HStack 
              spacing={2}
              bg={useColorModeValue('purple.50', 'purple.900')}
              px={3}
              py={1.5}
              borderRadius="lg"
              border="1px"
              borderColor={useColorModeValue('purple.200', 'purple.700')}
            >
              <Icon as={FaClock} color="purple.500" boxSize={3} />
              <Text fontSize="xs" fontWeight="semibold" color="purple.600" _dark={{ color: 'purple.300' }}>
                {workflow.trigger_type}
              </Text>
            </HStack>
          )}
        </HStack>

        {/* Description */}
        <Text
          fontSize="sm"
          color={textColor}
          lineHeight="1.6"
          noOfLines={3}
          flex="1"
        >
          {workflow.description || 'Automate your workflow with this powerful n8n template. One-click import to get started instantly.'}
        </Text>

        {/* Tools Used - Enhanced with Icons */}
        {workflow.tools_used && workflow.tools_used.length > 0 && (
          <Box>
            <HStack spacing={2} mb={3}>
              <Icon as={FaMagic} boxSize={3} color="green.500" />
              <Text fontSize="xs" color="gray.500" fontWeight="bold" textTransform="uppercase" letterSpacing="wider">
                Integrations
              </Text>
            </HStack>
            <Wrap spacing={2}>
              {workflow.tools_used.slice(0, 5).map((tool, index) => (
                <WrapItem key={index}>
                  <HStack
                    spacing={1}
                    bg={useColorModeValue('gray.100', 'gray.700')}
                    px={3}
                    py={1.5}
                    borderRadius="full"
                    _hover={{ 
                      bg: useColorModeValue('gray.200', 'gray.600'),
                      transform: 'scale(1.05)'
                    }}
                    transition="all 0.2s"
                    cursor="default"
                  >
                    <Text fontSize="sm">{getToolIcon(tool)}</Text>
                    <Text 
                      fontSize="xs" 
                      fontWeight="medium"
                      color={useColorModeValue('gray.700', 'gray.200')}
                    >
                      {tool}
                    </Text>
                  </HStack>
                </WrapItem>
              ))}
              {workflow.tools_used.length > 5 && (
                <WrapItem>
                  <HStack
                    spacing={1}
                    bg="green.100"
                    _dark={{ bg: 'green.800' }}
                    px={3}
                    py={1.5}
                    borderRadius="full"
                  >
                    <Text fontSize="xs" fontWeight="bold" color="green.600" _dark={{ color: 'green.200' }}>
                      +{workflow.tools_used.length - 5} more
                    </Text>
                  </HStack>
                </WrapItem>
              )}
            </Wrap>
          </Box>
        )}

        <Spacer />

        {/* Divider */}
        <Divider borderColor={borderColor} />

        {/* Action Buttons - Premium Style */}
        <VStack spacing={3}>
          {/* Primary Import Button */}
          <Button
            size="lg"
            w="full"
            bgGradient={accentGradient}
            color="white"
            onClick={handleImportToN8n}
            isLoading={isLoading}
            loadingText="Preparing..."
            leftIcon={<FaRobot />}
            rightIcon={<ArrowForwardIcon />}
            fontWeight="bold"
            _hover={{
              bgGradient: 'linear(to-r, green.500, teal.500, blue.600)',
              transform: 'translateY(-2px)',
              boxShadow: 'lg',
            }}
            _active={{
              transform: 'translateY(0)',
            }}
            animation={isHovered ? `${pulse} 2s infinite` : 'none'}
            transition="all 0.3s"
            borderRadius="xl"
          >
            Import to N8N
          </Button>

          {/* Secondary Actions Row */}
          <Flex gap={2} w="full">
            <Button
              flex="1"
              size="sm"
              variant="outline"
              colorScheme="green"
              onClick={handleCopyJson}
              leftIcon={isCopied ? <CheckIcon /> : <CopyIcon />}
              borderRadius="lg"
              _hover={{ bg: 'green.50', _dark: { bg: 'green.900' } }}
            >
              {isCopied ? 'Copied!' : 'Copy JSON'}
            </Button>
            <Button
              flex="1"
              size="sm"
              variant="outline"
              colorScheme="gray"
              onClick={handleDownloadJson}
              leftIcon={<DownloadIcon />}
              borderRadius="lg"
              _hover={{ bg: 'gray.100', _dark: { bg: 'gray.700' } }}
            >
              Download
            </Button>
          </Flex>

          {/* View Details Link */}
          <Button
            as={RouterLink}
            to={`/n8n-workflows/${workflow.slug}`}
            size="sm"
            variant="ghost"
            colorScheme="gray"
            w="full"
            rightIcon={<ViewIcon />}
            _hover={{ 
              bg: useColorModeValue('gray.100', 'gray.700'),
              color: 'green.500'
            }}
            borderRadius="lg"
          >
            View Full Details
          </Button>
        </VStack>
      </VStack>

      {/* Hover Glow Effect */}
      {isHovered && (
        <Box
          position="absolute"
          inset={0}
          borderRadius="2xl"
          pointerEvents="none"
          animation={`${glow} 2s infinite`}
        />
      )}
    </Box>
  );
};

export default WorkflowCard;