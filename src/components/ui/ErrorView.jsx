import { motion } from "framer-motion";
import ApperIcon from "@/components/ApperIcon";

const ErrorView = ({ title = "Something went wrong", message, onRetry }) => {
  return (
    <motion.div 
      className="min-h-[400px] flex items-center justify-center bg-background rounded-xl"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="text-center space-y-6 max-w-md px-6">
        <motion.div
          className="w-20 h-20 bg-gradient-to-br from-error to-orange-500 rounded-full flex items-center justify-center mx-auto"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        >
          <ApperIcon name="AlertTriangle" size={40} className="text-white" />
        </motion.div>

        <div className="space-y-3">
          <h3 className="text-2xl font-display font-semibold text-gray-800">
            {title}
          </h3>
          {message && (
            <p className="text-gray-600 font-body leading-relaxed">
              {message}
            </p>
          )}
        </div>

        {onRetry && (
          <motion.button
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-orange-500 text-white font-medium rounded-lg hover:from-orange-600 hover:to-red-500 transition-all duration-200 button-press"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <ApperIcon name="RotateCcw" size={18} />
            Try Again
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};

export default ErrorView;