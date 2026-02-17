import React, { useEffect, useRef } from 'react';
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
  const isAdLoaded = useRef(false);

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

    // Wait for adsbygoogle script to be ready
    if (typeof window !== 'undefined') {
      // Small delay to ensure the ins element is in DOM and script is loaded
      const timer = setTimeout(() => {
        loadAd();
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <Box
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
