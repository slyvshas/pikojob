import React, { useEffect, useRef, useState, useId, memo } from 'react';
import { Box } from '@chakra-ui/react';

// Track globally which ad instances have been loaded to prevent duplicate pushes
const loadedAdInstances = new Set();

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

  useEffect(() => {
    // Skip if this instance was already loaded (prevents duplicate pushes on re-render)
    if (loadedAdInstances.has(instanceId)) {
      return;
    }

    // Function to push the ad
    const loadAd = () => {
      if (adRef.current && !loadedAdInstances.has(instanceId)) {
        try {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          loadedAdInstances.add(instanceId);
        } catch (error) {
          console.error('AdSense error:', error);
          setAdStatus('unfilled');
        }
      }
    };

    // Use MutationObserver to detect when Google injects ad content
    const observer = new MutationObserver(() => {
      if (containerRef.current) {
        const insElement = containerRef.current.querySelector('ins');
        if (insElement) {
          const hasIframe = insElement.querySelector('iframe');
          const dataAdStatus = insElement.getAttribute('data-ad-status');
          if (hasIframe || dataAdStatus === 'filled') {
            setAdStatus('filled');
            observer.disconnect();
          } else if (dataAdStatus === 'unfilled') {
            // Ad was explicitly not filled - hide it
            setAdStatus('unfilled');
            observer.disconnect();
          }
        }
      }
    });

    // Wait for adsbygoogle script to be ready
    if (typeof window !== 'undefined') {
      // Start observing for changes
      if (containerRef.current) {
        observer.observe(containerRef.current, { 
          childList: true, 
          subtree: true,
          attributes: true,
          attributeFilter: ['data-ad-status']
        });
      }
      
      // Small delay to ensure the ins element is in DOM and script is loaded
      const timer = setTimeout(() => {
        loadAd();
      }, 100);
      
      // Timeout: if no response after 5 seconds, mark as unfilled
      const cleanupTimer = setTimeout(() => {
        if (adStatus === 'loading') {
          setAdStatus('unfilled');
        }
        observer.disconnect();
      }, 5000);
      
      return () => {
        clearTimeout(timer);
        clearTimeout(cleanupTimer);
        observer.disconnect();
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
};

export default DisplayAd;
