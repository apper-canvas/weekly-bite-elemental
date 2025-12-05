import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/utils/cn";
import { getMealTypeColor } from "@/utils/nutritionUtils";
import ApperIcon from "@/components/ApperIcon";

const MealSlot = ({ 
  day, 
  mealType, 
  recipe, 
  onDrop, 
  onRemove,
  onAdd,
  className 
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const recipeData = e.dataTransfer.getData("recipe");
    if (recipeData && onDrop) {
      const recipe = JSON.parse(recipeData);
      onDrop(day, mealType, recipe.id);
    }
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    if (onRemove) {
      onRemove(day, mealType);
    }
  };

  const handleAdd = () => {
    if (onAdd) {
      onAdd(day, mealType);
    }
  };

  const mealTypeColors = {
    breakfast: "from-yellow-400 to-orange-400",
    lunch: "from-orange-500 to-red-400",
    dinner: "from-red-600 to-orange-600",
    snacks: "from-green-400 to-emerald-500"
  };

  return (
    <div className={cn("mb-3", className)}>
      {/* Meal Type Header */}
      <div className={cn(
        "px-3 py-2 text-xs font-medium text-white rounded-t-lg bg-gradient-to-r",
        mealTypeColors[mealType]
      )}>
        {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
      </div>

      {/* Meal Content */}
      <div
        className={cn(
          "min-h-[120px] p-3 bg-gray-50 rounded-b-lg border-2 border-dashed transition-all duration-200 cursor-pointer drop-zone",
          isDragOver 
            ? "border-primary bg-primary/10 hover" 
            : "border-gray-200 hover:border-gray-300"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={!recipe ? handleAdd : undefined}
      >
        {recipe ? (
          <motion.div
            className="relative bg-white rounded-lg shadow-sm overflow-hidden h-full"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <button
              onClick={handleRemove}
              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-all duration-200 z-10"
            >
              <ApperIcon name="X" size={12} />
            </button>

            <div className="p-3">
              <div className="flex items-start gap-3">
                <img
                  src={recipe.image}
                  alt={recipe.name}
                  className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-800 text-sm truncate">
                    {recipe.name}
                  </h4>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <ApperIcon name="Clock" size={10} />
                      {recipe.prepTime}min
                    </span>
                    <span className="flex items-center gap-1">
                      <ApperIcon name="Flame" size={10} />
                      {recipe.calories} cal
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <ApperIcon name="Plus" size={24} className="mb-2" />
            <span className="text-xs text-center">
              {isDragOver ? "Drop recipe here" : "Add meal or drag recipe"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MealSlot;