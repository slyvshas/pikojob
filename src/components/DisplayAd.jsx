import React, { useEffect, useRef, useState } from 'react';
import { Box } from '@chakra-ui/react';

/**
 * Google AdSense Display Ad Component
 * 
 * This component renders a responsive Google AdSense display ad unit.
 * It handles the ad initialization and ensures proper loading.
 * 
 * @param {string} slot - The ad slot ID (default: display ad slot)
 * @param {string} format - Ad format: 'auto', 'rectangle', 'horizontal', 'vertical'
 * @param {boolean} fullWidthResponsive - Whether to enable full-width responsive
 * @param {object} style - Additional styles for the container
 * @param {string} className - Additional CSS class
 */
const DisplayAd = ({ 
  slot = '2897803954',
  format = 'auto',
  fullWidthResponsive = true,
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
        // Check if Google added content (iframe or filled status)
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
          style={{
            display: 'block',
            width: '100%',
          }}
          data-ad-client="ca-pub-5560922031519439"
          data-ad-slot={slot}
          data-ad-format={format}
          data-full-width-responsive={fullWidthResponsive ? 'true' : 'false'}
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
        style={{
          display: 'block',
          width: '100%',
        }}
        data-ad-client="ca-pub-5560922031519439"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={fullWidthResponsive ? 'true' : 'false'}
      />
    </Box>
  );
};

/**
 * In-Feed Ad Component
 * Best for between content items in listings/feeds
 */
export const InFeedAd = (props) => (
  <DisplayAd
    slot="2429523378"
    format="fluid"
    {...props}
  />
);

/**
 * Multiplex Ad Component
 * Best for content feeds - shows multiple related content items
 * Uses the autorelaxed format for native look
 */
export const MultiplexAd = (props) => (
  <DisplayAd
    slot="1891736244"
    format="autorelaxed"
    {...props}
  />
);

/**
 * In-Article Ad Component
 * Specifically designed for placement within article content
 */
export const InArticleAd = (props) => (
  <DisplayAd
    slot="2784746590"
    format="fluid"
    style={{ textAlign: 'center' }}
    {...props}
  />
);

/**
 * Sidebar Ad Component
 * For sidebar placements with fixed dimensions
 */
export const SidebarAd = (props) => (
  <DisplayAd
    format="rectangle"
    fullWidthResponsive={false}
    {...props}
  />
);

export default DisplayAd;
