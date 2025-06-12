import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import PostCard from '../components/PostCard';
import SkeletonLoader from '../components/SkeletonLoader';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import ApperIcon from '../components/ApperIcon';
import { userService, postService } from '../services';
import { toast } from 'react-toastify';

const Profile = () => {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('posts');

  const loadUserData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [userData, userPosts] = await Promise.all([
        userService.getById(userId),
        postService.getByAuthor(userId)
      ]);
      
      setUser(userData);
      setPosts(userPosts);
    } catch (err) {
      setError(err.message || 'Failed to load profile');
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      loadUserData();
    }
  }, [userId]);

  const handlePostUpdate = (updatedPost) => {
    setPosts(prev => prev.map(post => 
      post.id === updatedPost.id ? updatedPost : post
    ));
  };

  const handlePostDelete = (deletedPostId) => {
    setPosts(prev => prev.filter(post => post.id !== deletedPostId));
    setUser(prev => prev ? { ...prev, postCount: prev.postCount - 1 } : null);
    toast.success('Post deleted successfully');
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-6">
          {/* Profile Header Skeleton */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="animate-pulse">
              <div className="flex items-start space-x-4">
                <div className="w-20 h-20 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-3">
                  <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="flex space-x-6">
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Posts Skeleton */}
          <SkeletonLoader count={3} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <ErrorState 
          message={error}
          onRetry={loadUserData}
        />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <EmptyState 
          title="User not found"
          description="The profile you're looking for doesn't exist."
          actionLabel="Go Home"
          onAction={() => window.location.href = '/'}
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="space-y-6">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm p-6"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
            {/* Avatar */}
            <div className="relative">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-20 h-20 rounded-full object-cover ring-4 ring-primary/10"
              />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-success rounded-full border-2 border-white flex items-center justify-center">
                <ApperIcon name="Check" className="w-3 h-3 text-white" />
              </div>
            </div>

            {/* User Info */}
            <div className="flex-1">
              <h1 className="text-2xl font-bold font-display text-gray-900 mb-2">
                {user.name}
              </h1>
              
              {user.bio && (
                <p className="text-gray-600 mb-4 break-words">{user.bio}</p>
              )}
              
              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <ApperIcon name="FileText" className="w-4 h-4" />
                  <span className="font-medium">{user.postCount}</span>
                  <span>posts</span>
                </div>
                
                <div className="flex items-center space-x-1">
                  <ApperIcon name="Calendar" className="w-4 h-4" />
                  <span>Joined {formatDistanceToNow(new Date(user.joinDate), { addSuffix: true })}</span>
                </div>
              </div>
            </div>

            {/* Follow Button (placeholder for future feature) */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-2 border border-primary text-primary rounded-lg font-medium hover:bg-primary hover:text-white transition-all duration-200"
            >
              Follow
            </motion.button>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'posts', label: 'Posts', icon: 'FileText', count: posts.length },
                { id: 'liked', label: 'Liked', icon: 'Heart', count: 0 }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <ApperIcon name={tab.icon} className="w-4 h-4" />
                  <span>{tab.label}</span>
                  <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                    {tab.count}
                  </span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'posts' && (
              <>
                {posts.length === 0 ? (
                  <EmptyState 
                    title="No posts yet"
                    description={`${user.name} hasn't shared any posts yet.`}
                    actionLabel="Create Post"
                    onAction={() => window.dispatchEvent(new CustomEvent('openCreateModal'))}
                  />
                ) : (
                  <div className="space-y-6">
                    {posts.map((post, index) => (
                      <motion.div
                        key={post.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <PostCard 
                          post={post} 
                          onUpdate={handlePostUpdate}
                          onDelete={handlePostDelete}
                          showProfileLink={false}
                        />
                      </motion.div>
                    ))}
                  </div>
                )}
              </>
            )}

            {activeTab === 'liked' && (
              <EmptyState 
                title="No liked posts"
                description="Posts that this user likes will appear here."
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;