import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import RecipeCard from "@/components/molecules/RecipeCard";
import RecipeDetailModal from "@/components/organisms/RecipeDetailModal";
import RecipeModal from "@/components/organisms/RecipeModal";
import SearchBar from "@/components/molecules/SearchBar";
import FilterTags from "@/components/molecules/FilterTags";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import ErrorView from "@/components/ui/ErrorView";
import Empty from "@/components/ui/Empty";
import { recipeService } from "@/services/api/recipeService";
import { toast } from "react-toastify";

const Recipes = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState(null);

  useEffect(() => {
    loadRecipes();
  }, []);

  const loadRecipes = async () => {
    try {
      setLoading(true);
      setError("");
      const allRecipes = await recipeService.getAll();
      setRecipes(allRecipes);
    } catch (err) {
      setError(err.message);
      console.error("Failed to load recipes:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredRecipes = useMemo(() => {
    return recipes.filter(recipe => {
      const matchesSearch = !searchQuery || 
        recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recipe.ingredients.some(ingredient => 
          ingredient.toLowerCase().includes(searchQuery.toLowerCase())
        );
      
      const matchesTags = selectedTags.length === 0 || 
        selectedTags.every(tag => recipe.tags.includes(tag));
      
      return matchesSearch && matchesTags;
    });
  }, [recipes, searchQuery, selectedTags]);

  const availableTags = useMemo(() => {
    const tags = new Set();
    recipes.forEach(recipe => {
      recipe.tags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags);
  }, [recipes]);

  const handleRecipeSelect = (recipe) => {
    setSelectedRecipe(recipe);
    setIsDetailModalOpen(true);
  };

  const handleFavoriteToggle = async (recipeId) => {
    try {
      const updatedRecipe = await recipeService.toggleFavorite(recipeId);
      setRecipes(prev => 
        prev.map(recipe => 
          recipe.id === recipeId ? updatedRecipe : recipe
        )
      );
      
      // Update selected recipe if it's the one being toggled
      if (selectedRecipe?.id === recipeId) {
        setSelectedRecipe(updatedRecipe);
      }

      const isFavorited = updatedRecipe.isFavorite;
      toast.success(isFavorited ? "Added to favorites" : "Removed from favorites");
    } catch (err) {
      toast.error("Failed to update favorite");
      console.error("Failed to toggle favorite:", err);
    }
  };

  const handleEdit = (recipe) => {
    setEditingRecipe(recipe);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (recipeId) => {
    try {
      await recipeService.delete(recipeId);
      setRecipes(prev => prev.filter(recipe => recipe.id !== recipeId));
      toast.success("Recipe deleted");
      setIsDetailModalOpen(false);
    } catch (err) {
      toast.error("Failed to delete recipe");
      console.error("Failed to delete recipe:", err);
    }
  };

const handleRecipeSave = (savedRecipe) => {
    try {
      if (editingRecipe) {
        // Update existing recipe
        setRecipes(prev => 
          prev.map(recipe => 
            recipe.id === savedRecipe.id ? savedRecipe : recipe
          )
        );
        console.log("Recipe updated in list:", savedRecipe.id);
      } else {
        // Add new recipe to the beginning of the list
        setRecipes(prev => {
          const updatedRecipes = [savedRecipe, ...prev];
          console.log("Recipe added to list:", savedRecipe.id, "Total recipes:", updatedRecipes.length);
          return updatedRecipes;
        });
      }
      setIsEditModalOpen(false);
      setEditingRecipe(null);
    } catch (error) {
      console.error("Failed to update recipes list:", error);
      toast.error("Failed to update recipes list");
    }
  };

  const handleTagToggle = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleDragStart = (e, recipe) => {
    e.dataTransfer.setData("recipe", JSON.stringify(recipe));
  };

  if (loading) {
    return <Loading type="recipes" />;
  }

  if (error) {
    return (
      <ErrorView
        title="Failed to load recipes"
        message={error}
        onRetry={loadRecipes}
      />
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div>
          <h1 className="text-3xl font-display font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Recipe Collection
          </h1>
          <p className="text-gray-600 mt-1">
            {recipes.length} recipes • {filteredRecipes.length} shown
          </p>
        </div>

        <Button
          icon="Plus"
          onClick={() => setIsEditModalOpen(true)}
          className="whitespace-nowrap"
        >
          Add Recipe
        </Button>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        className="space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
      >
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search recipes by name or ingredient..."
          className="max-w-lg"
        />
        
        <FilterTags
          availableTags={availableTags}
          selectedTags={selectedTags}
          onTagToggle={handleTagToggle}
        />
      </motion.div>

      {/* Recipe Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
        {recipes.length === 0 ? (
          <Empty
            title="No recipes yet"
            message="Start building your recipe collection by adding your first recipe."
            illustration="👨‍🍳"
            action={() => setIsEditModalOpen(true)}
            actionText="Add First Recipe"
            icon="Plus"
          />
        ) : filteredRecipes.length === 0 ? (
          <Empty
            title="No recipes found"
            message={`No recipes match your search "${searchQuery}" ${selectedTags.length > 0 ? `with tags: ${selectedTags.join(", ")}` : ""}`}
            illustration="🔍"
            action={() => {
              setSearchQuery("");
              setSelectedTags([]);
            }}
            actionText="Clear Filters"
            icon="X"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredRecipes.map((recipe, index) => (
                <motion.div
                  key={recipe.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ 
                    duration: 0.2,
                    delay: index * 0.05
                  }}
                  draggable
                  onDragStart={(e) => handleDragStart(e, recipe)}
                  className="cursor-grab active:cursor-grabbing"
                >
                  <RecipeCard
                    recipe={recipe}
                    onFavoriteToggle={handleFavoriteToggle}
                    onSelect={handleRecipeSelect}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.div>

      {/* Drag Tip */}
      {filteredRecipes.length > 0 && (
        <motion.div
          className="flex items-center gap-2 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <ApperIcon name="Move" size={18} className="text-blue-600" />
          <span className="text-sm text-blue-700">
            <strong>Tip:</strong> Drag recipes to your weekly calendar to plan meals
          </span>
        </motion.div>
      )}

      {/* Recipe Detail Modal */}
      <RecipeDetailModal
        recipe={selectedRecipe}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedRecipe(null);
        }}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onFavoriteToggle={handleFavoriteToggle}
      />

      {/* Recipe Edit/Create Modal */}
      <RecipeModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingRecipe(null);
        }}
        recipe={editingRecipe}
        onSave={handleRecipeSave}
      />

      {/* Mobile Spacing for Bottom Navigation */}
      <div className="h-20 md:h-0" />
    </div>
  );
};

export default Recipes;