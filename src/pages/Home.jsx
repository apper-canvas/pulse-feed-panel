import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import PostCard from '../components/PostCard';
import TrendingSidebar from '../components/TrendingSidebar';
import SkeletonLoader from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import { postService } from '../services';
import { toast } from 'react-toastify';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const loadPosts = async (pageNum = 1, isRefresh = false) => {
    if (loading) return;
    
    setLoading(true);
    if (isRefresh) {
      setError(null);
    }
    
    try {
      const result = await postService.getAll();
      
      if (isRefresh || pageNum === 1) {
        setPosts(result);
      } else {
        setPosts(prev => [...prev, ...result]);
      }
      
      // Simulate pagination logic
      if (result.length < 10) {
        setHasMore(false);
      }
    } catch (err) {
      setError(err.message || 'Failed to load posts');
      if (!isRefresh) {
        toast.error('Failed to load posts');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts(1, true);
  }, []);

  const handlePostUpdate = (updatedPost) => {
    setPosts(prev => prev.map(post => 
      post.id === updatedPost.id ? updatedPost : post
    ));
  };

  const handlePostDelete = (deletedPostId) => {
    setPosts(prev => prev.filter(post => post.id !== deletedPostId));
    toast.success('Post deleted successfully');
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadPosts(nextPage);
    }
  };

  if (loading && posts.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <div className="space-y-6">
              <SkeletonLoader count={3} />
            </div>
          </div>
          <div className="hidden lg:block">
            <div className="sticky top-20">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-3 bg-gray-200 rounded"></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && posts.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <ErrorState 
          message={error}
          onRetry={() => loadPosts(1, true)}
        />
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <EmptyState 
          title="No posts yet"
          description="Be the first to share something with the community!"
          actionLabel="Create Post"
          onAction={() => window.dispatchEvent(new CustomEvent('openCreateModal'))}
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Feed */}
        <div className="lg:col-span-3">
          <div className="space-y-6">
            {/* Welcome Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-sm p-6 border border-gray-100"
            >
              <h1 className="text-2xl font-bold font-display text-gray-900 mb-2">
                Welcome to Pulse Feed
              </h1>
              <p className="text-gray-600">
                Discover authentic content and connect with your community
              </p>
            </motion.div>

            {/* Posts Feed */}
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
                  />
                </motion.div>
              ))}
            </div>

            {/* Load More Button */}
            {hasMore && (
              <div className="flex justify-center py-6">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLoadMore}
                  disabled={loading}
                  className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Loading...' : 'Load More Posts'}
                </motion.button>
              </div>
            )}

            {loading && posts.length > 0 && (
              <div className="space-y-6">
                <SkeletonLoader count={2} />
              </div>
            )}
          </div>
        </div>

        {/* Trending Sidebar */}
        <div className="hidden lg:block">
          <div className="sticky top-20">
            <TrendingSidebar />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;