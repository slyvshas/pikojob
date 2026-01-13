import React, { useState, useEffect, lazy, Suspense } from 'react'
import { ChakraProvider, Box, Container, Spinner, Center } from '@chakra-ui/react'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import CookieConsent from './components/CookieConsent.jsx'
import Home from './pages/Home.jsx'
import { theme } from './theme.js'
import { supabase } from './lib/supabase.js'
import { usePageTracking, useEngagementTracking } from './hooks/useAnalytics.js'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'

// Lazy load non-critical pages for better initial load performance
const FreeCoursesDashboard = lazy(() => import('./pages/Admin/FreeCoursesDashboard.jsx'));
const FreeCourses = lazy(() => import('./pages/FreeCourses.jsx'));
const FreeBooks = lazy(() => import('./pages/FreeBooks.jsx'));
const BlogManagement = lazy(() => import('./pages/Admin/BlogManagement.jsx'));
const Blogs = lazy(() => import('./pages/Blogs.jsx'));
const BlogDetail = lazy(() => import('./pages/BlogDetail.jsx'));
const AboutUs = lazy(() => import('./pages/AboutUs.jsx'));
const Contact = lazy(() => import('./pages/Contact.jsx'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy.jsx'));
const TermsOfService = lazy(() => import('./pages/TermsOfService.jsx'));
const CookiePolicy = lazy(() => import('./pages/CookiePolicy.jsx'));
const AdminLogin = lazy(() => import('./pages/Admin/AdminLogin.jsx'));

// Loading fallback component
const PageLoader = () => (
  <Center py={20}>
    <Spinner size="xl" color="purple.500" thickness="4px" />
  </Center>
);

// Protected Route component for admin pages
const ProtectedRoute = ({ children }) => {
  const { user, isAdmin, loading } = useAuth();
  
  if (loading) {
    return (
      <Center py={20}>
        <Spinner size="xl" color="purple.500" />
      </Center>
    );
  }
  
  if (!user || !isAdmin) {
    return <Navigate to="/admin" replace />;
  }
  
  return children;
};

function App() {
  return (
    <React.StrictMode>
      <ChakraProvider theme={theme}>
        <AuthProvider>
          <Router>
            <AppContent />
          </Router>
        </AuthProvider>
      </ChakraProvider>
    </React.StrictMode>
  )
}

// Separate component to use analytics hooks inside Router context
function AppContent() {
  const location = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Initialize analytics tracking inside Router context
  usePageTracking();
  useEngagementTracking();

  return (
    <Box minH="100vh" display="flex" flexDirection="column">
      <Navbar />
      <Box as="main" flex="1" py={8}>
        <Container maxW="container.xl">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/free-courses" element={<FreeCourses />} />
              <Route path="/free-books" element={<FreeBooks />} />
              <Route path="/blogs" element={<Blogs />} />
              <Route path="/blogs/:category/:slug" element={<BlogDetail />} />
              <Route path="/about" element={<AboutUs />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/cookies" element={<CookiePolicy />} />
              {/* Admin Login */}
              <Route path="/admin" element={<AdminLogin />} />
              {/* Protected Admin Routes */}
              <Route path="/admin/free-courses" element={<ProtectedRoute><FreeCoursesDashboard /></ProtectedRoute>} />
              <Route path="/admin/blog-management" element={<ProtectedRoute><BlogManagement /></ProtectedRoute>} />
            </Routes>
          </Suspense>
        </Container>
      </Box>
      <Footer />
      <CookieConsent />
    </Box>
  );
}

export default App
