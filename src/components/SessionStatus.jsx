import { useEffect, useState } from 'react'
import {
  Box,
  Text,
  Badge,
  useToast,
  useColorModeValue,
  HStack,
  VStack,
  Icon,
  Button,
} from '@chakra-ui/react'
import { FaUser, FaClock, FaExclamationTriangle } from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'

const SessionStatus = () => {
  const { user, session, isSessionExpiringSoon, refreshSession } = useAuth()
  const [timeLeft, setTimeLeft] = useState('')
  const toast = useToast()

  // Theme colors
  const bgColor = useColorModeValue('gray.50', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const textColor = useColorModeValue('gray.800', 'white')
  const mutedColor = useColorModeValue('gray.600', 'gray.400')

  useEffect(() => {
    if (!session) return

    const updateTimeLeft = () => {
      const expiresAt = new Date(session.expires_at * 1000)
      const now = new Date()
      const timeUntilExpiry = expiresAt.getTime() - now.getTime()

      if (timeUntilExpiry <= 0) {
        setTimeLeft('Expired')
        return
      }

      const hours = Math.floor(timeUntilExpiry / (1000 * 60 * 60))
      const minutes = Math.floor((timeUntilExpiry % (1000 * 60 * 60)) / (1000 * 60))

      if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m`)
      } else {
        setTimeLeft(`${minutes}m`)
      }
    }

    updateTimeLeft()
    const interval = setInterval(updateTimeLeft, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [session])

  useEffect(() => {
    if (isSessionExpiringSoon() && session) {
      toast({
        title: 'Session Expiring Soon',
        description: 'Your session will expire in less than 5 minutes. Consider refreshing.',
        status: 'warning',
        duration: 10000,
        isClosable: true,
      })
    }
  }, [isSessionExpiringSoon, session, toast])

  const handleRefreshSession = async () => {
    try {
      await refreshSession()
      toast({
        title: 'Session Refreshed',
        description: 'Your session has been extended successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    } catch (error) {
      toast({
        title: 'Refresh Failed',
        description: 'Failed to refresh session. Please sign in again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
  }

  if (!user || !session) return null

  const isExpiringSoon = isSessionExpiringSoon()

  return (
    <Box
      position="fixed"
      bottom={4}
      right={4}
      bg={bgColor}
      border="1px solid"
      borderColor={borderColor}
      borderRadius="lg"
      p={3}
      boxShadow="md"
      zIndex={1000}
      maxW="300px"
    >
      <VStack spacing={2} align="start">
        <HStack spacing={2}>
          <Icon as={FaUser} color="blue.500" boxSize={4} />
          <Text fontSize="sm" fontWeight="medium" color={textColor}>
            {user.email}
          </Text>
        </HStack>
        
        <HStack spacing={2}>
          <Icon as={FaClock} color={mutedColor} boxSize={3} />
          <Text fontSize="xs" color={mutedColor}>
            Session expires in: {timeLeft}
          </Text>
        </HStack>

        {isExpiringSoon && (
          <HStack spacing={2}>
            <Icon as={FaExclamationTriangle} color="orange.500" boxSize={3} />
            <Badge colorScheme="orange" size="sm">
              Expiring Soon
            </Badge>
          </HStack>
        )}

        <Button
          size="xs"
          colorScheme="blue"
          variant="outline"
          onClick={handleRefreshSession}
          isLoading={false}
        >
          Refresh Session
        </Button>
      </VStack>
    </Box>
  )
}

export default SessionStatus
