import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import TextArea from "@/components/atoms/TextArea";
import Select from "@/components/atoms/Select";
import { recipeService } from "@/services/api/recipeService";
import { toast } from "react-toastify";

const RecipeModal = ({ 
  isOpen, 
  onClose, 
  recipe = null,
  onSave 
}) => {
  const [formData, setFormData] = useState({
    name: "",
    image: "",
    ingredients: [""],
    instructions: [""],
    prepTime: "",
    calories: "",
    protein: "",
    carbs: "",
    fat: "",
    servings: "",
    tags: []
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const availableTags = [
    "vegetarian", "vegan", "gluten-free", "dairy-free", "keto", 
    "high-protein", "low-calorie", "quick", "mediterranean", "asian",
    "spicy", "breakfast", "lunch", "dinner", "snacks", "pescatarian"
  ];

  useEffect(() => {
    if (recipe) {
      setFormData({
        name: recipe.name || "",
        image: recipe.image || "",
        ingredients: recipe.ingredients || [""],
        instructions: recipe.instructions || [""],
        prepTime: recipe.prepTime?.toString() || "",
        calories: recipe.calories?.toString() || "",
        protein: recipe.protein?.toString() || "",
        carbs: recipe.carbs?.toString() || "",
        fat: recipe.fat?.toString() || "",
        servings: recipe.servings?.toString() || "",
        tags: recipe.tags || []
      });
    } else {
      // Reset form for new recipe
      setFormData({
        name: "",
        image: "",
        ingredients: [""],
        instructions: [""],
        prepTime: "",
        calories: "",
        protein: "",
        carbs: "",
        fat: "",
        servings: "",
        tags: []
      });
    }
    setErrors({});
  }, [recipe, isOpen]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleIngredientChange = (index, value) => {
    const newIngredients = [...formData.ingredients];
    newIngredients[index] = value;
    setFormData(prev => ({ ...prev, ingredients: newIngredients }));
  };

  const addIngredient = () => {
    setFormData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, ""]
    }));
  };

  const removeIngredient = (index) => {
    if (formData.ingredients.length > 1) {
      const newIngredients = formData.ingredients.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, ingredients: newIngredients }));
    }
  };

  const handleInstructionChange = (index, value) => {
    const newInstructions = [...formData.instructions];
    newInstructions[index] = value;
    setFormData(prev => ({ ...prev, instructions: newInstructions }));
  };

  const addInstruction = () => {
    setFormData(prev => ({
      ...prev,
      instructions: [...prev.instructions, ""]
    }));
  };

  const removeInstruction = (index) => {
    if (formData.instructions.length > 1) {
      const newInstructions = formData.instructions.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, instructions: newInstructions }));
    }
  };

  const handleTagToggle = (tag) => {
    const isSelected = formData.tags.includes(tag);
    const newTags = isSelected
      ? formData.tags.filter(t => t !== tag)
      : [...formData.tags, tag];
    
    setFormData(prev => ({ ...prev, tags: newTags }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error("Image size must be less than 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({ ...prev, image: e.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Recipe name is required";
    }

    if (!formData.prepTime || parseInt(formData.prepTime) <= 0) {
      newErrors.prepTime = "Prep time must be a positive number";
    }

    if (!formData.calories || parseInt(formData.calories) <= 0) {
      newErrors.calories = "Calories must be a positive number";
    }

    if (!formData.servings || parseInt(formData.servings) <= 0) {
      newErrors.servings = "Servings must be a positive number";
    }

    const validIngredients = formData.ingredients.filter(ing => ing.trim());
    if (validIngredients.length === 0) {
      newErrors.ingredients = "At least one ingredient is required";
    }

    const validInstructions = formData.instructions.filter(inst => inst.trim());
    if (validInstructions.length === 0) {
      newErrors.instructions = "At least one instruction is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      // Clean up data
      const cleanData = {
        ...formData,
        ingredients: formData.ingredients.filter(ing => ing.trim()),
        instructions: formData.instructions.filter(inst => inst.trim()),
        prepTime: parseInt(formData.prepTime),
        calories: parseInt(formData.calories),
        protein: parseFloat(formData.protein) || 0,
        carbs: parseFloat(formData.carbs) || 0,
        fat: parseFloat(formData.fat) || 0,
        servings: parseInt(formData.servings),
        image: formData.image || `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRTY3RTIyIi8+CjxjaXJjbGUgY3g9IjE1MCIgY3k9IjEwMCIgcj0iNDAiIGZpbGw9IiNGRkYiLz4KPHN2ZyB4PSIxMzAiIHk9IjgwIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIGZpbGw9IiNGRkYiPgo8cGF0aCBkPSJNMTAgMTBIMzBWMzBIMTBWMTBaTTE1IDE1VjI1SDI1VjE1SDE1WiIvPgo8L3N2Zz4KPHR4dCB4PSIxNTAiIHk9IjE2MCIgZmlsbD0iI0ZGRiIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5SZWNpcGU8L3R4dD4KPC9zdmc+`
      };

      let savedRecipe;
      if (recipe?.id) {
        savedRecipe = await recipeService.update(recipe.id, cleanData);
        toast.success("Recipe updated successfully");
      } else {
        savedRecipe = await recipeService.create(cleanData);
        toast.success("Recipe created successfully");
      }

      if (onSave) {
        onSave(savedRecipe);
      }
      
      onClose();
    } catch (error) {
      toast.error("Failed to save recipe");
      console.error("Failed to save recipe:", error);
    } finally {
      setLoading(false);
    }
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
          className="bg-white rounded-xl shadow-modal w-full max-w-2xl max-h-[90vh] overflow-hidden"
          initial={{ opacity: 0, scale: 0.9, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 50 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-display font-semibold text-gray-800">
              {recipe ? "Edit Recipe" : "Add New Recipe"}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <ApperIcon name="X" size={20} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-140px)] custom-scrollbar">
            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Recipe Name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Enter recipe name"
                  error={errors.name}
                  required
                />

                <Input
                  label="Servings"
                  type="number"
                  value={formData.servings}
                  onChange={(e) => handleInputChange("servings", e.target.value)}
                  placeholder="Number of servings"
                  error={errors.servings}
                  min="1"
                  required
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recipe Image
                </label>
                <div className="flex items-start gap-4">
                  {formData.image && (
                    <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={formData.image}
                        alt="Recipe preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary file:text-white hover:file:bg-orange-600"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Upload an image (max 5MB)
                    </p>
                  </div>
                </div>
              </div>

              {/* Nutrition Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Input
                  label="Prep Time (min)"
                  type="number"
                  value={formData.prepTime}
                  onChange={(e) => handleInputChange("prepTime", e.target.value)}
                  placeholder="30"
                  error={errors.prepTime}
                  min="1"
                  required
                />

                <Input
                  label="Calories"
                  type="number"
                  value={formData.calories}
                  onChange={(e) => handleInputChange("calories", e.target.value)}
                  placeholder="350"
                  error={errors.calories}
                  min="1"
                  required
                />

                <Input
                  label="Protein (g)"
                  type="number"
                  step="0.1"
                  value={formData.protein}
                  onChange={(e) => handleInputChange("protein", e.target.value)}
                  placeholder="25"
                />

                <Input
                  label="Carbs (g)"
                  type="number"
                  step="0.1"
                  value={formData.carbs}
                  onChange={(e) => handleInputChange("carbs", e.target.value)}
                  placeholder="30"
                />
              </div>

              <Input
                label="Fat (g)"
                type="number"
                step="0.1"
                value={formData.fat}
                onChange={(e) => handleInputChange("fat", e.target.value)}
                placeholder="15"
                className="md:w-1/4"
              />

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Diet Tags
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableTags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleTagToggle(tag)}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200",
                        formData.tags.includes(tag)
                          ? "bg-primary text-white border-primary"
                          : "bg-gray-50 text-gray-600 border-gray-200 hover:border-primary hover:text-primary"
                      )}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ingredients */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Ingredients
                  </label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    icon="Plus"
                    onClick={addIngredient}
                  >
                    Add
                  </Button>
                </div>
                <div className="space-y-2">
                  {formData.ingredients.map((ingredient, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={ingredient}
                        onChange={(e) => handleIngredientChange(index, e.target.value)}
                        placeholder={`Ingredient ${index + 1}`}
                        className="flex-1"
                      />
                      {formData.ingredients.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          icon="X"
                          onClick={() => removeIngredient(index)}
                          className="flex-shrink-0 w-10 h-10 p-0"
                        />
                      )}
                    </div>
                  ))}
                </div>
                {errors.ingredients && (
                  <p className="text-sm text-error font-medium mt-1">{errors.ingredients}</p>
                )}
              </div>

              {/* Instructions */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Instructions
                  </label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    icon="Plus"
                    onClick={addInstruction}
                  >
                    Add
                  </Button>
                </div>
                <div className="space-y-2">
                  {formData.instructions.map((instruction, index) => (
                    <div key={index} className="flex gap-2 items-start">
                      <div className="flex-shrink-0 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-medium mt-2">
                        {index + 1}
                      </div>
                      <TextArea
                        value={instruction}
                        onChange={(e) => handleInstructionChange(index, e.target.value)}
                        placeholder={`Step ${index + 1}`}
                        rows={2}
                        className="flex-1"
                      />
                      {formData.instructions.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          icon="X"
                          onClick={() => removeInstruction(index)}
                          className="flex-shrink-0 w-10 h-10 p-0 mt-2"
                        />
                      )}
                    </div>
                  ))}
                </div>
                {errors.instructions && (
                  <p className="text-sm text-error font-medium mt-1">{errors.instructions}</p>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-6 bg-gray-50 border-t border-gray-200">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={loading}
                disabled={loading}
              >
                {recipe ? "Update Recipe" : "Save Recipe"}
              </Button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default RecipeModal;