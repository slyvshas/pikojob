/**
 * Structured Data (JSON-LD) Manager
 * 
 * Generates schema.org structured data for SEO and rich snippets in Google search.
 * Helps search engines understand content better and display enhanced results.
 */

/**
 * Generate Organization schema for the website
 * Use this on the home page or site-wide
 */
export const generateOrganizationSchema = () => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Growlytic',
    url: 'https://growlytic.app',
    logo: 'https://growlytic.app/favicon.png',
    description: 'Career resources, tech articles, and professional development guides to advance your career.',
    sameAs: [
      'https://www.linkedin.com/company/growlytic',
      'https://twitter.com/growlytic',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Support',
      url: 'https://growlytic.app/contact'
    }
  };
};

/**
 * Generate WebSite schema with search action
 * Enables Google to show a site search box in search results
 */
export const generateWebSiteSchema = () => {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Growlytic',
    url: 'https://growlytic.app',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://growlytic.app/blogs?search={search_term_string}'
      },
      'query-input': 'required name=search_term_string'
    }
  };
};

/**
 * Generate Article schema for blog posts
 * This creates rich snippets in Google search results
 */
export const generateArticleSchema = ({
  title,
  description,
  image,
  url,
  author,
  publishedDate,
  modifiedDate,
  category,
  tags = []
}) => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description: description || title,
    image: image || 'https://growlytic.app/og-image.png',
    url: url || window.location.href,
    datePublished: publishedDate,
    dateModified: modifiedDate || publishedDate,
    author: {
      '@type': 'Person',
      name: author || 'Growlytic Team'
    },
    publisher: {
      '@type': 'Organization',
      name: 'Growlytic',
      logo: {
        '@type': 'ImageObject',
        url: 'https://growlytic.app/favicon.png'
      }
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url || window.location.href
    }
  };

  // Add category as articleSection
  if (category) {
    schema.articleSection = category;
  }

  // Add tags as keywords
  if (tags && tags.length > 0) {
    schema.keywords = Array.isArray(tags) ? tags.join(', ') : tags;
  }

  return schema;
};

/**
 * Generate BreadcrumbList schema for navigation
 */
export const generateBreadcrumbSchema = (items) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  };
};

/**
 * Generate Course schema for free courses
 */
export const generateCourseSchema = ({
  title,
  description,
  provider,
  url,
  category
}) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: title,
    description: description || title,
    provider: {
      '@type': 'Organization',
      name: provider
    },
    url: url,
    educationalLevel: category || 'All Levels',
    isAccessibleForFree: true
  };
};

/**
 * Generate JobPosting schema
 */
export const generateJobPostingSchema = ({
  title,
  description,
  company,
  location,
  employmentType,
  salary,
  datePosted,
  validThrough,
  applicationUrl
}) => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: title,
    description: description,
    hiringOrganization: {
      '@type': 'Organization',
      name: company
    },
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: location
      }
    },
    datePosted: datePosted,
    employmentType: employmentType,
    url: applicationUrl || window.location.href
  };

  // Add salary if available
  if (salary) {
    schema.baseSalary = {
      '@type': 'MonetaryAmount',
      currency: 'USD',
      value: {
        '@type': 'QuantitativeValue',
        value: salary,
        unitText: 'YEAR'
      }
    };
  }

  // Add expiration date if available
  if (validThrough) {
    schema.validThrough = validThrough;
  }

  return schema;
};

/**
 * Inject structured data script into the page
 * Removes any existing script with the same id first
 */
export const injectStructuredData = (schema, id = 'structured-data') => {
  // Remove existing script if present
  const existingScript = document.getElementById(id);
  if (existingScript) {
    existingScript.remove();
  }

  // Create and inject new script
  const script = document.createElement('script');
  script.id = id;
  script.type = 'application/ld+json';
  script.text = JSON.stringify(schema);
  document.head.appendChild(script);
};

/**
 * Inject multiple schemas at once
 */
export const injectMultipleSchemas = (schemas, id = 'structured-data') => {
  // Create a @graph to hold multiple schemas
  const graphSchema = {
    '@context': 'https://schema.org',
    '@graph': schemas
  };
  
  injectStructuredData(graphSchema, id);
};

/**
 * Remove structured data from the page
 */
export const removeStructuredData = (id = 'structured-data') => {
  const script = document.getElementById(id);
  if (script) {
    script.remove();
  }
};
