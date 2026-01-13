/**
 * Image optimization utilities for better performance
 */

/**
 * Generate optimized Supabase image URL with transformations
 * @param {string} url - Original Supabase storage URL
 * @param {Object} options - Transformation options
 * @returns {string} - Optimized URL
 */
export const getOptimizedImageUrl = (url, options = {}) => {
  if (!url || !url.includes('supabase.co/storage')) {
    return url;
  }

  const {
    width = null,
    height = null,
    quality = 80,
    format = 'webp', // 'webp' or 'origin'
  } = options;

  // Supabase image transformation
  // Convert: /storage/v1/object/public/... to /storage/v1/render/image/public/...
  let optimizedUrl = url.replace('/object/public/', '/render/image/public/');
  
  const params = [];
  if (width) params.push(`width=${width}`);
  if (height) params.push(`height=${height}`);
  if (quality) params.push(`quality=${quality}`);
  if (format) params.push(`format=${format}`);
  
  if (params.length > 0) {
    optimizedUrl += `?${params.join('&')}`;
  }
  
  return optimizedUrl;
};

/**
 * Generate srcSet for responsive images
 * @param {string} url - Original image URL
 * @param {Array} widths - Array of widths for srcset
 * @returns {string} - srcSet string
 */
export const generateSrcSet = (url, widths = [400, 600, 800, 1200]) => {
  if (!url || !url.includes('supabase.co/storage')) {
    return '';
  }

  return widths
    .map(width => {
      const optimizedUrl = getOptimizedImageUrl(url, { width, quality: 80, format: 'webp' });
      return `${optimizedUrl} ${width}w`;
    })
    .join(', ');
};

/**
 * Get sizes attribute for responsive images
 * @param {string} type - Type of image (blog-card, blog-detail, etc.)
 * @returns {string} - sizes attribute value
 */
export const getImageSizes = (type = 'blog-card') => {
  const sizesMap = {
    'blog-card': '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw',
    'blog-detail': '(max-width: 768px) 100vw, 800px',
    'course-card': '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw',
  };

  return sizesMap[type] || sizesMap['blog-card'];
};

/**
 * Preload critical images
 * @param {string} url - Image URL to preload
 * @param {string} type - Image type (fetch priority)
 */
export const preloadImage = (url, type = 'high') => {
  if (typeof window === 'undefined') return;

  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'image';
  link.href = url;
  link.fetchpriority = type;
  
  // Add to head if not already there
  const existing = document.querySelector(`link[href="${url}"]`);
  if (!existing) {
    document.head.appendChild(link);
  }
};

/**
 * Lazy load image component wrapper
 */
export const lazyLoadConfig = {
  rootMargin: '50px 0px', // Start loading 50px before entering viewport
  threshold: 0.01,
};
