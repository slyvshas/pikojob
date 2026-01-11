import React, { useState, useEffect } from 'react'
import { ChakraProvider, Box, Container, Spinner, Center } from '@chakra-ui/react'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import CookieConsent from './components/CookieConsent.jsx'
import Home from './pages/Home.jsx'
import FreeCoursesDashboard from './pages/Admin/FreeCoursesDashboard.jsx';
import FreeBooksDashboard from './pages/Admin/FreeBooksDashboard.jsx';
import FreeCourses from './pages/FreeCourses.jsx';
import FreeBooks from './pages/FreeBooks.jsx';
import BlogManagement from './pages/Admin/BlogManagement.jsx';
import Blogs from './pages/Blogs.jsx';
import BlogDetail from './pages/BlogDetail.jsx';
import OpportunitiesDashboard from './pages/Admin/OpportunitiesDashboard.jsx';
import AboutUs from './pages/AboutUs.jsx';
import Contact from './pages/Contact.jsx';
import PrivacyPolicy from './pages/PrivacyPolicy.jsx';
import TermsOfService from './pages/TermsOfService.jsx';
import CookiePolicy from './pages/CookiePolicy.jsx';
import ContactMessagesDashboard from './pages/Admin/ContactMessagesDashboard.jsx';
import AdminLogin from './pages/Admin/AdminLogin.jsx';
import { theme } from './theme.js'
import { supabase } from './lib/supabase.js'
import { usePageTracking, useEngagementTracking } from './hooks/useAnalytics.js'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'

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
      <Box flex="1" py={8}>
        <Container maxW="container.xl">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/free-courses" element={<FreeCourses />} />
            <Route path="/free-books" element={<FreeBooks />} />
            <Route path="/blogs" element={<Blogs />} />
            <Route path="/blogs/:slug" element={<BlogDetail />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/cookies" element={<CookiePolicy />} />
            {/* Admin Login */}
            <Route path="/admin" element={<AdminLogin />} />
            {/* Protected Admin Routes */}
            <Route path="/admin/free-courses" element={<ProtectedRoute><FreeCoursesDashboard /></ProtectedRoute>} />
            <Route path="/admin/free-books" element={<ProtectedRoute><FreeBooksDashboard /></ProtectedRoute>} />
            <Route path="/admin/blog-management" element={<ProtectedRoute><BlogManagement /></ProtectedRoute>} />
            <Route path="/admin/opportunities" element={<ProtectedRoute><OpportunitiesDashboard /></ProtectedRoute>} />
            <Route path="/admin/contact-messages" element={<ProtectedRoute><ContactMessagesDashboard /></ProtectedRoute>} />
          </Routes>
        </Container>
      </Box>
      <Footer />
      <CookieConsent />
    </Box>
  );
}

export default App
