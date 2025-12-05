import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";

const RecipeDetailModal = ({ 
  recipe, 
  isOpen, 
  onClose,
  onEdit,
  onDelete,
  onFavoriteToggle 
}) => {
  if (!recipe || !isOpen) return null;

  const handleDragStart = (e) => {
    e.dataTransfer.setData("recipe", JSON.stringify(recipe));
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(recipe);
    }
    onClose();
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this recipe?")) {
      if (onDelete) {
        await onDelete(recipe.id);
      }
      onClose();
    }
  };

  const handleFavorite = () => {
    if (onFavoriteToggle) {
      onFavoriteToggle(recipe.id);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-white rounded-xl shadow-modal w-full max-w-2xl max-h-[90vh] overflow-hidden"
          initial={{ opacity: 0, scale: 0.9, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 50 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header with Image */}
          <div className="relative h-64 bg-gray-200 overflow-hidden">
            <img
              src={recipe.image}
              alt={recipe.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
            
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-black/30 backdrop-blur-sm text-white rounded-lg hover:bg-black/50 transition-colors duration-200"
            >
              <ApperIcon name="X" size={20} />
            </button>

            {/* Favorite Button */}
            <button
              onClick={handleFavorite}
              className={cn(
                "absolute top-4 left-4 p-2 backdrop-blur-sm rounded-lg transition-colors duration-200",
                recipe.isFavorite 
                  ? "bg-accent text-white" 
                  : "bg-black/30 text-white hover:bg-black/50"
              )}
            >
              <ApperIcon 
                name="Heart" 
                size={20}
                className={recipe.isFavorite ? "fill-current" : ""}
              />
            </button>

            {/* Recipe Title and Quick Stats */}
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <h1 className="text-2xl font-display font-bold mb-2">
                {recipe.name}
              </h1>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <ApperIcon name="Clock" size={16} />
                  <span>{recipe.prepTime} min</span>
                </div>
                <div className="flex items-center gap-1">
                  <ApperIcon name="Flame" size={16} />
                  <span>{recipe.calories} cal</span>
                </div>
                <div className="flex items-center gap-1">
                  <ApperIcon name="Users" size={16} />
                  <span>{recipe.servings} servings</span>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[50vh] custom-scrollbar">
            <div className="p-6 space-y-6">
              {/* Tags */}
              {recipe.tags && recipe.tags.length > 0 && (
                <div>
                  <h3 className="font-display font-semibold text-gray-800 mb-3">
                    Diet & Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {recipe.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Nutrition Facts */}
              <div>
                <h3 className="font-display font-semibold text-gray-800 mb-3">
                  Nutrition Facts
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="text-lg font-semibold text-gray-800">
                      {recipe.calories}
                    </div>
                    <div className="text-xs text-gray-600">Calories</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="text-lg font-semibold text-gray-800">
                      {Math.round(recipe.protein || 0)}g
                    </div>
                    <div className="text-xs text-gray-600">Protein</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="text-lg font-semibold text-gray-800">
                      {Math.round(recipe.carbs || 0)}g
                    </div>
                    <div className="text-xs text-gray-600">Carbs</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="text-lg font-semibold text-gray-800">
                      {Math.round(recipe.fat || 0)}g
                    </div>
                    <div className="text-xs text-gray-600">Fat</div>
                  </div>
                </div>
              </div>

              {/* Ingredients */}
              <div>
                <h3 className="font-display font-semibold text-gray-800 mb-3">
                  Ingredients
                </h3>
                <ul className="space-y-2">
                  {recipe.ingredients.map((ingredient, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-3 text-gray-700"
                    >
                      <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                      <span>{ingredient}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Instructions */}
              <div>
                <h3 className="font-display font-semibold text-gray-800 mb-3">
                  Instructions
                </h3>
                <ol className="space-y-4">
                  {recipe.instructions.map((instruction, index) => (
                    <li key={index} className="flex gap-4">
                      <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">
                        {index + 1}
                      </div>
                      <p className="text-gray-700 leading-relaxed">
                        {instruction}
                      </p>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between p-6 bg-gray-50 border-t border-gray-200">
            <div
              draggable
              onDragStart={handleDragStart}
              className="cursor-grab active:cursor-grabbing"
            >
              <Button variant="ghost" icon="Move">
                Drag to Calendar
              </Button>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                icon="Edit"
                onClick={handleEdit}
              >
                Edit
              </Button>
              <Button
                variant="danger"
                icon="Trash2"
                onClick={handleDelete}
              >
                Delete
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default RecipeDetailModal;