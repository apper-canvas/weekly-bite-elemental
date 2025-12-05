import { motion } from "framer-motion";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";

const RecipeCard = ({ 
  recipe, 
  onFavoriteToggle, 
  onSelect,
  isDragging = false,
  className 
}) => {
  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    if (onFavoriteToggle) {
      onFavoriteToggle(recipe.id);
    }
  };

  const handleCardClick = () => {
    if (onSelect) {
      onSelect(recipe);
    }
  };

  return (
    <motion.div
      className={cn(
        "recipe-card bg-white rounded-xl shadow-card overflow-hidden cursor-pointer",
        isDragging && "drag-preview",
        className
      )}
      onClick={handleCardClick}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      layout
    >
      <div className="relative h-48 bg-gray-200 overflow-hidden">
        <img
          src={recipe.image}
          alt={recipe.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        
        <button
          onClick={handleFavoriteClick}
          className={cn(
            "absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm transition-all duration-200",
            recipe.isFavorite 
              ? "bg-accent text-white shadow-lg" 
              : "bg-white/80 text-gray-600 hover:bg-white"
          )}
        >
          <ApperIcon 
            name={recipe.isFavorite ? "Heart" : "Heart"} 
            size={16}
            className={recipe.isFavorite ? "fill-current" : ""}
          />
        </button>
      </div>

      <div className="p-4">
        <div className="mb-3">
          <h3 className="font-display font-semibold text-gray-800 text-lg mb-1 line-clamp-1">
            {recipe.name}
          </h3>
          
          {recipe.tags && recipe.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {recipe.tags.slice(0, 2).map((tag, index) => (
                <span
                  key={index}
                  className="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full"
                >
                  {tag}
                </span>
              ))}
              {recipe.tags.length > 2 && (
                <span className="text-xs text-gray-500">+{recipe.tags.length - 2}</span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <ApperIcon name="Clock" size={14} />
            <span>{recipe.prepTime}min</span>
          </div>
          
          <div className="flex items-center gap-1">
            <ApperIcon name="Flame" size={14} />
            <span>{recipe.calories} cal</span>
          </div>
          
          <div className="flex items-center gap-1">
            <ApperIcon name="Users" size={14} />
            <span>{recipe.servings}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default RecipeCard;