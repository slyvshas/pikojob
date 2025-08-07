import React, { useEffect, useRef, useState } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import {
  Box,
  Button,
  IconButton,
  HStack,
  Tooltip,
  Input,
  useBreakpointValue,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  VStack,
  Text,
} from '@chakra-ui/react';
import { FaBold, FaItalic, FaUnderline, FaListUl, FaListOl, FaHeading, FaImage, FaLink, FaUnlink } from 'react-icons/fa';

const MenuBar = ({ editor, onImageUpload }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [linkUrl, setLinkUrl] = useState('');
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);

  if (!editor) return null;

  const setLink = () => {
    if (linkUrl) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run();
      setLinkUrl('');
      setIsLinkModalOpen(false);
    }
  };

  const removeLink = () => {
    editor.chain().focus().extendMarkRange('link').unsetLink().run();
  };

  const openLinkModal = () => {
    if (editor.isActive('link')) {
      setLinkUrl(editor.getAttributes('link').href || '');
    } else {
      setLinkUrl('');
    }
    setIsLinkModalOpen(true);
  };

  return (
    <>
      <HStack spacing={1} mb={2} flexWrap="wrap">
        <Tooltip label="Heading">
          <IconButton
            icon={<FaHeading />}
            size="sm"
            aria-label="Heading"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            isActive={editor.isActive('heading', { level: 2 })}
          />
        </Tooltip>
        <Tooltip label="Bold">
          <IconButton
            icon={<FaBold />}
            size="sm"
            aria-label="Bold"
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive('bold')}
          />
        </Tooltip>
        <Tooltip label="Italic">
          <IconButton
            icon={<FaItalic />}
            size="sm"
            aria-label="Italic"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive('italic')}
          />
        </Tooltip>
        <Tooltip label="Underline">
          <IconButton
            icon={<FaUnderline />}
            size="sm"
            aria-label="Underline"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            isActive={editor.isActive('underline')}
          />
        </Tooltip>
        <Tooltip label="Link">
          <IconButton
            icon={<FaLink />}
            size="sm"
            aria-label="Add Link"
            onClick={openLinkModal}
            isActive={editor.isActive('link')}
          />
        </Tooltip>
        <Tooltip label="Remove Link">
          <IconButton
            icon={<FaUnlink />}
            size="sm"
            aria-label="Remove Link"
            onClick={removeLink}
            isDisabled={!editor.isActive('link')}
          />
        </Tooltip>
        <Tooltip label="Bullet List">
          <IconButton
            icon={<FaListUl />}
            size="sm"
            aria-label="Bullet List"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive('bulletList')}
          />
        </Tooltip>
        <Tooltip label="Numbered List">
          <IconButton
            icon={<FaListOl />}
            size="sm"
            aria-label="Numbered List"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive('orderedList')}
          />
        </Tooltip>
        <Tooltip label="Insert Image">
          <Button
            leftIcon={<FaImage />}
            size="sm"
            variant="ghost"
            as="label"
            cursor="pointer"
          >
            <Input
              type="file"
              accept="image/*"
              display="none"
              onChange={onImageUpload}
            />
            Image
          </Button>
        </Tooltip>
      </HStack>

      {/* Link Modal */}
      <Modal isOpen={isLinkModalOpen} onClose={() => setIsLinkModalOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add Link</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <Text fontSize="sm" color="gray.600">
                {editor.isActive('link') ? 'Edit link URL:' : 'Enter URL for the selected text:'}
              </Text>
              <Input
                placeholder="https://example.com"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    setLink();
                  }
                }}
                autoFocus
              />
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={() => setIsLinkModalOpen(false)}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={setLink}>
              {editor.isActive('link') ? 'Update Link' : 'Add Link'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

const MediumEditor = ({ value, onChange }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Image,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'link',
          style: 'text-decoration: none; color: inherit;',
        },
      }),
    ],
    content: value || '',
    editorProps: {
      attributes: {
        class: 'tiptap-editor-content',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Image upload handler
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    // Local preview
    const reader = new FileReader();
    reader.onload = () => {
      editor.chain().focus().setImage({ src: reader.result }).run();
    };
    reader.readAsDataURL(file);
  };

  // Responsive minHeight
  const minHeight = useBreakpointValue({ base: '200px', md: '300px' });

  return (
    <Box
      bg="white"
      borderRadius="lg"
      boxShadow="md"
      p={{ base: 2, md: 4 }}
      w="100%"
      maxW="100%"
      minH={minHeight}
      border="1px solid #e2e8f0"
    >
      <MenuBar editor={editor} onImageUpload={handleImageUpload} />
      <Box
        className="tiptap-editor-content"
        minH={minHeight}
        px={2}
        py={2}
        sx={{
          outline: 'none',
          background: 'white',
          '& .link': {
            textDecoration: 'none !important',
            color: 'inherit !important',
          },
          '& a': {
            textDecoration: 'none !important',
            color: 'inherit !important',
          },
          '& .ProseMirror a': {
            textDecoration: 'none !important',
            color: 'inherit !important',
          }
        }}
      >
        <EditorContent
          editor={editor}
          placeholder="Start writing your article…"
        />
      </Box>
    </Box>
  );
};

export default MediumEditor; 