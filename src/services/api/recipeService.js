import recipesData from "@/services/mockData/recipes.json";
import { storage } from "@/utils/storage";

class RecipeService {
  constructor() {
    this.storeName = "recipes";
    this.initialized = false;
  }

  async init() {
    if (this.initialized) return;
    
    try {
      await storage.init();
      const existingRecipes = await storage.getAll(this.storeName);
      
      if (existingRecipes.length === 0) {
        // Load default recipes
        for (const recipe of recipesData) {
          await storage.set(this.storeName, recipe);
        }
      }
      
      this.initialized = true;
    } catch (error) {
      console.error("Failed to initialize recipe service:", error);
      throw new Error("Unable to load recipes");
    }
  }

  async getAll() {
    await this.init();
    await this.delay();
    
    try {
      const recipes = await storage.getAll(this.storeName);
      return [...recipes].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } catch (error) {
      console.error("Failed to load recipes:", error);
      throw new Error("Unable to load recipes");
    }
  }

  async getById(id) {
    await this.init();
    await this.delay();
    
    try {
      const recipe = await storage.get(this.storeName, id);
      return recipe ? { ...recipe } : null;
    } catch (error) {
      console.error("Failed to load recipe:", error);
      throw new Error("Unable to load recipe");
    }
  }

  async getFavorites() {
    await this.init();
    await this.delay();
    
    try {
      const recipes = await storage.getAll(this.storeName);
      return recipes.filter(recipe => recipe.isFavorite);
    } catch (error) {
      console.error("Failed to load favorite recipes:", error);
      throw new Error("Unable to load favorites");
    }
  }

  async search(query, tags = []) {
    await this.init();
    await this.delay();
    
    try {
      const recipes = await storage.getAll(this.storeName);
      
      return recipes.filter(recipe => {
        const matchesQuery = !query || 
          recipe.name.toLowerCase().includes(query.toLowerCase()) ||
          recipe.ingredients.some(ingredient => 
            ingredient.toLowerCase().includes(query.toLowerCase())
          );
        
        const matchesTags = tags.length === 0 || 
          tags.every(tag => recipe.tags.includes(tag));
        
        return matchesQuery && matchesTags;
      });
    } catch (error) {
      console.error("Failed to search recipes:", error);
      throw new Error("Unable to search recipes");
    }
  }

  async create(recipeData) {
    await this.init();
    await this.delay();
    
    try {
      const recipes = await storage.getAll(this.storeName);
      const maxId = recipes.reduce((max, recipe) => 
        Math.max(max, parseInt(recipe.id) || 0), 0
      );
      
      const newRecipe = {
        ...recipeData,
        id: String(maxId + 1),
        createdAt: new Date().toISOString(),
        isFavorite: false
      };
      
      await storage.set(this.storeName, newRecipe);
      return { ...newRecipe };
    } catch (error) {
      console.error("Failed to create recipe:", error);
      throw new Error("Unable to save recipe");
    }
  }

  async update(id, updates) {
    await this.init();
    await this.delay();
    
    try {
      const existing = await storage.get(this.storeName, id);
      if (!existing) {
        throw new Error("Recipe not found");
      }
      
      const updated = { ...existing, ...updates };
      await storage.set(this.storeName, updated);
      return { ...updated };
    } catch (error) {
      console.error("Failed to update recipe:", error);
      throw new Error("Unable to update recipe");
    }
  }

  async delete(id) {
    await this.init();
    await this.delay();
    
    try {
      await storage.delete(this.storeName, id);
    } catch (error) {
      console.error("Failed to delete recipe:", error);
      throw new Error("Unable to delete recipe");
    }
  }

  async toggleFavorite(id) {
    await this.init();
    await this.delay();
    
    try {
      const recipe = await storage.get(this.storeName, id);
      if (!recipe) {
        throw new Error("Recipe not found");
      }
      
      const updated = { ...recipe, isFavorite: !recipe.isFavorite };
      await storage.set(this.storeName, updated);
      return { ...updated };
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
      throw new Error("Unable to update favorite status");
    }
  }

  delay() {
    return new Promise(resolve => setTimeout(resolve, 300));
  }
}

export const recipeService = new RecipeService();