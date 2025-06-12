import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import ApperIcon from './ApperIcon';
import EditPostModal from './EditPostModal';
import { postService } from '../services';
import { toast } from 'react-toastify';

const PostCard = ({ 
  post, 
  onUpdate, 
  onDelete, 
  showProfileLink = true, 
  isDetailView = false,
  highlightQuery 
}) => {
  const navigate = useNavigate();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
const [liked, setLiked] = useState(post.isLiked || false);
  const [likeCount, setLikeCount] = useState(post.likes || 0);
  const [selectedReaction, setSelectedReaction] = useState(null);
  const [imageLoading, setImageLoading] = useState({});
  const reactions = [
    { emoji: '❤️', name: 'love', color: '#EF4444' },
    { emoji: '👍', name: 'like', color: '#3B82F6' },
    { emoji: '😂', name: 'laugh', color: '#F59E0B' },
    { emoji: '😮', name: 'wow', color: '#8B5CF6' },
    { emoji: '😢', name: 'sad', color: '#6B7280' }
  ];

  const handleLike = async () => {
try {
      const newLiked = !liked;
      const newCount = newLiked ? likeCount + 1 : Math.max(0, likeCount - 1);
      
      // Optimistic update
      setLiked(newLiked);
      setLikeCount(newCount);

      const updatedPost = await postService.toggleLike(post.id, newLiked);
      
      if (onUpdate) onUpdate(updatedPost);
      
      toast.success(newLiked ? 'Post liked!' : 'Post unliked');
    } catch (error) {
      // Revert optimistic update
      setLiked(!liked);
      setLikeCount(likeCount);
      toast.error('Failed to update like');
    }
  };

  const handleImageLoad = (imageIndex) => {
    setImageLoading(prev => ({ ...prev, [imageIndex]: false }));
  };

  const handleImageError = (imageIndex) => {
    setImageLoading(prev => ({ ...prev, [imageIndex]: false }));
  };

  const handleReaction = async (reaction) => {
    try {
      setSelectedReaction(reaction);
      
      const updatedPost = await postService.update(post.id, {
        ...post,
        reactions: {
          ...post.reactions,
          [reaction.name]: (post.reactions?.[reaction.name] || 0) + 1
        }
      });
      
      if (onUpdate) onUpdate(updatedPost);
      toast.success(`Reacted with ${reaction.emoji}`);
    } catch (error) {
      setSelectedReaction(null);
      toast.error('Failed to add reaction');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await postService.delete(post.id);
        if (onDelete) onDelete(post.id);
      } catch (error) {
        toast.error('Failed to delete post');
      }
    }
    setShowMenu(false);
  };

  const handleEdit = () => {
    setShowEditModal(true);
    setShowMenu(false);
  };

  const handleEditSave = (updatedPost) => {
    if (onUpdate) onUpdate(updatedPost);
    setShowEditModal(false);
  };

  const highlightText = (text, query) => {
    if (!query || !highlightQuery) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 px-1 rounded">
          {part}
        </mark>
      ) : part
    );
  };

  const formatContent = (content) => {
    // Simple text formatting
    let formatted = content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">$1</a>');
    
    return { __html: formatted };
  };

  return (
    <motion.div
      layout
      whileHover={{ y: -2 }}
      className="bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 overflow-hidden"
    >
      <div className="p-6">
        {/* Post Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-3">
            {showProfileLink ? (
              <Link to={`/profile/${post.authorId}`} className="flex-shrink-0">
                <img
                  src={post.authorAvatar}
                  alt={post.authorName}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-100 hover:ring-primary/20 transition-all duration-200"
                />
              </Link>
            ) : (
              <img
                src={post.authorAvatar}
                alt={post.authorName}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-100"
              />
            )}
            
            <div className="min-w-0 flex-1">
              {showProfileLink ? (
                <Link
                  to={`/profile/${post.authorId}`}
                  className="font-semibold text-gray-900 hover:text-primary transition-colors"
                >
                  {post.authorName}
                </Link>
              ) : (
                <span className="font-semibold text-gray-900">{post.authorName}</span>
              )}
              <p className="text-sm text-gray-500">
                {formatDistanceToNow(new Date(post.timestamp), { addSuffix: true })}
              </p>
            </div>
          </div>

          {/* Menu Button (placeholder for own posts) */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
            >
              <ApperIcon name="MoreHorizontal" className="w-5 h-5" />
            </button>

            <AnimatePresence>
              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute right-0 top-8 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20"
                >
                  <button
                    onClick={handleEdit}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                  >
                    <ApperIcon name="Edit" className="w-4 h-4" />
                    <span>Edit post</span>
                  </button>
                  <button
                    onClick={handleDelete}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                  >
                    <ApperIcon name="Trash2" className="w-4 h-4" />
                    <span>Delete post</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Post Content */}
<div className="mb-4">
          <div 
            className="text-gray-900 whitespace-pre-wrap break-words"
            dangerouslySetInnerHTML={formatContent(
              highlightQuery ? highlightText(post.content, highlightQuery) : post.content
            )}
          />
        </div>

        {/* Images */}
        {post.images && post.images.length > 0 && (
          <div className="mb-4">
            <div className={`grid gap-2 rounded-lg overflow-hidden ${
              post.images.length === 1 ? 'grid-cols-1' : 
              post.images.length === 2 ? 'grid-cols-2' :
              post.images.length === 3 ? 'grid-cols-3' :
              'grid-cols-2'
            }`}>
              {post.images.slice(0, 4).map((image, index) => (
                <div 
                  key={index} 
                  className={`relative ${
                    post.images.length === 3 && index === 0 ? 'col-span-2' :
                    post.images.length > 4 && index === 3 ? 'relative' : ''
                  }`}
                >
                  {imageLoading[index] !== false && (
                    <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-lg"></div>
                  )}
                  <img
                    src={image}
                    alt={`Post image ${index + 1}`}
                    className="w-full h-48 object-cover rounded-lg transition-transform duration-200 hover:scale-105 cursor-pointer"
                    onLoad={() => handleImageLoad(index)}
                    onError={() => handleImageError(index)}
                    loading="lazy"
                  />
                  {post.images.length > 4 && index === 3 && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                      <span className="text-white text-xl font-semibold">
                        +{post.images.length - 4}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reactions Bar */}
        {post.reactions && Object.keys(post.reactions).length > 0 && (
          <div className="flex items-center space-x-2 mb-4 pb-4 border-b border-gray-100">
            {Object.entries(post.reactions).map(([reactionType, count]) => {
              const reaction = reactions.find(r => r.name === reactionType);
              if (!reaction || count === 0) return null;
              
              return (
                <div
                  key={reactionType}
                  className="flex items-center space-x-1 px-2 py-1 bg-gray-50 rounded-full text-sm"
                >
                  <span>{reaction.emoji}</span>
                  <span className="text-gray-600">{count}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Action Buttons */}
<div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            {/* Like Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLike}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                liked 
                  ? 'text-red-500 bg-red-50 hover:bg-red-100' 
                  : 'text-gray-500 hover:text-red-500 hover:bg-red-50'
              }`}
            >
              <motion.div
                animate={{ scale: liked ? [1, 1.3, 1] : 1 }}
                transition={{ duration: 0.3 }}
              >
                <ApperIcon 
                  name="Heart" 
                  className={`w-5 h-5 ${liked ? 'fill-current text-red-500' : ''}`}
                />
              </motion.div>
              <span className="text-sm font-medium">{likeCount}</span>
            </motion.button>

            {/* Comment Button */}
            {!isDetailView ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(`/post/${post.id}`)}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-500 hover:text-primary hover:bg-primary/5 transition-all duration-200"
              >
                <ApperIcon name="MessageCircle" className="w-5 h-5" />
                <span className="text-sm font-medium">{post.comments || 0}</span>
              </motion.button>
            ) : (
              <div className="flex items-center space-x-2 px-3 py-2 text-gray-500">
                <ApperIcon name="MessageCircle" className="w-5 h-5" />
                <span className="text-sm font-medium">{post.comments || 0}</span>
              </div>
            )}

            {/* Share Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-500 hover:text-primary hover:bg-primary/5 transition-all duration-200"
            >
              <ApperIcon name="Share" className="w-5 h-5" />
              <span className="text-sm font-medium">Share</span>
            </motion.button>
          </div>

          {/* Reaction Buttons */}
          <div className="flex items-center space-x-1">
            {reactions.map((reaction) => (
              <motion.button
                key={reaction.name}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleReaction(reaction)}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-all duration-200"
                title={`React with ${reaction.name}`}
              >
                <span className="text-lg">{reaction.emoji}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <EditPostModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        post={post}
        onSave={handleEditSave}
      />
    </motion.div>
  );
};

export default PostCard;