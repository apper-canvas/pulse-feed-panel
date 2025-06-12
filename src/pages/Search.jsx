import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import PostCard from '../components/PostCard';
import SkeletonLoader from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import ApperIcon from '../components/ApperIcon';
import { postService } from '../services';
import { toast } from 'react-toastify';

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  const performSearch = async (searchQuery) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const searchResults = await postService.search(searchQuery);
      setResults(searchResults);
    } catch (err) {
      setError(err.message || 'Failed to search posts');
      toast.error('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const searchQuery = searchParams.get('q');
    if (searchQuery) {
      setQuery(searchQuery);
      performSearch(searchQuery);
    }
  }, [searchParams]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchParams({ q: query.trim() });
    } else {
      setSearchParams({});
      setResults([]);
      setHasSearched(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    
    if (!value.trim()) {
      setSearchParams({});
      setResults([]);
      setHasSearched(false);
    }
  };

  const handlePostUpdate = (updatedPost) => {
    setResults(prev => prev.map(post => 
      post.id === updatedPost.id ? updatedPost : post
    ));
  };

  const handlePostDelete = (deletedPostId) => {
    setResults(prev => prev.filter(post => post.id !== deletedPostId));
    toast.success('Post deleted successfully');
  };

  const clearSearch = () => {
    setQuery('');
    setSearchParams({});
    setResults([]);
    setHasSearched(false);
    setError(null);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="space-y-6">
        {/* Search Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm p-6"
        >
          <h1 className="text-2xl font-bold font-display text-gray-900 mb-4">
            Search Posts
          </h1>
          
          <form onSubmit={handleSearch} className="relative">
            <div className="relative">
              <ApperIcon 
                name="Search" 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" 
              />
              <input
                type="text"
                value={query}
                onChange={handleInputChange}
                placeholder="Search for posts, topics, or keywords..."
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 placeholder-gray-500"
                autoFocus
              />
              {query && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <ApperIcon name="X" className="w-4 h-4" />
                </button>
              )}
            </div>
          </form>

          {hasSearched && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                {loading ? 'Searching...' : `Found ${results.length} result${results.length !== 1 ? 's' : ''} for "${query}"`}
              </p>
              {results.length > 0 && (
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <ApperIcon name="Filter" className="w-4 h-4" />
                  <span>Recent first</span>
                </div>
              )}
            </div>
          )}
        </motion.div>

        {/* Search Results */}
        <div className="space-y-6">
          {loading && (
            <SkeletonLoader count={3} />
          )}

          {error && (
            <ErrorState 
              message={error}
              onRetry={() => performSearch(query)}
            />
          )}

          {!loading && !error && hasSearched && results.length === 0 && (
            <EmptyState 
              title="No posts found"
              description={`We couldn't find any posts matching "${query}". Try different keywords or check your spelling.`}
              actionLabel="Clear Search"
              onAction={clearSearch}
            />
          )}

          {!loading && !error && results.length > 0 && (
            <>
              {results.map((post, index) => (
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
                    highlightQuery={query}
                  />
                </motion.div>
              ))}
            </>
          )}

          {!hasSearched && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-sm p-8 text-center"
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 3 }}
              >
                <ApperIcon name="Search" className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              </motion.div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Discover amazing content
              </h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Search for posts, topics, or keywords to find exactly what you're looking for in our community.
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Search;