import React, { useState, useEffect } from 'react'
import { ChakraProvider, Box, Container, Spinner, Center } from '@chakra-ui/react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import JobList from './pages/JobList.jsx'
import JobDetails from './pages/JobDetails.jsx'
import SavedItems from './pages/SavedItems.jsx'
import CreateJob from './pages/CreateJob.jsx'
import JobManagement from './pages/Admin/JobManagement.jsx'
import FreeCoursesDashboard from './pages/Admin/FreeCoursesDashboard.jsx';
import FreeCourses from './pages/FreeCourses.jsx';
import BlogManagement from './pages/Admin/BlogManagement.jsx';
import Blogs from './pages/Blogs.jsx';
import BlogDetail from './pages/BlogDetail.jsx';
import Opportunities from './pages/Opportunities.jsx';
import OpportunitiesDashboard from './pages/Admin/OpportunitiesDashboard.jsx';
import FreeBooks from './pages/FreeBooks.jsx';
import FreeBooksDashboard from './pages/Admin/FreeBooksDashboard.jsx';
import AuthCallback from './pages/AuthCallback.jsx';
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import { theme } from './theme.js'
import { supabase } from './lib/supabase.js'
import { usePageTracking, useEngagementTracking } from './hooks/useAnalytics.js'


// Protected Route component for admin access
const ProtectedRoute = ({ children }) => {
  const { user, isAdmin, loading } = useAuth()

  if (loading) {
    return <Center minH="100vh"><Spinner size="xl" /></Center>
  }

  if (!user || !isAdmin) {
    return <Navigate to="/login" />
  }

  return children
}

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
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/jobs" element={<JobList />} />
            <Route path="/jobs/:id" element={<JobDetails />} />
            <Route path="/saved-items" element={<SavedItems />} />
            <Route path="/free-courses" element={<FreeCourses />} />
            <Route path="/free-books" element={<FreeBooks />} />
            <Route path="/opportunities" element={<Opportunities />} />
            <Route path="/blogs" element={<Blogs />} />
            <Route path="/blogs/:slug" element={<BlogDetail />} />
            <Route 
              path="/create-job" 
              element={
                <ProtectedRoute>
                  <CreateJob />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/job-management" 
              element={
                <ProtectedRoute>
                  <JobManagement />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/free-courses" 
              element={
                <ProtectedRoute>
                  <FreeCoursesDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/blog-management" 
              element={
                <ProtectedRoute>
                  <BlogManagement />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/opportunities" 
              element={
                <ProtectedRoute>
                  <OpportunitiesDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/free-books" 
              element={
                <ProtectedRoute>
                  <FreeBooksDashboard />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </Container>
      </Box>
    </Box>
  );
}

export default App
