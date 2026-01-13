/**
 * Social Meta Tags Manager
 * 
 * Dynamically updates OpenGraph and Twitter Card meta tags for social sharing.
 * This enables rich previews when blog posts are shared on social media.
 */

/**
 * Generate a dynamic OG image URL when no cover image exists
 * Uses a free service to generate images based on the title
 */
const generateDynamicOgImage = (title, category = '') => {
  const encodedTitle = encodeURIComponent(title || 'Growlytic');
  const badge = category ? encodeURIComponent(category.toUpperCase()) : 'ARTICLE';
  
  // Using og.tailgraph.com - a free OG image generator
  return `https://og.tailgraph.com/og?fontFamily=Inter&title=${encodedTitle}&titleTailwind=font-bold%20text-white%20text-5xl&titleFontFamily=Inter&text=${badge}&textTailwind=text-blue-400%20font-medium%20text-xl%20mt-4&textFontFamily=Inter&logoUrl=https%3A%2F%2Fgrowlytic.app%2Ffavicon.png&logoTailwind=w-12%20h-12&bgTailwind=bg-gradient-to-br%20from-slate-900%20via-blue-950%20to-indigo-900&footer=growlytic.app&footerTailwind=text-slate-400`;
};

/**
 * Updates or creates a meta tag
 */
const setMetaTag = (property, content, isName = false) => {
  if (!content) return;
  
  const attribute = isName ? 'name' : 'property';
  let element = document.querySelector(`meta[${attribute}="${property}"]`);
  
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, property);
    document.head.appendChild(element);
  }
  
  element.setAttribute('content', content);
};

/**
 * Updates document title
 */
const setDocumentTitle = (title, siteName = 'Growlytic') => {
  document.title = title ? `${title} | ${siteName}` : siteName;
};

/**
 * Set all social meta tags for a blog post
 */
export const setBlogMetaTags = ({
  title,
  description,
  image,
  url,
  author,
  publishedDate,
  category,
  siteName = 'Growlytic',
}) => {
  // Update document title
  setDocumentTitle(title, siteName);
  
  // Use provided image or generate dynamic OG image
  const ogImage = image || generateDynamicOgImage(title, category);
  
  // Basic meta tags
  setMetaTag('description', description, true);
  setMetaTag('author', author, true);
  setMetaTag('keywords', `${category}, career advice, tech articles, ${author}`, true);
  
  // AI Crawler & Citation meta tags
  setMetaTag('robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1', true);
  setMetaTag('citation_title', title, true);
  setMetaTag('citation_author', author, true);
  setMetaTag('citation_publication_date', publishedDate ? new Date(publishedDate).toISOString().split('T')[0] : '', true);
  setMetaTag('citation_publisher', 'Growlytic', true);
  setMetaTag('citation_journal_title', 'Growlytic Blog', true);
  
  // OpenGraph tags (Facebook, LinkedIn, etc.)
  setMetaTag('og:type', 'article');
  setMetaTag('og:title', title);
  setMetaTag('og:description', description);
  setMetaTag('og:image', ogImage);
  setMetaTag('og:image:secure_url', ogImage); // HTTPS version for secure sites
  setMetaTag('og:image:type', 'image/png');
  setMetaTag('og:image:width', '1200');
  setMetaTag('og:image:height', '630');
  setMetaTag('og:image:alt', title);
  setMetaTag('og:url', url);
  setMetaTag('og:site_name', siteName);
  setMetaTag('og:locale', 'en_US');
  
  // Article specific OpenGraph tags
  if (publishedDate) {
    setMetaTag('article:published_time', new Date(publishedDate).toISOString());
  }
  if (author) {
    setMetaTag('article:author', author);
  }
  if (category) {
    setMetaTag('article:section', category);
    setMetaTag('article:tag', category);
  }
  
  // Twitter Card tags (X.com)
  setMetaTag('twitter:card', 'summary_large_image', true);
  setMetaTag('twitter:title', title, true);
  setMetaTag('twitter:description', description, true);
  setMetaTag('twitter:image', ogImage, true);
  setMetaTag('twitter:image:alt', title, true);
  setMetaTag('twitter:site', '@growlytic', true); // Add your Twitter handle
  setMetaTag('twitter:creator', '@growlytic', true); // Add your Twitter handle
  setMetaTag('twitter:label1', 'Written by', true);
  setMetaTag('twitter:data1', author, true);
  setMetaTag('twitter:label2', 'Filed under', true);
  setMetaTag('twitter:data2', category, true);
  
  // Add canonical URL
  let canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    document.head.appendChild(canonical);
  }
  canonical.setAttribute('href', url);
};

/**
 * Reset meta tags to default site values
 */
export const resetMetaTags = (siteName = 'Growlytic', defaultDescription = 'Career resources, tech articles, and professional development guides.') => {
  setDocumentTitle(null, siteName);
  
  // Reset to default values
  setMetaTag('description', defaultDescription, true);
  setMetaTag('og:type', 'website');
  setMetaTag('og:title', siteName);
  setMetaTag('og:description', defaultDescription);
  setMetaTag('og:site_name', siteName);
  
  // Remove article-specific tags
  const articleTags = ['article:published_time', 'article:author', 'article:section'];
  articleTags.forEach(tag => {
    const element = document.querySelector(`meta[property="${tag}"]`);
    if (element) element.remove();
  });
};

/**
 * Generate social share URLs
 */
export const getSocialShareUrls = (url, title, description = '') => {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description);
  
  return {
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
    email: `mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0A${encodedUrl}`,
    reddit: `https://reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`,
    copyLink: url,
  };
};

/**
 * Open share dialog in a popup window
 */
export const openShareWindow = (url, windowName = 'share') => {
  const width = 600;
  const height = 400;
  const left = (window.innerWidth - width) / 2;
  const top = (window.innerHeight - height) / 2;
  
  window.open(
    url,
    windowName,
    `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes,resizable=yes`
  );
};
