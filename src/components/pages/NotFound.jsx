import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div 
        className="text-center space-y-8 max-w-md"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Illustration */}
        <motion.div
          className="text-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        >
          <div className="text-8xl mb-4">🍳</div>
          <div className="text-6xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            404
          </div>
        </motion.div>

        {/* Content */}
        <div className="space-y-4">
          <h1 className="text-3xl font-display font-bold text-gray-800">
            Recipe Not Found
          </h1>
          <p className="text-gray-600 leading-relaxed">
            Looks like this page wandered off the menu! The recipe you're looking for doesn't exist or may have been moved.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/">
            <Button icon="Calendar" className="w-full sm:w-auto">
              Go to Calendar
            </Button>
          </Link>
          
          <Link to="/recipes">
            <Button variant="outline" icon="BookOpen" className="w-full sm:w-auto">
              Browse Recipes
            </Button>
          </Link>
        </div>

        {/* Help Links */}
        <div className="pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4">
            Need help finding what you're looking for?
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <Link 
              to="/recipes" 
              className="flex items-center gap-2 text-primary hover:text-accent transition-colors duration-200"
            >
              <ApperIcon name="Search" size={16} />
              Search Recipes
            </Link>
            <Link 
              to="/shopping-list" 
              className="flex items-center gap-2 text-primary hover:text-accent transition-colors duration-200"
            >
              <ApperIcon name="ShoppingCart" size={16} />
              Shopping List
            </Link>
            <Link 
              to="/nutrition" 
              className="flex items-center gap-2 text-primary hover:text-accent transition-colors duration-200"
            >
              <ApperIcon name="BarChart3" size={16} />
              Nutrition
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;