import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ApperIcon from './ApperIcon';
import { postService } from '../services';
import { toast } from 'react-toastify';

const CreatePostModal = ({ isOpen, onClose }) => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const maxChars = 500;

  useEffect(() => {
    setCharCount(content.length);
  }, [content]);

  useEffect(() => {
    if (isOpen) {
      setContent('');
      setCharCount(0);
    }
  }, [isOpen]);

  // Listen for custom event to open modal
  useEffect(() => {
    const handleOpenModal = () => {
      if (!isOpen) {
        // Trigger parent to open modal
        document.querySelector('[data-create-button]')?.click();
      }
    };

    window.addEventListener('openCreateModal', handleOpenModal);
    return () => window.removeEventListener('openCreateModal', handleOpenModal);
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim()) {
      toast.error('Please enter some content for your post');
      return;
    }

    if (content.length > maxChars) {
      toast.error(`Post is too long. Maximum ${maxChars} characters allowed.`);
      return;
    }

    setLoading(true);
    
    try {
      const newPost = await postService.create({
        content: content.trim(),
        authorId: 'user1', // Current user ID
        authorName: 'You',
        authorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
      });
      
      toast.success('Post created successfully!');
      onClose();
      setContent('');
      
      // Refresh the page to show new post
      window.location.reload();
    } catch (error) {
      toast.error('Failed to create post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
    
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSubmit(e);
    }
  };

  const insertFormatting = (type) => {
    const textarea = document.getElementById('post-content');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    
    let newText = '';
    let cursorPos = start;
    
    switch (type) {
      case 'bold':
        newText = content.substring(0, start) + `**${selectedText}**` + content.substring(end);
        cursorPos = start + 2 + selectedText.length + 2;
        break;
      case 'italic':
        newText = content.substring(0, start) + `*${selectedText}*` + content.substring(end);
        cursorPos = start + 1 + selectedText.length + 1;
        break;
      default:
        return;
    }
    
    setContent(newText);
    
    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(cursorPos, cursorPos);
    }, 0);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[80vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
          onKeyDown={handleKeyDown}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold font-display text-gray-900">
              Create Post
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ApperIcon name="X" className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6">
            {/* User Info */}
            <div className="flex items-center space-x-3 mb-4">
              <img
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
                alt="Your avatar"
                className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-100"
              />
              <div>
                <p className="font-semibold text-gray-900">You</p>
                <p className="text-sm text-gray-500">Posting publicly</p>
              </div>
            </div>

            {/* Formatting Toolbar */}
            <div className="flex items-center space-x-2 mb-4 p-2 bg-gray-50 rounded-lg">
              <button
                type="button"
                onClick={() => insertFormatting('bold')}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded transition-colors"
                title="Bold (Ctrl+B)"
              >
                <ApperIcon name="Bold" className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('italic')}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded transition-colors"
                title="Italic (Ctrl+I)"
              >
                <ApperIcon name="Italic" className="w-4 h-4" />
              </button>
              <div className="flex-1"></div>
              <span className="text-sm text-gray-500">
                **bold** *italic*
              </span>
            </div>

            {/* Content Textarea */}
            <div className="relative mb-4">
              <textarea
                id="post-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What's on your mind? Share your thoughts with the community..."
                className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary resize-none transition-all duration-200 placeholder-gray-500"
                maxLength={maxChars}
                autoFocus
              />
              
              {/* Character Count */}
              <div className="absolute bottom-2 right-2 text-sm text-gray-400">
                <span className={charCount > maxChars * 0.9 ? 'text-warning' : ''}>
                  {charCount}
                </span>
                <span>/{maxChars}</span>
              </div>
            </div>

            {/* Help Text */}
            <div className="text-sm text-gray-500 mb-6">
              <p>💡 Tips:</p>
              <ul className="mt-1 space-y-1 ml-4">
                <li>• Use **bold** and *italic* formatting</li>
                <li>• Press Ctrl+Enter to post quickly</li>
                <li>• Keep it authentic and engaging</li>
              </ul>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <ApperIcon name="Globe" className="w-4 h-4" />
                  <span>Public</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={loading || !content.trim() || content.length > maxChars}
                  className="px-6 py-2 gradient-primary text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Posting...</span>
                    </div>
                  ) : (
                    'Post'
                  )}
                </motion.button>
              </div>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CreatePostModal;