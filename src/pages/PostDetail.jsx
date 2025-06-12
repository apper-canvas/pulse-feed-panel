import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import PostCard from '../components/PostCard';
import CommentSection from '../components/CommentSection';
import SkeletonLoader from '../components/SkeletonLoader';
import ErrorState from '../components/ErrorState';
import ApperIcon from '../components/ApperIcon';
import { postService, commentService } from '../services';
import { toast } from 'react-toastify';

const PostDetail = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadPostData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [postData, commentsData] = await Promise.all([
        postService.getById(postId),
        commentService.getByPostId(postId)
      ]);
      
      setPost(postData);
      setComments(commentsData);
    } catch (err) {
      setError(err.message || 'Failed to load post');
      toast.error('Failed to load post');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (postId) {
      loadPostData();
    }
  }, [postId]);

  const handlePostUpdate = (updatedPost) => {
    setPost(updatedPost);
  };

  const handlePostDelete = () => {
    navigate('/');
    toast.success('Post deleted successfully');
  };

  const handleCommentAdd = (newComment) => {
    setComments(prev => [newComment, ...prev]);
    setPost(prev => prev ? { ...prev, comments: prev.comments + 1 } : null);
  };

  const handleCommentUpdate = (updatedComment) => {
    setComments(prev => prev.map(comment => 
      comment.id === updatedComment.id ? updatedComment : comment
    ));
  };

  const handleCommentDelete = (deletedCommentId) => {
    setComments(prev => prev.filter(comment => comment.id !== deletedCommentId));
    setPost(prev => prev ? { ...prev, comments: Math.max(0, prev.comments - 1) } : null);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-6">
          {/* Back Button Skeleton */}
          <div className="animate-pulse">
            <div className="h-10 bg-gray-200 rounded w-20"></div>
          </div>
          
          {/* Post Skeleton */}
          <SkeletonLoader count={1} />
          
          {/* Comments Skeleton */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-gray-200 rounded w-1/3"></div>
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex space-x-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <ErrorState 
          message={error}
          onRetry={loadPostData}
        />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <ErrorState 
          message="Post not found"
          onRetry={() => navigate('/')}
          retryLabel="Go Home"
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="space-y-6">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-gray-600 hover:text-primary transition-colors"
        >
          <ApperIcon name="ArrowLeft" className="w-4 h-4" />
          <span className="font-medium">Back</span>
        </motion.button>

        {/* Post Detail */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <PostCard 
            post={post} 
            onUpdate={handlePostUpdate}
            onDelete={handlePostDelete}
            isDetailView={true}
          />
        </motion.div>

        {/* Comments Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <CommentSection 
            postId={postId}
            comments={comments}
            onCommentAdd={handleCommentAdd}
            onCommentUpdate={handleCommentUpdate}
            onCommentDelete={handleCommentDelete}
          />
        </motion.div>
      </div>
    </div>
  );
};

export default PostDetail;