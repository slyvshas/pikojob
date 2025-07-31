import ReactGA from 'react-ga4';

// Get Google Analytics Measurement ID from environment variables
const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || 'G-XXXXXXXXXX';

// Initialize Google Analytics
export const initGA = () => {
  if (process.env.NODE_ENV === 'production') {
    ReactGA.initialize(GA_MEASUREMENT_ID);
  }
};

// Track page views
export const trackPageView = (path) => {
  if (process.env.NODE_ENV === 'production') {
    ReactGA.send({ hitType: 'pageview', page: path });
  }
};

// Track custom events
export const trackEvent = (category, action, label = null, value = null) => {
  if (process.env.NODE_ENV === 'production') {
    ReactGA.event({
      category,
      action,
      label,
      value,
    });
  }
};

// Track user engagement
export const trackUserEngagement = (engagementTimeMs) => {
  if (process.env.NODE_ENV === 'production') {
    ReactGA.event({
      category: 'engagement',
      action: 'user_engagement',
      value: engagementTimeMs,
    });
  }
};

// Track job-related events
export const trackJobEvent = (action, jobId = null, jobTitle = null) => {
  trackEvent('job', action, jobTitle, jobId);
};

// Track user authentication events
export const trackAuthEvent = (action, method = null) => {
  trackEvent('authentication', action, method);
};

// Track course-related events
export const trackCourseEvent = (action, courseId = null, courseTitle = null) => {
  trackEvent('course', action, courseTitle, courseId);
};

// Track blog-related events
export const trackBlogEvent = (action, blogId = null, blogTitle = null) => {
  trackEvent('blog', action, blogTitle, blogId);
}; 