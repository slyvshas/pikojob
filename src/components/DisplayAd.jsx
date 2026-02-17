import React, { useEffect, useRef, useState } from 'react';
import { Box } from '@chakra-ui/react';

/**
 * Google AdSense Display Ad Component
 * 
 * Uses slot 2897803954 with auto format and full-width responsive.
 * Hides container until ad is confirmed loaded to prevent blank space.
 */
const DisplayAd = ({ 
  style = {},
  className = '',
  ...props
}) => {
  const adRef = useRef(null);
  const containerRef = useRef(null);
  const isAdLoaded = useRef(false);
  const [adFilled, setAdFilled] = useState(false);

  useEffect(() => {
    // Function to push the ad
    const loadAd = () => {
      if (adRef.current && !isAdLoaded.current) {
        try {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          isAdLoaded.current = true;
        } catch (error) {
          console.error('AdSense error:', error);
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
            setAdFilled(true);
            observer.disconnect();
          } else if (dataAdStatus === 'unfilled') {
            // Ad was explicitly not filled - keep hidden
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
      
      // Cleanup after 5 seconds if no ad loaded
      const cleanupTimer = setTimeout(() => {
        observer.disconnect();
      }, 5000);
      
      return () => {
        clearTimeout(timer);
        clearTimeout(cleanupTimer);
        observer.disconnect();
      };
    }
  }, []);

  // Completely hide container until ad is confirmed loaded
  if (!adFilled) {
    return (
      <Box
        ref={containerRef}
        className={`ad-container ${className}`}
        style={{ display: 'none' }}
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
  }

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
