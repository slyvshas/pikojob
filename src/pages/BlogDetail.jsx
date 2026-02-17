import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import {
  Box,
  Heading,
  Text,
  Image,
  VStack,
  HStack,
  Badge,
  Spinner,
  Container,
  useColorModeValue,
  Center,
  Button,
  Flex,
  IconButton,
  useToast,
  Avatar,
  Link,
  SimpleGrid,
  Card,
  CardBody,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from '@chakra-ui/react';
import { FaArrowLeft, FaClock, FaShare, FaTwitter, FaFacebookF, FaLinkedinIn, FaWhatsapp, FaLink, FaEnvelope, FaTextHeight, FaList } from 'react-icons/fa';
import { normalizeContent, calculateReadingTime } from '../utils/blogContentNormalizer';
import { setBlogMetaTags, resetMetaTags, getSocialShareUrls, openShareWindow } from '../utils/socialMeta';
import { generateArticleSchema, generateBreadcrumbSchema, injectMultipleSchemas, removeStructuredData } from '../utils/structuredData';
import { generateCoverForBlog } from '../utils/generateBlogCover';
import { ChevronDownIcon } from '@chakra-ui/icons';
import DisplayAd, { InArticleAd } from '../components/DisplayAd';

const BlogDetail = () => {
  const { slug, category } = useParams(); // Now extracting both slug and category
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [readingProgress, setReadingProgress] = useState(0);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [generatedCover, setGeneratedCover] = useState(null);
  const [fontSize, setFontSize] = useState('md'); // sm, md, lg, xl
  const [relatedBlogs, setRelatedBlogs] = useState([]);
  const [showToc, setShowToc] = useState(false);
  const [headings, setHeadings] = useState([]);
  const toast = useToast();

  // High contrast color palette for better readability
  const bgColor = useColorModeValue('#FFFFFF', '#0A0A0A');
  const textColor = useColorModeValue('#111111', '#EFEFEF');
  const mutedColor = useColorModeValue('#555555', '#AAAAAA');
  const borderColor = useColorModeValue('#E0E0E0', '#333333');
  const accentColor = useColorModeValue('#1D4ED8', '#60A5FA');
  const codeBg = useColorModeValue('#F5F5F5', '#1A1A1A');
  const blockquoteBg = useColorModeValue('#F8F9FA', '#141414');
  const blockquoteBorder = useColorModeValue('#1D4ED8', '#60A5FA');
  const progressBg = useColorModeValue('#E5E5E5', '#333333');
  const shareMenuBg = useColorModeValue('white', 'gray.800');
  const imagePlaceholderBg = useColorModeValue('gray.100', 'gray.800');

  // Reading progress tracking
  const handleScroll = useCallback(() => {
    const article = document.getElementById('blog-content');
    if (!article) return;

    const articleRect = article.getBoundingClientRect();
    const articleTop = articleRect.top + window.scrollY;
    const articleHeight = articleRect.height;
    const windowHeight = window.innerHeight;
    const scrollTop = window.scrollY;

    // Calculate how much of the article has been scrolled
    const start = articleTop - windowHeight;
    const end = articleTop + articleHeight;
    const current = scrollTop;

    if (current <= start) {
      setReadingProgress(0);
    } else if (current >= end) {
      setReadingProgress(100);
    } else {
      const progress = ((current - start) / (end - start)) * 100;
      setReadingProgress(Math.min(100, Math.max(0, progress)));
    }
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    const fetchBlog = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('blog_posts')
        .select('id, slug, title, content, excerpt, cover_image_url, category, author_name, published_at, created_at, tags')
        .eq('slug', slug)
        .single();
      if (error) setError(error.message);
      else {
        setBlog(data);
        setLoading(false);
        
        // Defer related blogs fetch - load after main content for better performance
        setTimeout(async () => {
          if (data.category) {
            const { data: related } = await supabase
              .from('blog_posts')
              .select('id, slug, title, excerpt, cover_image_url, category, created_at')
              .eq('category', data.category)
              .neq('slug', slug)
              .limit(3);
            if (related) setRelatedBlogs(related);
          }
        }, 100);
      }
    };
    fetchBlog();
  }, [slug]);

  // Set OpenGraph meta tags and structured data when blog loads
  useEffect(() => {
    if (blog) {
      // Ensure image URL is absolute for social sharing
      let imageUrl = blog.cover_image_url;
      if (imageUrl && !imageUrl.startsWith('http')) {
        imageUrl = `https://growlytic.app${imageUrl}`;
      }
      // Fallback to dynamic OG image if no cover
      if (!imageUrl) {
        imageUrl = 'https://growlytic.app/og-image.png';
      }

      // Set social meta tags
      setBlogMetaTags({
        title: blog.title,
        description: blog.excerpt || blog.title,
        image: imageUrl,
        url: window.location.href,
        author: blog.author_name || 'Growlytic Team',
        publishedDate: blog.published_at,
        category: blog.category || 'Article',
      });

      // Generate and inject structured data for SEO
      const articleSchema = generateArticleSchema({
        title: blog.title,
        description: blog.excerpt || blog.title,
        image: blog.cover_image_url || 'https://growlytic.app/og-image.png',
        url: window.location.href,
        author: blog.author_name,
        publishedDate: blog.published_at,
        modifiedDate: blog.updated_at || blog.published_at,
        category: blog.category,
        tags: blog.tags
      });

      const breadcrumbSchema = generateBreadcrumbSchema([
        { name: 'Home', url: 'https://growlytic.app' },
        { name: 'Blogs', url: 'https://growlytic.app/blogs' },
        { name: blog.category || 'Uncategorized', url: `https://growlytic.app/blogs/${blog.category?.toLowerCase().replace(/\s+/g, '-') || 'uncategorized'}` },
        { name: blog.title, url: window.location.href }
      ]);

      // Inject both schemas
      injectMultipleSchemas([articleSchema, breadcrumbSchema]);
    }

    // Reset meta tags and remove structured data when leaving the page
    return () => {
      resetMetaTags();
      removeStructuredData();
    };
  }, [blog]);

  // Normalize content (compute early so it's available for TOC extraction)
  const normalizedContent = useMemo(() => {
    if (!blog || !blog.content) return '';
    return normalizeContent(blog.content);
  }, [blog]);

  // Insert related blog card in the middle of content
  const contentWithRelatedBlog = useMemo(() => {
    if (!normalizedContent || relatedBlogs.length === 0) return normalizedContent;

    // Get the first related blog
    const relatedBlog = relatedBlogs[0];
    
    // Create related blog card HTML
    const relatedBlogCard = `
      <div style="margin: 48px 0; padding: 24px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 16px; box-shadow: 0 10px 40px rgba(102, 126, 234, 0.3);">
        <p style="margin: 0 0 12px 0; font-size: 14px; font-weight: 600; color: rgba(255,255,255,0.9); text-transform: uppercase; letter-spacing: 1px;">✨ You Might Also Like</p>
        <a href="/blogs/${relatedBlog.category?.toLowerCase().replace(/\s+/g, '-') || 'uncategorized'}/${relatedBlog.slug}" style="display: block; text-decoration: none; color: white;">
          <h3 style="margin: 0 0 12px 0; font-size: 24px; font-weight: 700; color: white; line-height: 1.3;">${relatedBlog.title}</h3>
          ${relatedBlog.excerpt ? `<p style="margin: 0 0 16px 0; font-size: 16px; color: rgba(255,255,255,0.9); line-height: 1.6;">${relatedBlog.excerpt}</p>` : ''}
          <div style="display: inline-flex; align-items: center; gap: 8px; padding: 12px 24px; background: white; color: #667eea; border-radius: 8px; font-weight: 600; font-size: 16px; transition: transform 0.2s;">
            Read Article →
          </div>
        </a>
      </div>
    `;

    // Find the middle of the content (split by paragraphs)
    const paragraphs = normalizedContent.split('</p>');
    const middleIndex = Math.floor(paragraphs.length / 2);
    
    // Insert the related blog card in the middle
    paragraphs.splice(middleIndex, 0, relatedBlogCard);
    
    return paragraphs.join('</p>');
  }, [normalizedContent, relatedBlogs]);

  // Generate cover image if blog has no cover (defer to not block initial render)
  useEffect(() => {
    if (blog && !blog.cover_image_url) {
      // Use requestIdleCallback for non-blocking generation
      const idleCallback = window.requestIdleCallback || ((cb) => setTimeout(cb, 1));
      idleCallback(() => {
        generateCoverForBlog(blog.title, blog.category)
          .then(dataUrl => {
            if (dataUrl) {
              setGeneratedCover(dataUrl);
            }
          })
          .catch(err => {
            console.error('Error generating cover:', err);
          });
      });
    }
  }, [blog]);

  // Extract headings for TOC
  useEffect(() => {
    if (blog && contentWithRelatedBlog) {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = contentWithRelatedBlog;
      const headingElements = tempDiv.querySelectorAll('h2, h3');
      const extractedHeadings = Array.from(headingElements).map((heading, index) => {
        const id = heading.id || `heading-${index}`;
        heading.id = id;
        return {
          id,
          text: heading.textContent,
          level: heading.tagName.toLowerCase()
        };
      });
      setHeadings(extractedHeadings);
    }
  }, [blog, contentWithRelatedBlog]);

  const handleShare = async (platform) => {
    const shareUrls = getSocialShareUrls(
      window.location.href,
      blog.title,
      blog.excerpt
    );

    switch (platform) {
      case 'native':
        if (navigator.share) {
          try {
            await navigator.share({
              title: blog.title,
              text: blog.excerpt,
              url: window.location.href,
            });
          } catch (err) {
            // User cancelled or error
          }
        }
        break;
      case 'copy':
        navigator.clipboard.writeText(window.location.href);
        toast({
          title: 'Link copied!',
          status: 'success',
          duration: 2000,
        });
        setShowShareMenu(false);
        break;
      case 'email':
        window.location.href = shareUrls.email;
        setShowShareMenu(false);
        break;
      case 'twitter':
      case 'facebook':
      case 'linkedin':
      case 'whatsapp':
        openShareWindow(shareUrls[platform], platform);
        setShowShareMenu(false);
        break;
      default:
        break;
    }
  };

  const toggleShareMenu = () => {
    setShowShareMenu(!showShareMenu);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getReadingTime = () => {
    if (!blog?.content) return 1;
    return calculateReadingTime(blog.content);
  };

  if (loading) {
    return (
      <Box bg={bgColor} minH="100vh" py={20}>
        <Container maxW="760px">
          <Center py={20}>
            <VStack spacing={6}>
              <Spinner size="xl" thickness="3px" color={accentColor} speed="0.8s" />
              <Text fontSize="md" color={mutedColor}>
                Loading article...
              </Text>
            </VStack>
          </Center>
        </Container>
      </Box>
    );
  }

  if (error || !blog) {
    return (
      <Box bg={bgColor} minH="100vh" py={20}>
        <Container maxW="760px">
          <Center py={20}>
            <VStack spacing={6}>
              <Text color="red.500" fontSize="lg">{error || 'Article not found'}</Text>
              <Button onClick={() => navigate('/blogs')} colorScheme="blue" variant="outline">
                Back to Articles
              </Button>
            </VStack>
          </Center>
        </Container>
      </Box>
    );
  }

  return (
    <Box bg={bgColor} minH="100vh">
      {/* Reading Progress Bar */}
      <Box
        position="fixed"
        top={0}
        left={0}
        right={0}
        height="3px"
        bg={progressBg}
        zIndex={1000}
      >
        <Box
          height="100%"
          bg={accentColor}
          width={`${readingProgress}%`}
          transition="width 0.1s ease-out"
        />
      </Box>

      {/* Sticky Header */}
      <Box
        position="sticky"
        top="3px"
        bg={bgColor}
        borderBottom="1px solid"
        borderColor={readingProgress > 5 ? borderColor : 'transparent'}
        transition="border-color 0.2s"
        zIndex={999}
        py={{ base: 2, md: 3 }}
        px={{ base: 2, md: 0 }}
      >
        <Container maxW="1100px" px={{ base: 2, md: 4 }}>
          <Flex justify="space-between" align="center">
            <Button
              leftIcon={<FaArrowLeft size={12} />}
              variant="ghost"
              size={{ base: 'sm', md: 'sm' }}
              onClick={() => navigate('/blogs')}
              color={mutedColor}
              fontWeight="500"
              px={{ base: 2, md: 3 }}
              minH="44px"
              _hover={{ color: textColor, bg: 'transparent' }}
              _active={{ bg: borderColor }}
            >
              <Text display={{ base: 'none', sm: 'inline' }}>All Articles</Text>
              <Text display={{ base: 'inline', sm: 'none' }}>Back</Text>
            </Button>
            
            <HStack spacing={{ base: 1, md: 2 }}>
              {/* Font Size Menu */}
              <Menu>
                <MenuButton
                  as={IconButton}
                  aria-label="Change font size"
                  icon={<FaTextHeight size={16} />}
                  variant="ghost"
                  size="md"
                  minW="44px"
                  minH="44px"
                  color={mutedColor}
                  _hover={{ color: accentColor }}
                  _active={{ bg: borderColor }}
                />
                <MenuList bg={shareMenuBg} borderColor={borderColor}>
                  <MenuItem
                    onClick={() => setFontSize('sm')}
                    bg={fontSize === 'sm' ? borderColor : 'transparent'}
                    _hover={{ bg: borderColor }}
                    color={textColor}
                  >
                    Small
                  </MenuItem>
                  <MenuItem
                    onClick={() => setFontSize('md')}
                    bg={fontSize === 'md' ? borderColor : 'transparent'}
                    _hover={{ bg: borderColor }}
                    color={textColor}
                  >
                    Medium
                  </MenuItem>
                  <MenuItem
                    onClick={() => setFontSize('lg')}
                    bg={fontSize === 'lg' ? borderColor : 'transparent'}
                    _hover={{ bg: borderColor }}
                    color={textColor}
                  >
                    Large
                  </MenuItem>
                  <MenuItem
                    onClick={() => setFontSize('xl')}
                    bg={fontSize === 'xl' ? borderColor : 'transparent'}
                    _hover={{ bg: borderColor }}
                    color={textColor}
                  >
                    Extra Large
                  </MenuItem>
                </MenuList>
              </Menu>

              {/* TOC Toggle */}
              {headings.length > 0 && (
                <IconButton
                  aria-label="Table of contents"
                  icon={<FaList size={16} />}
                  variant="ghost"
                  size="md"
                  minW="44px"
                  minH="44px"
                  color={showToc ? accentColor : mutedColor}
                  onClick={() => setShowToc(!showToc)}
                  _hover={{ color: accentColor }}
                  _active={{ bg: borderColor }}
                />
              )}

              <IconButton
                aria-label="Share article"
                icon={<FaShare size={16} />}
                variant="ghost"
                size="md"
                minW="44px"
                minH="44px"
                color={mutedColor}
                onClick={toggleShareMenu}
                _hover={{ color: accentColor }}
                _active={{ bg: borderColor }}
              />
            </HStack>
          </Flex>
        </Container>
      </Box>

      {/* Social Share Menu */}
      {showShareMenu && (
        <>
          {/* Backdrop */}
          <Box
            position="fixed"
            top={0}
            left={0}
            right={0}
            bottom={0}
            bg="blackAlpha.400"
            zIndex={1000}
            onClick={() => setShowShareMenu(false)}
          />
          
          {/* Share Menu */}
          <Box
            position="fixed"
            bottom={{ base: 0, md: 'auto' }}
            top={{ base: 'auto', md: '50%' }}
            left={{ base: 0, md: '50%' }}
            right={{ base: 0, md: 'auto' }}
            transform={{ base: 'none', md: 'translate(-50%, -50%)' }}
            bg={shareMenuBg}
            borderRadius={{ base: '24px 24px 0 0', md: '16px' }}
            boxShadow="0 -4px 30px rgba(0,0,0,0.15)"
            zIndex={1001}
            p={{ base: 6, md: 8 }}
            maxW={{ base: '100%', md: '400px' }}
            w="100%"
          >
            <VStack spacing={5} align="stretch">
              <Flex justify="space-between" align="center">
                <Heading size="md" color={textColor}>Share this article</Heading>
                <IconButton
                  aria-label="Close share menu"
                  icon={<Text fontSize="xl">×</Text>}
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowShareMenu(false)}
                  color={mutedColor}
                />
              </Flex>
              
              {/* Social Share Buttons */}
              <Flex wrap="wrap" gap={3} justify="center">
                <IconButton
                  aria-label="Share on Twitter"
                  icon={<FaTwitter size={20} />}
                  onClick={() => handleShare('twitter')}
                  colorScheme="twitter"
                  variant="solid"
                  size="lg"
                  borderRadius="full"
                  minW="56px"
                  minH="56px"
                />
                <IconButton
                  aria-label="Share on Facebook"
                  icon={<FaFacebookF size={20} />}
                  onClick={() => handleShare('facebook')}
                  colorScheme="facebook"
                  variant="solid"
                  size="lg"
                  borderRadius="full"
                  minW="56px"
                  minH="56px"
                />
                <IconButton
                  aria-label="Share on LinkedIn"
                  icon={<FaLinkedinIn size={20} />}
                  onClick={() => handleShare('linkedin')}
                  colorScheme="linkedin"
                  variant="solid"
                  size="lg"
                  borderRadius="full"
                  minW="56px"
                  minH="56px"
                />
                <IconButton
                  aria-label="Share on WhatsApp"
                  icon={<FaWhatsapp size={22} />}
                  onClick={() => handleShare('whatsapp')}
                  bg="#25D366"
                  color="white"
                  _hover={{ bg: '#22c55e' }}
                  variant="solid"
                  size="lg"
                  borderRadius="full"
                  minW="56px"
                  minH="56px"
                />
                <IconButton
                  aria-label="Share via Email"
                  icon={<FaEnvelope size={20} />}
                  onClick={() => handleShare('email')}
                  colorScheme="gray"
                  variant="solid"
                  size="lg"
                  borderRadius="full"
                  minW="56px"
                  minH="56px"
                />
              </Flex>
              
              {/* Copy Link Button */}
              <Button
                leftIcon={<FaLink />}
                onClick={() => handleShare('copy')}
                variant="outline"
                colorScheme="gray"
                size="lg"
                borderRadius="full"
                w="100%"
              >
                Copy Link
              </Button>
              
              {/* Native Share (Mobile) */}
              {navigator.share && (
                <Button
                  leftIcon={<FaShare />}
                  onClick={() => handleShare('native')}
                  colorScheme="blue"
                  size="lg"
                  borderRadius="full"
                  w="100%"
                >
                  More Options
                </Button>
              )}
            </VStack>
          </Box>
        </>
      )}

      {/* Article Content */}
      <Container maxW="900px" px={{ base: 4, sm: 5, md: 6 }} py={{ base: 6, md: 12 }}>
        <Flex gap={8} direction={{ base: 'column', lg: 'row' }}>
          {/* Main Content */}
          <Box flex="1" maxW={{ base: '100%', lg: showToc ? '75%' : '100%' }}>
            <VStack spacing={{ base: 6, md: 8 }} align="stretch">
          {/* Article Header */}
          <Box as="header" pt={{ base: 2, md: 4 }}>
            {/* Category Badge */}
            {blog.category && (
              <Badge
                colorScheme="blue"
                variant="subtle"
                fontSize="xs"
                fontWeight="600"
                letterSpacing="0.5px"
                textTransform="uppercase"
                px={3}
                py={1}
                borderRadius="full"
                mb={4}
              >
                {blog.category}
              </Badge>
            )}

            {/* Title */}
            <Heading
              as="h1"
              fontSize={{ base: '1.625rem', sm: '1.875rem', md: '2.5rem', lg: '2.75rem' }}
              fontWeight="800"
              color={textColor}
              lineHeight={{ base: '1.25', md: '1.2' }}
              letterSpacing="-0.02em"
              mb={{ base: 4, md: 5 }}
              fontFamily="'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
            >
              {blog.title}
            </Heading>

            {/* Excerpt */}
            {blog.excerpt && (
              <Text
                fontSize={{ base: 'md', sm: 'lg', md: 'xl' }}
                color={mutedColor}
                lineHeight={{ base: '1.5', md: '1.6' }}
                fontWeight="400"
                mb={{ base: 4, md: 6 }}
              >
                {blog.excerpt}
              </Text>
            )}

            {/* Author & Meta */}
            <Flex
              direction={{ base: 'row', sm: 'row' }}
              justify="space-between"
              align="center"
              gap={{ base: 2, md: 4 }}
              py={{ base: 3, md: 4 }}
              borderTop="1px solid"
              borderBottom="1px solid"
              borderColor={borderColor}
              flexWrap="wrap"
            >
              <HStack spacing={{ base: 2, md: 3 }} flex="1" minW="0">
                <Avatar
                  size={{ base: 'xs', sm: 'sm' }}
                  name={blog.author_name || 'Author'}
                  bg={accentColor}
                  color="white"
                />
                <Box minW="0" flex="1">
                  <Text 
                    fontWeight="600" 
                    fontSize={{ base: 'xs', sm: 'sm' }} 
                    color={textColor}
                    noOfLines={1}
                  >
                    {blog.author_name || 'Anonymous'}
                  </Text>
                  <Text fontSize="xs" color={mutedColor} display={{ base: 'none', sm: 'block' }}>
                    {formatDate(blog.published_at)}
                  </Text>
                </Box>
              </HStack>

              <HStack spacing={{ base: 3, md: 4 }} color={mutedColor} fontSize={{ base: 'xs', sm: 'sm' }} flexShrink={0}>
                <Text display={{ base: 'block', sm: 'none' }}>{formatDate(blog.published_at).split(',')[0]}</Text>
                <HStack spacing={1}>
                  <FaClock size={12} />
                  <Text whiteSpace="nowrap">{getReadingTime()} min</Text>
                </HStack>
              </HStack>
            </Flex>
          </Box>

          {/* Cover Image - Original or Auto-Generated */}
          {(blog.cover_image_url || generatedCover) && (
            <Box
              borderRadius={{ base: 'lg', md: 'xl' }}
              overflow="hidden"
              my={{ base: 1, md: 2 }}
              mx={{ base: -4, sm: 0 }}
              // Fixed aspect ratio container to prevent layout shift
              position="relative"
              paddingBottom={{ base: '52.5%', md: '52.5%' }} // 1200:630 = 52.5%
              bg={imagePlaceholderBg}
            >
              <Image
                src={blog.cover_image_url || generatedCover}
                alt={blog.title}
                position="absolute"
                top={0}
                left={0}
                width="100%"
                height="100%"
                objectFit="cover"
                loading="eager" // Eager load above-the-fold cover image for LCP
                fetchPriority="high" // Prioritize cover image loading
                // Explicit dimensions for CLS prevention
                htmlWidth={1200}
                htmlHeight={630}
              />
            </Box>
          )}

          {/* Skeleton placeholder while generating cover */}
          {!blog.cover_image_url && !generatedCover && (
            <Box
              borderRadius={{ base: 'lg', md: 'xl' }}
              overflow="hidden"
              my={{ base: 1, md: 2 }}
              mx={{ base: -4, sm: 0 }}
              position="relative"
              paddingBottom="52.5%"
              bg={imagePlaceholderBg}
            >
              <Center position="absolute" top={0} left={0} right={0} bottom={0}>
                <Spinner size="lg" color={accentColor} />
              </Center>
            </Box>
          )}

          {/* Tags */}
          {blog.tags && blog.tags.length > 0 && (
            <Flex wrap="wrap" gap={{ base: 1.5, md: 2 }}>
              {blog.tags.map((tag, idx) => (
                <Badge
                  key={idx}
                  variant="outline"
                  colorScheme="gray"
                  fontSize={{ base: '2xs', sm: 'xs' }}
                  fontWeight="500"
                  px={{ base: 2, md: 3 }}
                  py={1}
                  borderRadius="full"
                >
                  {tag}
                </Badge>
              ))}
            </Flex>
          )}

          {/* In-Article Ad - Before content */}
          <InArticleAd />

          {/* Article Body */}
          <Box
            id="blog-content"
            className="blog-article-content"
            color={textColor}
            sx={{
              // Base typography - Poppins for modern, readable article text
              fontFamily: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
              fontSize: fontSize === 'sm' ? { base: '15px', sm: '16px', md: '17px' } : 
                        fontSize === 'md' ? { base: '16px', sm: '17px', md: '18px' } :
                        fontSize === 'lg' ? { base: '17px', sm: '18px', md: '19px' } :
                        { base: '18px', sm: '19px', md: '20px' },
              lineHeight: { base: '1.7', md: '1.75' },
              letterSpacing: '0.01em',
              fontWeight: '400',
              color: textColor,
              // Performance optimization
              contentVisibility: 'auto',
              containIntrinsicSize: 'auto 1000px',

              // Paragraphs
              'p': {
                mb: { base: '1.25em', md: '1.5em' },
                color: textColor,
              },

              // Headings - Keep Inter for contrast
              'h1, h2, h3, h4, h5, h6': {
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                fontWeight: '700',
                color: textColor,
                letterSpacing: '-0.02em',
                lineHeight: { base: '1.25', md: '1.3' },
              },
              'h1': {
                fontSize: { base: '1.5rem', sm: '1.75rem', md: '2.25rem' },
                mt: { base: '2em', md: '2.5em' },
                mb: { base: '0.5em', md: '0.75em' },
              },
              'h2': {
                fontSize: { base: '1.25rem', sm: '1.375rem', md: '1.75rem' },
                mt: { base: '1.75em', md: '2em' },
                mb: { base: '0.5em', md: '0.75em' },
                pb: '0.5em',
                borderBottom: '1px solid',
                borderColor: borderColor,
              },
              'h3': {
                fontSize: { base: '1.125rem', sm: '1.25rem', md: '1.375rem' },
                mt: { base: '1.5em', md: '1.75em' },
                mb: '0.5em',
              },
              'h4': {
                fontSize: { base: '1rem', sm: '1.125rem', md: '1.25rem' },
                mt: { base: '1.25em', md: '1.5em' },
                mb: '0.5em',
              },
              'h5, h6': {
                fontSize: { base: '0.9375rem', md: '1rem' },
                mt: '1.25em',
                mb: '0.5em',
                fontWeight: '600',
              },

              // First paragraph after heading - no extra margin
              'h1 + p, h2 + p, h3 + p, h4 + p': {
                mt: 0,
              },

              // Links
              'a': {
                color: accentColor,
                textDecoration: 'none',
                borderBottom: '1px solid',
                borderColor: 'transparent',
                transition: 'border-color 0.15s ease',
                _hover: {
                  borderColor: accentColor,
                },
              },

              // Lists
              'ul, ol': {
                mb: { base: '1.25em', md: '1.5em' },
                pl: { base: '1.25em', md: '1.5em' },
              },
              'ul': {
                listStyleType: 'disc',
              },
              'ol': {
                listStyleType: 'decimal',
              },
              'li': {
                mb: { base: '0.375em', md: '0.5em' },
                pl: '0.25em',
                '&::marker': {
                  color: mutedColor,
                },
              },
              'li > ul, li > ol': {
                mt: '0.5em',
                mb: '0',
              },

              // Blockquotes
              'blockquote': {
                borderLeft: '3px solid',
                borderColor: blockquoteBorder,
                bg: blockquoteBg,
                my: { base: '1.5em', md: '1.75em' },
                py: { base: '0.75em', md: '1em' },
                px: { base: '1em', md: '1.5em' },
                borderRadius: '0 8px 8px 0',
                fontStyle: 'italic',
                color: mutedColor,
                fontSize: { base: '1rem', md: '1.0625rem' },
                fontWeight: '400',
                '& p': {
                  mb: 0,
                  color: mutedColor,
                },
                '& p:last-child': {
                  mb: 0,
                },
              },

              // Code
              'code': {
                fontFamily: "'JetBrains Mono', 'Fira Code', 'SF Mono', Consolas, monospace",
                fontSize: { base: '0.8125em', md: '0.875em' },
                bg: codeBg,
                color: textColor,
                px: '0.4em',
                py: '0.15em',
                borderRadius: '4px',
                wordBreak: 'break-word',
              },
              'pre': {
                fontFamily: "'JetBrains Mono', 'Fira Code', 'SF Mono', Consolas, monospace",
                fontSize: { base: '0.8125rem', md: '0.875rem' },
                lineHeight: '1.6',
                bg: codeBg,
                color: textColor,
                p: { base: '1em', md: '1.25em' },
                borderRadius: { base: '8px', md: '12px' },
                overflowX: 'auto',
                my: { base: '1.5em', md: '1.75em' },
                mx: { base: '-1rem', sm: 0 },
                WebkitOverflowScrolling: 'touch',
                '& code': {
                  bg: 'transparent',
                  p: 0,
                  borderRadius: 0,
                  fontSize: 'inherit',
                  wordBreak: 'normal',
                  color: textColor,
                },
              },

              // Images
              'img': {
                maxWidth: '100%',
                height: 'auto',
                borderRadius: { base: '8px', md: '12px' },
                my: { base: '1.5em', md: '2em' },
                mx: 'auto',
                display: 'block',
                loading: 'lazy', // Native lazy loading for better performance
              },

              // Horizontal rule
              'hr': {
                border: 'none',
                height: '1px',
                bg: borderColor,
                my: '2.5em',
              },

              // Table wrapper for horizontal scroll on mobile
              '.table-wrapper': {
                overflowX: 'auto',
                WebkitOverflowScrolling: 'touch',
                my: { base: '1.5em', md: '2em' },
                mx: { base: '-1rem', sm: 0 },
                px: { base: '1rem', sm: 0 },
              },
              
              // Tables
              'table': {
                width: '100%',
                minWidth: { base: '500px', md: 'auto' },
                borderCollapse: 'collapse',
                my: { base: '1.5em', md: '2em' },
                fontSize: { base: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
              },
              'th, td': {
                border: '1px solid',
                borderColor: borderColor,
                p: { base: '0.5em 0.75em', md: '0.75em 1em' },
                textAlign: 'left',
                whiteSpace: { base: 'nowrap', md: 'normal' },
              },
              'th': {
                bg: codeBg,
                fontWeight: '600',
              },
              'tr:nth-of-type(even)': {
                bg: blockquoteBg,
              },

              // Strong & emphasis
              'strong, b': {
                fontWeight: '600',
                color: textColor,
              },
              'em, i': {
                fontStyle: 'italic',
              },
              
              // List items
              'li': {
                color: textColor,
              },

              // Prevent long words from breaking layout
              wordBreak: 'break-word',
              overflowWrap: 'break-word',
            }}
            dangerouslySetInnerHTML={{ __html: contentWithRelatedBlog }}
          />

          {/* Display Ad - After Article Content */}
          <DisplayAd />

          {/* Related Blogs Section */}
          {relatedBlogs.length > 0 && (
            <Box pt={{ base: 8, md: 12 }} borderTop="2px solid" borderColor={borderColor}>
              <Heading 
                size="lg" 
                mb={6} 
                color={textColor}
                fontFamily="'Inter', sans-serif"
              >
                Related Articles
              </Heading>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                {relatedBlogs.map((relatedBlog) => (
                  <Card
                    key={relatedBlog.id}
                    bg={shareMenuBg}
                    borderColor={borderColor}
                    borderWidth="1px"
                    borderRadius="lg"
                    overflow="hidden"
                    cursor="pointer"
                    onClick={() => navigate(`/blogs/${relatedBlog.category?.toLowerCase().replace(/\s+/g, '-') || 'uncategorized'}/${relatedBlog.slug}`)}
                    transition="all 0.2s"
                    _hover={{
                      transform: 'translateY(-4px)',
                      boxShadow: 'lg',
                      borderColor: accentColor
                    }}
                  >
                    {relatedBlog.cover_image_url && (
                      <Box
                        h="150px"
                        bgImage={`url(${relatedBlog.cover_image_url})`}
                        bgSize="cover"
                        bgPosition="center"
                        loading="lazy"
                      />
                    )}
                    <Box p={4}>
                      {relatedBlog.category && (
                        <Badge colorScheme="blue" mb={2} fontSize="xs">
                          {relatedBlog.category}
                        </Badge>
                      )}
                      <Heading size="sm" mb={2} color={textColor} noOfLines={2}>
                        {relatedBlog.title}
                      </Heading>
                      {relatedBlog.excerpt && (
                        <Text fontSize="sm" color={mutedColor} noOfLines={3}>
                          {relatedBlog.excerpt}
                        </Text>
                      )}
                    </Box>
                  </Card>
                ))}
              </SimpleGrid>
            </Box>
          )}

          {/* Article Footer */}
          <Box pt={{ base: 6, md: 8 }} borderTop="1px solid" borderColor={borderColor}>
            <Flex 
              direction={{ base: 'column', sm: 'row' }}
              justify="space-between" 
              align={{ base: 'stretch', sm: 'center' }}
              gap={{ base: 3, md: 4 }}
            >
              <HStack spacing={{ base: 2, md: 3 }} justify={{ base: 'center', sm: 'flex-start' }}>
                <Button
                  leftIcon={<FaShare />}
                  variant="outline"
                  colorScheme="gray"
                  size={{ base: 'md', md: 'sm' }}
                  minH="44px"
                  flex={{ base: 1, sm: 'none' }}
                  onClick={toggleShareMenu}
                >
                  Share
                </Button>
              </HStack>
              
              <Button
                variant="ghost"
                size={{ base: 'md', md: 'sm' }}
                minH="44px"
                onClick={() => navigate('/blogs')}
                color={mutedColor}
                _active={{ bg: borderColor }}
              >
                ← More Articles
              </Button>
            </Flex>
          </Box>
            </VStack>
          </Box>

          {/* Table of Contents Sidebar (Desktop) */}
          {showToc && headings.length > 0 && (
            <Box
              display={{ base: 'none', lg: 'block' }}
              w="250px"
              position="sticky"
              top="100px"
              alignSelf="flex-start"
              maxH="calc(100vh - 120px)"
              overflowY="auto"
            >
              <Box
                bg={shareMenuBg}
                borderRadius="lg"
                p={4}
                borderWidth="1px"
                borderColor={borderColor}
              >
                <Heading size="sm" mb={3} color={textColor}>
                  Table of Contents
                </Heading>
                <VStack align="stretch" spacing={2}>
                  {headings.map((heading) => (
                    <Box
                      key={heading.id}
                      pl={heading.level === 'h3' ? 4 : 0}
                      cursor="pointer"
                      onClick={() => {
                        const element = document.getElementById(heading.id);
                        if (element) {
                          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                      }}
                      color={mutedColor}
                      fontSize="sm"
                      _hover={{ color: accentColor }}
                      transition="color 0.2s"
                    >
                      {heading.text}
                    </Box>
                  ))}
                </VStack>
              </Box>
            </Box>
          )}
        </Flex>

        {/* TOC Mobile Overlay */}
        {showToc && headings.length > 0 && (
          <>
            <Box
              display={{ base: 'block', lg: 'none' }}
              position="fixed"
              top={0}
              left={0}
              right={0}
              bottom={0}
              bg="blackAlpha.600"
              zIndex={1500}
              onClick={() => setShowToc(false)}
            />
            <Box
              display={{ base: 'block', lg: 'none' }}
              position="fixed"
              bottom={0}
              left={0}
              right={0}
              bg={shareMenuBg}
              borderTopRadius="24px"
              maxH="70vh"
              overflowY="auto"
              zIndex={1501}
              p={6}
            >
              <Flex justify="space-between" align="center" mb={4}>
                <Heading size="md" color={textColor}>
                  Table of Contents
                </Heading>
                <IconButton
                  aria-label="Close TOC"
                  icon={<Text fontSize="xl">×</Text>}
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowToc(false)}
                  color={mutedColor}
                />
              </Flex>
              <VStack align="stretch" spacing={3}>
                {headings.map((heading) => (
                  <Box
                    key={heading.id}
                    pl={heading.level === 'h3' ? 4 : 0}
                    cursor="pointer"
                    onClick={() => {
                      const element = document.getElementById(heading.id);
                      if (element) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }
                      setShowToc(false);
                    }}
                    color={mutedColor}
                    fontSize="md"
                    _hover={{ color: accentColor }}
                    transition="color 0.2s"
                    py={2}
                  >
                    {heading.text}
                  </Box>
                ))}
              </VStack>
            </Box>
          </>
        )}
      </Container>
    </Box>
  );
};

export default BlogDetail;
