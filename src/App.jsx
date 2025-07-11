import React, { useState, useEffect } from 'react'
import { ChakraProvider, Box, Container, Spinner, Center } from '@chakra-ui/react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import JobList from './pages/JobList.jsx'
import JobDetails from './pages/JobDetails.jsx'
import SavedJobs from './pages/SavedJobs.jsx'
import CreateJob from './pages/CreateJob.jsx'
import JobManagement from './pages/Admin/JobManagement.jsx'
import FreeCoursesDashboard from './pages/Admin/FreeCoursesDashboard.jsx';
import FreeCourses from './pages/FreeCourses.jsx';
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import { theme } from './theme.js'
import { supabase } from './lib/supabase.js'

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
            <Box minH="100vh" display="flex" flexDirection="column">
              <Navbar />
              <Box flex="1" py={8}>
                <Container maxW="container.xl">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/jobs" element={<JobList />} />
                    <Route path="/jobs/:id" element={<JobDetails />} />
                    <Route path="/saved-jobs" element={<SavedJobs />} />
                    <Route path="/free-courses" element={<FreeCourses />} />
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
                  </Routes>
                </Container>
              </Box>
            </Box>
          </Router>
        </AuthProvider>
      </ChakraProvider>
    </React.StrictMode>
  )
}

export default App
