import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ApperIcon from './ApperIcon';
import { postService } from '../services';
import { toast } from 'react-toastify';

const EditPostModal = ({ isOpen, onClose, post, onSave }) => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const maxChars = 500;

  useEffect(() => {
    if (isOpen && post) {
      setContent(post.content);
      setCharCount(post.content.length);
    }
  }, [isOpen, post]);

  useEffect(() => {
    setCharCount(content.length);
  }, [content]);

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
      const updatedPost = await postService.update(post.id, {
        ...post,
        content: content.trim()
      });
      
      toast.success('Post updated successfully!');
      onSave(updatedPost);
    } catch (error) {
      toast.error('Failed to update post. Please try again.');
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
    const textarea = document.getElementById('edit-post-content');
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

  if (!isOpen || !post) return null;

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
              Edit Post
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
                src={post.authorAvatar}
                alt={post.authorName}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-100"
              />
              <div>
                <p className="font-semibold text-gray-900">{post.authorName}</p>
                <p className="text-sm text-gray-500">Editing post</p>
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
                id="edit-post-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Edit your post content..."
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
              <p>💡 Formatting:</p>
              <p className="mt-1 ml-4">Use **bold** and *italic* for emphasis</p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3">
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
                disabled={loading || !content.trim() || content.length > maxChars || content === post.content}
                className="px-6 py-2 gradient-primary text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Saving...</span>
                  </div>
                ) : (
                  'Save Changes'
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default EditPostModal;