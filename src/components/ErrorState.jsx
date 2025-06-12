import { motion } from 'framer-motion';
import ApperIcon from './ApperIcon';

const ErrorState = ({ 
  message, 
  onRetry, 
  retryLabel = 'Try Again' 
}) => {
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="text-center py-12 px-6"
    >
      <motion.div
        animate={{ 
          rotate: [0, 10, -10, 0],
          scale: [1, 1.1, 1] 
        }}
        transition={{ 
          repeat: Infinity, 
          duration: 4,
          ease: "easeInOut"
        }}
        className="mb-6"
      >
        <ApperIcon name="AlertCircle" className="w-16 h-16 text-error mx-auto" />
      </motion.div>
      
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        Oops! Something went wrong
      </h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">{message}</p>
      
      {onRetry && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onRetry}
          className="px-6 py-3 gradient-primary text-white rounded-lg font-medium shadow-sm hover:shadow-md transition-all duration-200"
        >
          {retryLabel}
        </motion.button>
      )}
    </motion.div>
  );
};

export default ErrorState;