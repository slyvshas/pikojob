import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView, trackEvent, trackJobEvent, trackAuthEvent, trackCourseEvent, trackBlogEvent } from '../lib/analytics';

// Hook to track page views automatically
export const usePageTracking = () => {
  const location = useLocation();

  useEffect(() => {
    trackPageView(location.pathname + location.search);
  }, [location]);
};

// Hook to track user engagement time
export const useEngagementTracking = () => {
  useEffect(() => {
    let startTime = Date.now();
    
    const handleVisibilityChange = () => {
      if (document.hidden) {
        const engagementTime = Date.now() - startTime;
        if (engagementTime > 1000) { // Only track if user was engaged for more than 1 second
          trackEvent('engagement', 'page_leave', null, engagementTime);
        }
      } else {
        startTime = Date.now();
      }
    };

    const handleBeforeUnload = () => {
      const engagementTime = Date.now() - startTime;
      if (engagementTime > 1000) {
        trackEvent('engagement', 'page_leave', null, engagementTime);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);
};

// Hook for tracking job-related events
export const useJobTracking = () => {
  const trackJobView = (jobId, jobTitle) => {
    trackJobEvent('view', jobId, jobTitle);
  };

  const trackJobApply = (jobId, jobTitle) => {
    trackJobEvent('apply', jobId, jobTitle);
  };

  const trackJobSave = (jobId, jobTitle) => {
    trackJobEvent('save', jobId, jobTitle);
  };

  const trackJobSearch = (searchTerm) => {
    trackEvent('job', 'search', searchTerm);
  };

  return {
    trackJobView,
    trackJobApply,
    trackJobSave,
    trackJobSearch,
  };
};

// Hook for tracking authentication events
export const useAuthTracking = () => {
  const trackLogin = (method) => {
    trackAuthEvent('login', method);
  };

  const trackLogout = () => {
    trackAuthEvent('logout');
  };

  const trackRegister = (method) => {
    trackAuthEvent('register', method);
  };

  return {
    trackLogin,
    trackLogout,
    trackRegister,
  };
};

// Hook for tracking course events
export const useCourseTracking = () => {
  const trackCourseView = (courseId, courseTitle) => {
    trackCourseEvent('view', courseId, courseTitle);
  };

  const trackCourseEnroll = (courseId, courseTitle) => {
    trackCourseEvent('enroll', courseId, courseTitle);
  };

  const trackCourseComplete = (courseId, courseTitle) => {
    trackCourseEvent('complete', courseId, courseTitle);
  };

  return {
    trackCourseView,
    trackCourseEnroll,
    trackCourseComplete,
  };
};

// Hook for tracking blog events
export const useBlogTracking = () => {
  const trackBlogView = (blogId, blogTitle) => {
    trackBlogEvent('view', blogId, blogTitle);
  };

  const trackBlogShare = (blogId, blogTitle, platform) => {
    trackBlogEvent('share', blogId, `${blogTitle} - ${platform}`);
  };

  const trackBlogComment = (blogId, blogTitle) => {
    trackBlogEvent('comment', blogId, blogTitle);
  };

  return {
    trackBlogView,
    trackBlogShare,
    trackBlogComment,
  };
}; 