import React, { useEffect, useRef } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Image from '@tiptap/extension-image';
import {
  Box,
  Button,
  IconButton,
  HStack,
  Tooltip,
  Input,
  useBreakpointValue,
} from '@chakra-ui/react';
import { FaBold, FaItalic, FaUnderline, FaListUl, FaListOl, FaHeading, FaImage } from 'react-icons/fa';

const MenuBar = ({ editor, onImageUpload }) => {
  if (!editor) return null;
  return (
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
  );
};

const MediumEditor = ({ value, onChange }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Image,
    ],
    content: value || '',
    editorProps: {
      attributes: {
        class:
          'tiptap-editor-content',
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
        style={{ outline: 'none', background: 'white' }}
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