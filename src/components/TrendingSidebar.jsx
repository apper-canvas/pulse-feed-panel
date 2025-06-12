import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import ApperIcon from './ApperIcon';
import { postService } from '../services';

const TrendingSidebar = () => {
  const [trendingTopics, setTrendingTopics] = useState([]);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadTrendingData();
  }, []);

  const loadTrendingData = async () => {
    setLoading(true);
    try {
      // Simulate trending topics from posts
      const posts = await postService.getAll();
      
      // Extract hashtags and topics
      const topics = [
        { name: '#technology', posts: 42 },
        { name: '#design', posts: 28 },
        { name: '#startup', posts: 19 },
        { name: '#react', posts: 15 },
        { name: '#webdev', posts: 12 }
      ];
      
      const users = [
        {
          id: 'user2',
          name: 'Sarah Chen',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b68b83bb?w=150&h=150&fit=crop&crop=face',
          followers: '1.2k',
          isFollowing: false
        },
        {
          id: 'user3',
          name: 'Mike Johnson',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
          followers: '892',
          isFollowing: false
        },
        {
          id: 'user4',
          name: 'Emily Davis',
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
          followers: '654',
          isFollowing: true
        }
      ];
      
      setTrendingTopics(topics);
      setSuggestedUsers(users);
    } catch (error) {
      console.error('Failed to load trending data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollowToggle = (userId) => {
    setSuggestedUsers(prev => prev.map(user => 
      user.id === userId 
        ? { ...user, isFollowing: !user.isFollowing }
        : user
    ));
  };

  if (loading) {
    return (
      <div className="space-y-6">
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
    );
  }

  return (
    <div className="space-y-6">
      {/* Trending Topics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-sm p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <ApperIcon name="TrendingUp" className="w-5 h-5 mr-2 text-primary" />
          Trending Topics
        </h3>
        
        <div className="space-y-3">
          {trendingTopics.map((topic, index) => (
            <motion.div
              key={topic.name}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <div>
                <p className="font-medium text-primary">{topic.name}</p>
                <p className="text-sm text-gray-500">{topic.posts} posts</p>
              </div>
              <ApperIcon name="ArrowRight" className="w-4 h-4 text-gray-400" />
            </motion.div>
          ))}
        </div>
        
        <Link
          to="/search"
          className="block mt-4 text-sm text-primary hover:text-primary/80 font-medium transition-colors"
        >
          See all trends
        </Link>
      </motion.div>

      {/* Suggested Users */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-lg shadow-sm p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <ApperIcon name="Users" className="w-5 h-5 mr-2 text-primary" />
          Suggested for You
        </h3>
        
        <div className="space-y-4">
          {suggestedUsers.map((user, index) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center space-x-3"
            >
              <Link to={`/profile/${user.id}`} className="flex-shrink-0">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-100 hover:ring-primary/20 transition-all duration-200"
                />
              </Link>
              
              <div className="flex-1 min-w-0">
                <Link
                  to={`/profile/${user.id}`}
                  className="font-medium text-gray-900 hover:text-primary transition-colors truncate block"
                >
                  {user.name}
                </Link>
                <p className="text-sm text-gray-500">{user.followers} followers</p>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleFollowToggle(user.id)}
                className={`px-3 py-1 text-sm font-medium rounded-lg transition-all duration-200 ${
                  user.isFollowing
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    : 'bg-primary text-white hover:bg-primary/90'
                }`}
              >
                {user.isFollowing ? 'Following' : 'Follow'}
              </motion.button>
            </motion.div>
          ))}
        </div>
        
        <Link
          to="/search"
          className="block mt-4 text-sm text-primary hover:text-primary/80 font-medium transition-colors"
        >
          See all suggestions
        </Link>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-lg shadow-sm p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <ApperIcon name="Activity" className="w-5 h-5 mr-2 text-primary" />
          Community Stats
        </h3>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Active users</span>
            <span className="font-semibold text-gray-900">2.4k</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Posts today</span>
            <span className="font-semibold text-gray-900">127</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">New members</span>
            <span className="font-semibold text-gray-900">23</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default TrendingSidebar;