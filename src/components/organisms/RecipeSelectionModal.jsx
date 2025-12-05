import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Loading from "@/components/ui/Loading";
import ErrorView from "@/components/ui/ErrorView";
import Empty from "@/components/ui/Empty";
import RecipeCard from "@/components/molecules/RecipeCard";
import { recipeService } from "@/services/api/recipeService";
import { toast } from "react-toastify";

const RecipeSelectionModal = ({ 
  isOpen, 
  onClose, 
  onSelectRecipe,
  day,
  mealType 
}) => {
  const [recipes, setRecipes] = useState([]);
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);

  const availableTags = [
    "vegetarian", "vegan", "gluten-free", "dairy-free", "keto", 
    "high-protein", "low-calorie", "quick", "mediterranean", "asian",
    "spicy", "breakfast", "lunch", "dinner", "snacks", "pescatarian"
  ];

  useEffect(() => {
    if (isOpen) {
      loadRecipes();
      setSearchQuery("");
      setSelectedTags([]);
    }
  }, [isOpen]);

  useEffect(() => {
    filterRecipes();
  }, [recipes, searchQuery, selectedTags]);

  const loadRecipes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await recipeService.getAll();
      setRecipes(data);
    } catch (err) {
      setError("Failed to load recipes");
      toast.error("Unable to load recipes");
    } finally {
      setLoading(false);
    }
  };

  const filterRecipes = () => {
    let filtered = [...recipes];

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(recipe => 
        recipe.name.toLowerCase().includes(query) ||
        recipe.ingredients.some(ingredient => 
          ingredient.toLowerCase().includes(query)
        )
      );
    }

    // Filter by selected tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter(recipe =>
        selectedTags.every(tag => recipe.tags?.includes(tag))
      );
    }

    setFilteredRecipes(filtered);
  };

  const handleTagToggle = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleRecipeSelect = (recipe) => {
    if (onSelectRecipe) {
      onSelectRecipe(recipe, day, mealType);
    }
    onClose();
  };

  const handleFavoriteToggle = async (recipeId) => {
    try {
      const updatedRecipe = await recipeService.toggleFavorite(recipeId);
      setRecipes(prev => 
        prev.map(recipe => 
          recipe.id === recipeId ? updatedRecipe : recipe
        )
      );
      toast.success(
        updatedRecipe.isFavorite ? "Added to favorites" : "Removed from favorites"
      );
    } catch (error) {
      toast.error("Failed to update favorite status");
    }
  };

  const getMealTypeDisplay = () => {
    return mealType?.charAt(0).toUpperCase() + mealType?.slice(1) || "Meal";
  };

  if (!isOpen) return null;

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
          className="bg-white rounded-xl shadow-modal w-full max-w-5xl max-h-[90vh] overflow-hidden"
          initial={{ opacity: 0, scale: 0.9, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 50 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-display font-semibold text-gray-800">
                Select Recipe for {getMealTypeDisplay()}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Choose a recipe to add to {day}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <ApperIcon name="X" size={20} />
            </button>
          </div>

          {/* Search and Filters */}
          <div className="p-6 border-b border-gray-200 space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search recipes by name or ingredients..."
                className="pl-10"
              />
              <ApperIcon 
                name="Search" 
                size={18} 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
            </div>

            {/* Tag Filters */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by tags
              </label>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto custom-scrollbar">
                {availableTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleTagToggle(tag)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200",
                      selectedTags.includes(tag)
                        ? "bg-primary text-white border-primary"
                        : "bg-gray-50 text-gray-600 border-gray-200 hover:border-primary hover:text-primary"
                    )}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto max-h-[calc(90vh-280px)] custom-scrollbar">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loading />
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-12">
                <ErrorView 
                  title="Failed to load recipes"
                  message={error}
                  onRetry={loadRecipes}
                />
              </div>
            ) : filteredRecipes.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <Empty 
                  title={searchQuery || selectedTags.length > 0 ? "No matching recipes" : "No recipes found"}
                  message={
                    searchQuery || selectedTags.length > 0 
                      ? "Try adjusting your search or filters" 
                      : "Add some recipes to get started"
                  }
                />
              </div>
            ) : (
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredRecipes.map((recipe) => (
                    <RecipeCard
                      key={recipe.id}
                      recipe={recipe}
                      onSelect={handleRecipeSelect}
                      onFavoriteToggle={handleFavoriteToggle}
                      className="transition-all duration-200 hover:scale-105 cursor-pointer"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 bg-gray-50 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              {loading ? "Loading..." : `${filteredRecipes.length} recipe${filteredRecipes.length !== 1 ? 's' : ''} found`}
            </div>
            <Button
              variant="ghost"
              onClick={onClose}
            >
              Cancel
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default RecipeSelectionModal;