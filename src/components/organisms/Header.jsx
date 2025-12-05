import { useState } from "react";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";

const Header = ({ onAddRecipe }) => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const getPageTitle = () => {
    switch (location.pathname) {
      case "/":
        return "Weekly Calendar";
      case "/recipes":
        return "Recipe Collection";
      case "/shopping-list":
        return "Shopping List";
      case "/nutrition":
        return "Nutrition Dashboard";
      default:
        return "WeeklyBite";
    }
  };

  const getPageIcon = () => {
    switch (location.pathname) {
      case "/":
        return "Calendar";
      case "/recipes":
        return "BookOpen";
      case "/shopping-list":
        return "ShoppingCart";
      case "/nutrition":
        return "BarChart3";
      default:
        return "ChefHat";
    }
  };

  const showAddButton = location.pathname === "/recipes";

  return (
    <header className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Page Title */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center">
                <ApperIcon name="ChefHat" size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-display font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  WeeklyBite
                </h1>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-2 pl-4 border-l border-gray-200">
              <ApperIcon name={getPageIcon()} size={18} className="text-gray-600" />
              <span className="font-medium text-gray-800">
                {getPageTitle()}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {showAddButton && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                <Button
                  onClick={onAddRecipe}
                  icon="Plus"
                  size="md"
                  className="hidden sm:inline-flex"
                >
                  Add Recipe
                </Button>
                <Button
                  onClick={onAddRecipe}
                  icon="Plus"
                  size="md"
                  className="sm:hidden w-10 h-10 p-0"
                >
                </Button>
              </motion.div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors duration-200"
            >
              <ApperIcon name={isMobileMenuOpen ? "X" : "Menu"} size={20} />
            </button>
          </div>
        </div>

        {/* Mobile Page Title */}
        <div className="md:hidden pb-3 flex items-center gap-2">
          <ApperIcon name={getPageIcon()} size={16} className="text-gray-600" />
          <span className="font-medium text-gray-800 text-sm">
            {getPageTitle()}
          </span>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <motion.div
          className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-200 shadow-lg"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="p-4">
            <div className="text-center text-gray-600">
              <p className="text-sm">Navigate using the bottom tabs</p>
            </div>
          </div>
        </motion.div>
      )}
    </header>
  );
};

export default Header;