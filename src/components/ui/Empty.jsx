import { motion } from "framer-motion";
import ApperIcon from "@/components/ApperIcon";

const Empty = ({ 
  title = "Nothing here yet", 
  message = "Start by adding your first item",
  action,
  actionText = "Get Started",
  icon = "Plus",
  illustration
}) => {
  return (
    <motion.div 
      className="min-h-[400px] flex items-center justify-center bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl border-2 border-dashed border-orange-200"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="text-center space-y-6 max-w-md px-6">
        {illustration ? (
          <motion.div
            className="text-6xl"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            {illustration}
          </motion.div>
        ) : (
          <motion.div
            className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mx-auto"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <ApperIcon name={icon} size={40} className="text-white" />
          </motion.div>
        )}

        <div className="space-y-3">
          <h3 className="text-2xl font-display font-semibold text-gray-800">
            {title}
          </h3>
          <p className="text-gray-600 font-body leading-relaxed">
            {message}
          </p>
        </div>

        {action && (
          <motion.button
            onClick={action}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-accent text-white font-medium rounded-lg hover:from-orange-600 hover:to-yellow-500 transition-all duration-200 button-press shadow-lg hover:shadow-xl"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <ApperIcon name={icon} size={18} />
            {actionText}
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};

export default Empty;