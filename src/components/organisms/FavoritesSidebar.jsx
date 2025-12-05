import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";
import RecipeCard from "@/components/molecules/RecipeCard";
import Loading from "@/components/ui/Loading";
import Empty from "@/components/ui/Empty";
import { recipeService } from "@/services/api/recipeService";

const FavoritesSidebar = ({ 
  isOpen, 
  onToggle,
  onRecipeSelect,
  className 
}) => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef(null);
  const dragStartRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    loadFavorites();
  }, []);

  useEffect(() => {
    if (isDragging) {
      const handleMouseMove = (e) => {
        const deltaX = e.clientX - dragStartRef.current.x;
        const deltaY = e.clientY - dragStartRef.current.y;
        
        // Constrain to viewport bounds
        const maxX = window.innerWidth - 320 - 24;
        const maxY = window.innerHeight - 200;
        
        setPosition({
          x: Math.max(-maxX, Math.min(0, deltaX)),
          y: Math.max(-80, Math.min(maxY, deltaY))
        });
      };

      const handleMouseUp = () => {
        setIsDragging(false);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      setError("");
      const favoriteRecipes = await recipeService.getFavorites();
      setFavorites(favoriteRecipes);
    } catch (err) {
      setError(err.message);
      console.error("Failed to load favorites:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (e) => {
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY
    };
    e.preventDefault();
  };

  const handleRecipeDragStart = (e, recipe) => {
    e.dataTransfer.setData("recipe", JSON.stringify(recipe));
  };

  return (
    <>
      {/* Desktop Draggable Modal */}
      <motion.div 
        ref={dragRef}
        className={cn(
          "hidden lg:block fixed z-30 w-80",
          isDragging && "cursor-grabbing",
          className
        )}
        style={{
          right: position.x === 0 ? '24px' : 'auto',
          top: position.x === 0 ? '80px' : `${80 + position.y}px`,
          left: position.x === 0 ? 'auto' : `${window.innerWidth - 320 - 24 + position.x}px`,
          height: isCollapsed ? 'auto' : '60vh',
        }}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-modal border border-gray-200 h-full flex flex-col overflow-hidden">
          {/* Drag Handle & Header */}
          <div 
            className="p-4 border-b border-gray-200 cursor-grab active:cursor-grabbing select-none"
            onMouseDown={handleDragStart}
          >
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
              </div>
              <ApperIcon name="Heart" size={18} className="text-accent fill-current" />
              <h3 className="font-display font-semibold text-gray-800">
                Favorite Recipes
              </h3>
              <span className="ml-auto text-sm text-gray-500">
                {favorites.length}
              </span>
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="p-1 hover:bg-gray-100 rounded transition-colors duration-200"
                title={isCollapsed ? "Expand" : "Collapse"}
              >
                <ApperIcon name={isCollapsed ? "ChevronDown" : "ChevronUp"} size={16} />
              </button>
            </div>
          </div>

          {/* Content */}
          {!isCollapsed && (
            <div className="flex-1 overflow-hidden">
              {loading ? (
                <div className="p-4">
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <div key={index} className="h-20 bg-gray-200 rounded-lg animate-pulse" />
                    ))}
                  </div>
                </div>
              ) : error ? (
                <div className="p-4">
                  <div className="text-center text-error text-sm">
                    {error}
                  </div>
                </div>
              ) : favorites.length === 0 ? (
                <div className="p-4">
                  <Empty
                    title="No favorites yet"
                    message="Star recipes to see them here"
                    icon="Heart"
                    className="min-h-0 py-8"
                  />
                </div>
              ) : (
                <div className="p-4 space-y-3 overflow-y-auto custom-scrollbar">
                  {favorites.map((recipe) => (
                    <motion.div
                      key={recipe.id}
                      className="group cursor-grab active:cursor-grabbing"
                      draggable
                      onDragStart={(e) => handleRecipeDragStart(e, recipe)}
                      onClick={() => onRecipeSelect && onRecipeSelect(recipe)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="bg-white rounded-lg border border-gray-200 p-3 hover:border-primary transition-colors duration-200">
                        <div className="flex gap-3">
                          <img
                            src={recipe.image}
                            alt={recipe.name}
                            className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-800 text-sm truncate">
                              {recipe.name}
                            </h4>
                            <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                              <span>{recipe.prepTime}min</span>
                              <span>•</span>
                              <span>{recipe.calories}cal</span>
                            </div>
                          </div>
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <ApperIcon name="Move" size={16} className="text-gray-400" />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>

      {/* Mobile Toggle Button */}
      <button
        onClick={onToggle}
        className="lg:hidden fixed right-4 bottom-24 w-12 h-12 bg-gradient-to-r from-primary to-accent text-white rounded-full shadow-lg flex items-center justify-center z-30"
      >
        <ApperIcon name="Heart" size={20} className="fill-current" />
      </button>

      {/* Mobile Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onToggle}
            />
            <motion.div
              className="lg:hidden fixed bottom-0 left-0 right-0 bg-white rounded-t-xl shadow-modal z-50 max-h-[70vh]"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <ApperIcon name="Heart" size={18} className="text-accent fill-current" />
                  <h3 className="font-display font-semibold text-gray-800">
                    Favorites
                  </h3>
                  <span className="text-sm text-gray-500">
                    ({favorites.length})
                  </span>
                </div>
                <button
                  onClick={onToggle}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  <ApperIcon name="X" size={20} />
                </button>
              </div>

              {/* Content */}
              <div className="overflow-y-auto custom-scrollbar">
                {loading ? (
                  <div className="p-4">
                    <div className="grid grid-cols-2 gap-3">
                      {Array.from({ length: 4 }).map((_, index) => (
                        <div key={index} className="h-32 bg-gray-200 rounded-lg animate-pulse" />
                      ))}
                    </div>
                  </div>
                ) : error ? (
                  <div className="p-4 text-center text-error">
                    {error}
                  </div>
                ) : favorites.length === 0 ? (
                  <div className="p-4">
                    <Empty
                      title="No favorites yet"
                      message="Star recipes to see them here for quick access"
                      icon="Heart"
                      className="min-h-0 py-8"
                    />
                  </div>
                ) : (
                  <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {favorites.map((recipe) => (
                      <div
                        key={recipe.id}
                        className="cursor-grab active:cursor-grabbing"
                        draggable
                        onDragStart={(e) => handleRecipeDragStart(e, recipe)}
                        onClick={() => {
                          onRecipeSelect && onRecipeSelect(recipe);
                          onToggle();
                        }}
                      >
                        <RecipeCard
                          recipe={recipe}
                          className="transform-none"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default FavoritesSidebar;