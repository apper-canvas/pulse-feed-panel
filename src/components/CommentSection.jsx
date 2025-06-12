import { useState } from 'react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import ApperIcon from './ApperIcon';
import { commentService } from '../services';
import { toast } from 'react-toastify';

const CommentSection = ({ postId, comments, onCommentAdd, onCommentUpdate, onCommentDelete }) => {
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    
    if (!newComment.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    setLoading(true);
    
    try {
      const comment = await commentService.create({
        postId,
        content: newComment.trim(),
        authorId: 'user1',
        authorName: 'You',
        parentId: null
      });
      
      onCommentAdd(comment);
      setNewComment('');
      toast.success('Comment added successfully!');
    } catch (error) {
      toast.error('Failed to add comment');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReply = async (e, parentId) => {
    e.preventDefault();
    
    if (!replyContent.trim()) {
      toast.error('Please enter a reply');
      return;
    }

    setLoading(true);
    
    try {
      const reply = await commentService.create({
        postId,
        content: replyContent.trim(),
        authorId: 'user1',
        authorName: 'You',
        parentId
      });
      
      onCommentAdd(reply);
      setReplyContent('');
      setReplyingTo(null);
      toast.success('Reply added successfully!');
    } catch (error) {
      toast.error('Failed to add reply');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      try {
        await commentService.delete(commentId);
        onCommentDelete(commentId);
      } catch (error) {
        toast.error('Failed to delete comment');
      }
    }
  };

  // Organize comments into parent-child structure
  const parentComments = comments.filter(comment => !comment.parentId);
  const getReplies = (parentId) => comments.filter(comment => comment.parentId === parentId);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">
        Comments ({comments.length})
      </h3>

      {/* Add Comment Form */}
      <form onSubmit={handleSubmitComment} className="mb-8">
        <div className="flex space-x-3">
          <img
            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
            alt="Your avatar"
            className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-100 flex-shrink-0"
          />
          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary resize-none transition-all duration-200 placeholder-gray-500"
              rows={3}
            />
            <div className="flex justify-end mt-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={loading || !newComment.trim()}
                className="px-4 py-2 gradient-primary text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {loading ? 'Posting...' : 'Post Comment'}
              </motion.button>
            </div>
          </div>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-6">
        {parentComments.length === 0 ? (
          <div className="text-center py-8">
            <ApperIcon name="MessageCircle" className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No comments yet. Be the first to comment!</p>
          </div>
        ) : (
          parentComments.map((comment, index) => {
            const replies = getReplies(comment.id);
            
            return (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="space-y-4"
              >
                {/* Parent Comment */}
                <div className="flex space-x-3">
                  <img
                    src={comment.authorAvatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'}
                    alt={comment.authorName}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-100 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">{comment.authorName}</h4>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-500">
                            {formatDistanceToNow(new Date(comment.timestamp), { addSuffix: true })}
                          </span>
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="p-1 text-gray-400 hover:text-red-500 rounded transition-colors"
                          >
                            <ApperIcon name="Trash2" className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <p className="text-gray-800 whitespace-pre-wrap break-words">{comment.content}</p>
                    </div>
                    
                    {/* Comment Actions */}
                    <div className="flex items-center space-x-4 mt-2 ml-4">
                      <button
                        onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                        className="text-sm text-gray-500 hover:text-primary font-medium transition-colors"
                      >
                        <ApperIcon name="Reply" className="w-4 h-4 inline mr-1" />
                        Reply
                      </button>
                      <span className="text-sm text-gray-400">
                        {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
                      </span>
                    </div>

                    {/* Reply Form */}
                    {replyingTo === comment.id && (
                      <motion.form
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        onSubmit={(e) => handleSubmitReply(e, comment.id)}
                        className="mt-4 ml-4"
                      >
                        <div className="flex space-x-3">
                          <img
                            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
                            alt="Your avatar"
                            className="w-8 h-8 rounded-full object-cover ring-2 ring-gray-100 flex-shrink-0"
                          />
                          <div className="flex-1">
                            <textarea
                              value={replyContent}
                              onChange={(e) => setReplyContent(e.target.value)}
                              placeholder={`Reply to ${comment.authorName}...`}
                              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary resize-none transition-all duration-200 placeholder-gray-500"
                              rows={2}
                              autoFocus
                            />
                            <div className="flex justify-end space-x-2 mt-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setReplyingTo(null);
                                  setReplyContent('');
                                }}
                                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                              >
                                Cancel
                              </button>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                type="submit"
                                disabled={loading || !replyContent.trim()}
                                className="px-3 py-1 text-sm gradient-primary text-white rounded font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                              >
                                {loading ? 'Replying...' : 'Reply'}
                              </motion.button>
                            </div>
                          </div>
                        </div>
                      </motion.form>
                    )}
                  </div>
                </div>

                {/* Replies */}
                {replies.length > 0 && (
                  <div className="ml-12 space-y-3">
                    {replies.map((reply) => (
                      <motion.div
                        key={reply.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex space-x-3"
                      >
                        <img
                          src={reply.authorAvatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'}
                          alt={reply.authorName}
                          className="w-8 h-8 rounded-full object-cover ring-2 ring-gray-100 flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="bg-gray-50 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-1">
                              <h5 className="font-semibold text-gray-900 text-sm">{reply.authorName}</h5>
                              <div className="flex items-center space-x-2">
                                <span className="text-xs text-gray-500">
                                  {formatDistanceToNow(new Date(reply.timestamp), { addSuffix: true })}
                                </span>
                                <button
                                  onClick={() => handleDeleteComment(reply.id)}
                                  className="p-1 text-gray-400 hover:text-red-500 rounded transition-colors"
                                >
                                  <ApperIcon name="Trash2" className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                            <p className="text-gray-800 text-sm whitespace-pre-wrap break-words">{reply.content}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default CommentSection;