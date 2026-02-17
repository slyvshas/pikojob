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
          
          // Check if ad was filled after a delay
          setTimeout(() => {
            if (containerRef.current) {
              const insElement = containerRef.current.querySelector('ins');
              if (insElement && insElement.offsetHeight > 0) {
                setAdFilled(true);
              }
            }
          }, 2000);
        } catch (error) {
          console.error('AdSense error:', error);
        }
      }
    };

    // Wait for adsbygoogle script to be ready
    if (typeof window !== 'undefined') {
      // Small delay to ensure the ins element is in DOM and script is loaded
      const timer = setTimeout(() => {
        loadAd();
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, []);

  // Don't render empty space if ads aren't filling
  // Show minimal container that expands when ad loads
  return (
    <Box
      ref={containerRef}
      className={`ad-container ${className}`}
      my={adFilled ? { base: 4, md: 6 } : 0}
      mx="auto"
      w="100%"
      maxW="100%"
      minH={adFilled ? '90px' : '0'}
      textAlign="center"
      overflow="hidden"
      transition="all 0.3s ease"
      style={style}
      {...props}
    >
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{
          display: 'block',
          width: '100%',
          minHeight: '0',
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
