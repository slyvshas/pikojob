import React, { useEffect, useState, useRef, useCallback } from "react";
import { Icon } from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';
// import { supabase } from "../lib/supabase"; // Import dynamically below

import {
  Box,
  Heading,
  Text,
  Image,
  VStack,
  HStack,
  Badge,
  Divider,
  Spinner,
  Button,
  IconButton,
} from '@chakra-ui/react';
import { CloseIcon, ViewIcon, ViewOffIcon } from '@chakra-ui/icons';

const TRANSITION_DURATION = 300; // Milliseconds, matches your CSS transition '0.3s'
const DRAG_THRESHOLD = 100; // Pixels to drag down before closing

function BlogSlideUp({ open, slug, onClose, triggerElementRef }) {
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [shouldRender, setShouldRender] = useState(open);
  const timeoutRef = useRef(null);

  // States for slide-down-to-close feature
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const dragRef = useRef(null); // Ref for the draggable element
  const overlayRef = useRef(null); // Ref for the overlay
  const closeButtonRef = useRef(null); // Ref for focus management
  const headingRef = useRef(null); // Ref for aria-labelledby
  const headingId = `blog-heading-${slug || 'default'}`; // Unique ID for heading

  // Focus trap refs
  const firstFocusableRef = useRef(null);
  const lastFocusableRef = useRef(null);

  // Effect for controlling mount/unmount based on 'open' prop
  useEffect(() => {
    if (open) {
      setShouldRender(true);
    } else {
      timeoutRef.current = setTimeout(() => {
        setShouldRender(false);
      }, TRANSITION_DURATION);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [open]);

  // Effect to fetch blog content
  useEffect(() => {
    if (!open || !slug || !shouldRender) return;
    setLoading(true);
    setError(null);
    setBlog(null);

    import('../lib/supabase').then(({ supabase }) => {
      supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .single()
        .then(({ data, error }) => {
          if (error) {
            console.error("Error fetching blog post:", error);
            if (error.code === 'PGRST116') {
              setError('No blog post found for this link. It might have been removed or the link is incorrect.');
            } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
              setError('Network error: Could not load blog content. Please check your connection and try again.');
            } else {
              setError('Could not load blog content. Please try again.');
            }
          } else {
            setBlog(data);
          }
          setLoading(false);
        })
        .catch((err) => {
            console.error("Unexpected error during blog fetch:", err);
            setError('An unexpected error occurred while loading the blog content.');
            setLoading(false);
        });
    });
  }, [open, slug, shouldRender]);

  // Effect to control body overflow
  useEffect(() => {
    if (open && isFullscreen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [isFullscreen, open]);

  // Focus management effect
  useEffect(() => {
    if (open && shouldRender) {
      // Focus on the close button when panel opens
      const focusTimer = setTimeout(() => {
        if (closeButtonRef.current) {
          closeButtonRef.current.focus();
        }
      }, TRANSITION_DURATION + 50); // Wait for animation to complete

      return () => clearTimeout(focusTimer);
    } else if (!open && triggerElementRef?.current) {
      // Return focus to trigger element when panel closes
      const returnFocusTimer = setTimeout(() => {
        triggerElementRef.current.focus();
      }, TRANSITION_DURATION);

      return () => clearTimeout(returnFocusTimer);
    }
  }, [open, shouldRender, triggerElementRef]);

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!open) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      // Focus trap logic
      if (e.key === 'Tab') {
        const focusableElements = dragRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        if (!focusableElements || focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          // Shift + Tab
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          // Tab
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    if (open) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose]);

  // --- Drag-to-close handlers ---

  const handleTouchStart = useCallback((e) => {
    // Only start dragging if not in fullscreen to avoid conflicts with content scrolling
    // or if the scroll position is at the very top (i.e., you can't scroll up further)
    const target = dragRef.current;
    if (target && target.scrollTop === 0) {
      setIsDragging(true);
      setStartY(e.touches[0].clientY);
      setCurrentY(e.touches[0].clientY);
    }
  }, []);

  const handleMouseDown = useCallback((e) => {
    const target = dragRef.current;
    if (target && target.scrollTop === 0) {
      setIsDragging(true);
      setStartY(e.clientY);
      setCurrentY(e.clientY);
    }
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (!isDragging) return;

    const newY = e.touches[0].clientY;
    const dy = newY - startY;

    // Only allow dragging downwards
    if (dy > 0) {
      setCurrentY(newY);
      e.preventDefault(); // Prevent page scroll when dragging the component
    } else {
      // If user tries to drag up, reset drag state
      setIsDragging(false);
      setCurrentY(startY);
    }
  }, [isDragging, startY]);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;

    const newY = e.clientY;
    const dy = newY - startY;

    if (dy > 0) {
      setCurrentY(newY);
      e.preventDefault(); // Prevent text selection/other browser defaults
    } else {
      setIsDragging(false);
      setCurrentY(startY);
    }
  }, [isDragging, startY]);

  const handleTouchEnd = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);

    const dy = currentY - startY;
    if (dy > DRAG_THRESHOLD) {
      onClose(); // Close if dragged past threshold
    } else {
      // Snap back if not dragged enough
      setCurrentY(startY); // This effectively resets transform via style
    }
  }, [isDragging, startY, currentY, onClose]);

  const handleMouseUp = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);

    const dy = currentY - startY;
    if (dy > DRAG_THRESHOLD) {
      onClose();
    } else {
      setCurrentY(startY);
    }
  }, [isDragging, startY, currentY, onClose]);

  // Attach event listeners to the document when dragging starts
  // and clean them up when dragging stops or component unmounts
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    } else {
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleTouchMove, handleTouchEnd, handleMouseMove, handleMouseUp]);

  // Handle overlay click to close
  const handleOverlayClick = useCallback((e) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  }, [onClose]);

  // Calculate transform for the draggable effect
  const translateY = isDragging ? Math.max(0, currentY - startY) : 0;

  // If shouldRender is false, don't render anything
  if (!shouldRender) {
    return null;
  }

  return (
    <>
      {/* Dimming Overlay */}
      <div
        ref={overlayRef}
        onClick={handleOverlayClick}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          opacity: open ? 1 : 0,
          transition: `opacity ${TRANSITION_DURATION}ms ease-out`,
          zIndex: 999,
          pointerEvents: open ? 'auto' : 'none',
        }}
        aria-hidden="true"
      />
      
      {/* Main Panel */}
      <div
        ref={dragRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        aria-describedby={blog ? `${headingId}-excerpt` : undefined}
        style={{
          position: 'fixed',
          left: 0,
          right: 0,
          top: isFullscreen ? 0 : 'auto',
          bottom: open ? 0 : '-100%',
          height: isFullscreen ? '100vh' : '60vh',
          background: '#fff',
          boxShadow: '0 -2px 16px rgba(0,0,0,0.2)',
          transition: isDragging
            ? 'none' // Disable transition during drag for smooth follow
            : `bottom ${TRANSITION_DURATION}ms, height ${TRANSITION_DURATION}ms, transform ${TRANSITION_DURATION}ms`,
          zIndex: 1000,
          pointerEvents: open ? 'auto' : 'none',
          display: 'flex',
          flexDirection: 'column',
          transform: `translateY(${translateY}px)`, // Apply the drag transform
          overflowY: isDragging ? 'hidden' : 'auto', // Temporarily hide overflow when dragging
        }}
        // Attach initial touch/mouse listeners directly to the div
        onTouchStart={handleTouchStart}
        onMouseDown={handleMouseDown}
      >
        {/* Header Controls */}
        <HStack
          justifyContent="space-between"
          p={4}
          pb={2}
          bg="white"
          zIndex={1001}
          flexShrink={0}
          borderBottom="1px solid #eee"
        >
          {/* Close Button - now visible for accessibility */}
          <Button 
            ref={closeButtonRef}
            size="sm" 
            onClick={onClose} 
            leftIcon={<CloseIcon />}
            aria-label="Close blog post dialog"
          >
            Close
          </Button>

          {/* --- Pull Down Hint Symbol --- */}
          <VStack spacing={0} alignItems="center" flexGrow={1} position="absolute" left="50%" transform="translateX(-50%)">
              <Icon as={ChevronDownIcon} boxSize={6} color="gray.400" />
              {/* Optional: a subtle horizontal line */}
              <Box
                  width="40px"
                  height="4px"
                  borderRadius="full"
                  bg="gray.300"
                  mt={-2} // Adjust margin to position below the arrow
                  mb={2}
              />
          </VStack>
          {/* --- End Pull Down Hint Symbol --- */}
          
          <IconButton
            icon={isFullscreen ? <ViewOffIcon /> : <ViewIcon />}
            onClick={() => setIsFullscreen(!isFullscreen)}
            size="sm"
            aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          />
        </HStack>

        {/* Main content area - This will scroll */}
        <Box
          flex={1}
          overflowY="auto" // This box handles its own scrolling
          p={4}
          pt={2}
        >
          {loading && (
            <VStack spacing={4} py={8}>
              <Spinner size="lg" />
              <Text color="gray.600">Loading blog post...</Text>
            </VStack>
          )}
          
          {error && (
            <VStack spacing={4} py={8}>
              <Text color="red.500" textAlign="center">{error}</Text>
              <Button size="sm" onClick={onClose} colorScheme="gray">
                Close
              </Button>
            </VStack>
          )}
          
          {!loading && !error && !blog && slug && (
            <VStack spacing={4} py={8}>
              <Text color="gray.600" textAlign="center">
                No blog post found for this link. It might have been removed or the link is incorrect.
              </Text>
              <Button size="sm" onClick={onClose} colorScheme="gray">
                Close
              </Button>
            </VStack>
          )}
          
          {!loading && !error && blog && (
            <Box maxW="800px" mx="auto">
              {blog.cover_image_url && (
                <Image 
                  src={blog.cover_image_url} 
                  alt={blog.title} 
                  borderRadius="md" 
                  mb={6} 
                  maxH="200px" 
                  objectFit="cover" 
                  w="100%" 
                />
              )}
              <Heading 
                ref={headingRef}
                id={headingId}
                mb={2} 
                color="blue.700" 
                size="md"
              >
                {blog.title}
              </Heading>
              <Text 
                id={`${headingId}-excerpt`}
                fontSize="md" 
                color="gray.600" 
                mb={2}
              >
                {blog.excerpt}
              </Text>
              <HStack spacing={4} mb={2}>
                <Text fontSize="sm" color="gray.500">By {blog.author_name || 'Unknown'}</Text>
                <Text fontSize="sm" color="gray.500">
                  {blog.published_at ? new Date(blog.published_at).toLocaleDateString() : ''}
                </Text>
              </HStack>
              {blog.tags && blog.tags.length > 0 && (
                <HStack mb={2} spacing={2} flexWrap="wrap">
                  {blog.tags.map((tag, idx) => (
                    <Badge key={idx} colorScheme="blue">{tag}</Badge>
                  ))}
                </HStack>
              )}
              <Divider my={4} />
              <Box
                className="tiptap-content"
                fontSize="sm"
                color="gray.800"
                dangerouslySetInnerHTML={{ __html: blog.content }}
              />
            </Box>
          )}
        </Box>
      </div>
    </>
  );
}

export default BlogSlideUp;