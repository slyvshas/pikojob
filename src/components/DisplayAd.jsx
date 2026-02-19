import React, { useEffect, useRef, useState, useId, memo } from 'react';
import { Box } from '@chakra-ui/react';

/**
 * Google AdSense Display Ad Component
 * 
 * Uses slot 2897803954 with auto format and full-width responsive.
 * Shows ad container initially (required for AdSense to load), then hides if unfilled.
 * Memoized to prevent unnecessary re-renders.
 */
const DisplayAd = memo(({ 
  style = {},
  className = '',
  adKey = '', // Optional stable key for the ad placement
  ...props
}) => {
  const adRef = useRef(null);
  const containerRef = useRef(null);
  const reactId = useId();
  // Create a stable instance ID combining the provided key with React's useId
  const instanceId = adKey || reactId;
  // Start as null (unknown state), then set to true/false based on ad status
  const [adStatus, setAdStatus] = useState('loading'); // 'loading' | 'filled' | 'unfilled'
  // Use ref to track status for timeout callback to avoid stale closure
  const adStatusRef = useRef('loading');
  // Track if ad push was attempted for this mount
  const hasAttemptedLoad = useRef(false);

  useEffect(() => {
    // Reset ref on mount
    adStatusRef.current = 'loading';
    hasAttemptedLoad.current = false;
    
    let loadTimer = null;
    let cleanupTimer = null;
    let resizeObserver = null;
    let mutationObserver = null;

    // Function to push the ad - only when container has width
    const loadAd = () => {
      if (!adRef.current || hasAttemptedLoad.current) return;
      
      // Check if container has actual width (required for AdSense)
      const containerWidth = containerRef.current?.offsetWidth || 0;
      if (containerWidth === 0) {
        // Container has no width yet, wait and retry
        loadTimer = setTimeout(loadAd, 200);
        return;
      }
      
      try {
        hasAttemptedLoad.current = true;
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (error) {
        console.error('AdSense error:', error);
        adStatusRef.current = 'unfilled';
        setAdStatus('unfilled');
      }
    };

    // Use MutationObserver to detect when Google injects ad content
    mutationObserver = new MutationObserver(() => {
      if (containerRef.current) {
        const insElement = containerRef.current.querySelector('ins');
        if (insElement) {
          const hasIframe = insElement.querySelector('iframe');
          const dataAdStatus = insElement.getAttribute('data-ad-status');
          if (hasIframe || dataAdStatus === 'filled') {
            adStatusRef.current = 'filled';
            setAdStatus('filled');
            mutationObserver?.disconnect();
          } else if (dataAdStatus === 'unfilled') {
            // Ad was explicitly not filled - hide it
            adStatusRef.current = 'unfilled';
            setAdStatus('unfilled');
            mutationObserver?.disconnect();
          }
        }
      }
    });

    // Wait for adsbygoogle script to be ready
    if (typeof window !== 'undefined') {
      // Start observing for changes
      if (containerRef.current) {
        mutationObserver.observe(containerRef.current, { 
          childList: true, 
          subtree: true,
          attributes: true,
          attributeFilter: ['data-ad-status']
        });
        
        // Use ResizeObserver to detect when container gets width
        if (typeof ResizeObserver !== 'undefined') {
          resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
              if (entry.contentRect.width > 0 && !hasAttemptedLoad.current) {
                loadAd();
                resizeObserver?.disconnect();
                break;
              }
            }
          });
          resizeObserver.observe(containerRef.current);
        }
      }
      
      // Fallback: try loading after a delay
      loadTimer = setTimeout(() => {
        loadAd();
      }, 300);
      
      // Timeout: if no response after 10 seconds, mark as unfilled
      cleanupTimer = setTimeout(() => {
        if (adStatusRef.current === 'loading') {
          adStatusRef.current = 'unfilled';
          setAdStatus('unfilled');
        }
        mutationObserver?.disconnect();
        resizeObserver?.disconnect();
      }, 10000);
      
      return () => {
        if (loadTimer) clearTimeout(loadTimer);
        if (cleanupTimer) clearTimeout(cleanupTimer);
        mutationObserver?.disconnect();
        resizeObserver?.disconnect();
      };
    }
  }, [instanceId]);

  // Hide completely if ad was not filled
  if (adStatus === 'unfilled') {
    return null;
  }

  // Show container - must be visible for AdSense to detect and load the ad
  // AdSense won't load ads into display:none or visibility:hidden elements
  return (
    <Box
      ref={containerRef}
      className={`ad-container ${className}`}
      my={{ base: 4, md: 6 }}
      mx="auto"
      w="100%"
      maxW="100%"
      minH="90px"
      textAlign="center"
      style={style}
      {...props}
    >
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-5560922031519439"
        data-ad-slot="2897803954"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </Box>
  );
});

export default DisplayAd;
