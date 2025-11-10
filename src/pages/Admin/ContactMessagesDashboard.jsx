import { useState, useEffect } from 'react'
import {
  Box,
  Container,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Button,
  useToast,
  Spinner,
  Center,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  useDisclosure,
  VStack,
  HStack,
  Select,
  IconButton,
  Tooltip,
  useColorModeValue
} from '@chakra-ui/react'
import { supabase } from '../../lib/supabase'
import { FaEye, FaTrash, FaEnvelope } from 'react-icons/fa'

const ContactMessagesDashboard = () => {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedMessage, setSelectedMessage] = useState(null)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const toast = useToast()
  const bgColor = useColorModeValue('gray.50', 'gray.900')
  const cardBg = useColorModeValue('white', 'gray.800')

  useEffect(() => {
    fetchMessages()
  }, [])

  const fetchMessages = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setMessages(data || [])
    } catch (error) {
      console.error('Error fetching messages:', error)
      toast({
        title: 'Error loading messages',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleViewMessage = async (message) => {
    setSelectedMessage(message)
    onOpen()

    // Mark as read if it's unread
    if (message.status === 'unread') {
      try {
        const { error } = await supabase
          .from('contact_messages')
          .update({ status: 'read' })
          .eq('id', message.id)

        if (error) throw error

        // Update local state
        setMessages(messages.map(m => 
          m.id === message.id ? { ...m, status: 'read' } : m
        ))
      } catch (error) {
        console.error('Error updating message status:', error)
      }
    }
  }

  const handleStatusChange = async (messageId, newStatus) => {
    try {
      const { error } = await supabase
        .from('contact_messages')
        .update({ status: newStatus })
        .eq('id', messageId)

      if (error) throw error

      setMessages(messages.map(m => 
        m.id === messageId ? { ...m, status: newStatus } : m
      ))

      toast({
        title: 'Status updated',
        status: 'success',
        duration: 2000,
        isClosable: true,
      })
    } catch (error) {
      console.error('Error updating status:', error)
      toast({
        title: 'Error updating status',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
  }

  const handleDeleteMessage = async (messageId) => {
    if (!confirm('Are you sure you want to delete this message?')) return

    try {
      const { error } = await supabase
        .from('contact_messages')
        .delete()
        .eq('id', messageId)

      if (error) throw error

      setMessages(messages.filter(m => m.id !== messageId))
      if (selectedMessage?.id === messageId) {
        onClose()
      }

      toast({
        title: 'Message deleted',
        status: 'success',
        duration: 2000,
        isClosable: true,
      })
    } catch (error) {
      console.error('Error deleting message:', error)
      toast({
        title: 'Error deleting message',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'unread':
        return 'red'
      case 'read':
        return 'blue'
      case 'replied':
        return 'green'
      case 'archived':
        return 'gray'
      default:
        return 'gray'
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <Center minH="calc(100vh - 200px)">
        <Spinner size="xl" color="blue.500" />
      </Center>
    )
  }

  return (
    <Box bg={bgColor} minH="calc(100vh - 64px)" py={8}>
      <Container maxW="container.xl">
        <VStack spacing={6} align="stretch">
          <HStack justify="space-between" align="center">
            <Heading size="xl" color="blue.500">
              Contact Messages
            </Heading>
            <Button onClick={fetchMessages} colorScheme="blue" size="sm">
              Refresh
            </Button>
          </HStack>

          {messages.length === 0 ? (
            <Box bg={cardBg} p={12} rounded="lg" shadow="md" textAlign="center">
              <Text fontSize="lg" color="gray.500">
                No messages yet. Messages will appear here when users submit the contact form.
              </Text>
            </Box>
          ) : (
            <Box bg={cardBg} rounded="lg" shadow="md" overflowX="auto">
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Status</Th>
                    <Th>Name</Th>
                    <Th>Email</Th>
                    <Th>Subject</Th>
                    <Th>Date</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {messages.map((message) => (
                    <Tr key={message.id} _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}>
                      <Td>
                        <Select
                          size="sm"
                          value={message.status}
                          onChange={(e) => handleStatusChange(message.id, e.target.value)}
                          w="120px"
                        >
                          <option value="unread">Unread</option>
                          <option value="read">Read</option>
                          <option value="replied">Replied</option>
                          <option value="archived">Archived</option>
                        </Select>
                      </Td>
                      <Td fontWeight={message.status === 'unread' ? 'bold' : 'normal'}>
                        {message.name}
                      </Td>
                      <Td>
                        <a href={`mailto:${message.email}`} style={{ color: 'blue' }}>
                          {message.email}
                        </a>
                      </Td>
                      <Td maxW="300px" isTruncated>
                        {message.subject}
                      </Td>
                      <Td fontSize="sm" color="gray.500">
                        {formatDate(message.created_at)}
                      </Td>
                      <Td>
                        <HStack spacing={2}>
                          <Tooltip label="View message">
                            <IconButton
                              size="sm"
                              icon={<FaEye />}
                              colorScheme="blue"
                              variant="ghost"
                              onClick={() => handleViewMessage(message)}
                            />
                          </Tooltip>
                          <Tooltip label="Reply via email">
                            <IconButton
                              size="sm"
                              icon={<FaEnvelope />}
                              colorScheme="green"
                              variant="ghost"
                              as="a"
                              href={`mailto:${message.email}?subject=Re: ${message.subject}`}
                            />
                          </Tooltip>
                          <Tooltip label="Delete message">
                            <IconButton
                              size="sm"
                              icon={<FaTrash />}
                              colorScheme="red"
                              variant="ghost"
                              onClick={() => handleDeleteMessage(message.id)}
                            />
                          </Tooltip>
                        </HStack>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          )}
        </VStack>

        {/* Message Detail Modal */}
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              <VStack align="start" spacing={2}>
                <Text>{selectedMessage?.subject}</Text>
                <HStack>
                  <Badge colorScheme={getStatusColor(selectedMessage?.status)}>
                    {selectedMessage?.status}
                  </Badge>
                  <Text fontSize="sm" color="gray.500">
                    {selectedMessage && formatDate(selectedMessage.created_at)}
                  </Text>
                </HStack>
              </VStack>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack align="stretch" spacing={4}>
                <Box>
                  <Text fontWeight="bold" fontSize="sm" color="gray.500">
                    From:
                  </Text>
                  <Text>{selectedMessage?.name}</Text>
                  <Text color="blue.500">
                    <a href={`mailto:${selectedMessage?.email}`}>
                      {selectedMessage?.email}
                    </a>
                  </Text>
                </Box>
                <Box>
                  <Text fontWeight="bold" fontSize="sm" color="gray.500" mb={2}>
                    Message:
                  </Text>
                  <Box
                    p={4}
                    bg={useColorModeValue('gray.50', 'gray.700')}
                    rounded="md"
                    whiteSpace="pre-wrap"
                  >
                    {selectedMessage?.message}
                  </Box>
                </Box>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <HStack spacing={3}>
                <Button
                  colorScheme="green"
                  leftIcon={<FaEnvelope />}
                  as="a"
                  href={`mailto:${selectedMessage?.email}?subject=Re: ${selectedMessage?.subject}`}
                  onClick={() => {
                    handleStatusChange(selectedMessage.id, 'replied')
                  }}
                >
                  Reply via Email
                </Button>
                <Button variant="ghost" onClick={onClose}>
                  Close
                </Button>
              </HStack>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Container>
    </Box>
  )
}

export default ContactMessagesDashboard
