import { useEffect, useRef } from 'react'
import { Box } from '@chakra-ui/react'

/**
 * EzoicAd Component
 * 
 * Usage:
 * <EzoicAd placementId={101} />
 * 
 * Props:
 * - placementId: The Ezoic placement ID (required)
 * - marginY: Vertical margin (optional, default: 4)
 * - display: Chakra UI display prop (optional)
 */
const EzoicAd = ({ placementId, marginY = 4, display }) => {
  const adRef = useRef(null)
  const hasLoaded = useRef(false)

  useEffect(() => {
    // Only load the ad once
    if (hasLoaded.current) return
    
    // Check if Ezoic is loaded
    if (window.ezstandalone && window.ezstandalone.cmd) {
      // Add command to queue
      window.ezstandalone.cmd.push(function () {
        window.ezstandalone.showAds(placementId)
      })
      hasLoaded.current = true
    } else {
      console.warn('Ezoic not loaded yet for placement:', placementId)
    }
  }, [placementId])

  return (
    <Box 
      id={`ezoic-pub-ad-placeholder-${placementId}`}
      my={marginY}
      display={display}
      className="ezoic-ad"
    />
  )
}

export default EzoicAd
