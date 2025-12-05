import { storage } from "@/utils/storage";
import { formatDate } from "@/utils/dateUtils";
import { recipeService } from "./recipeService";

class ShoppingListService {
  constructor() {
    this.storeName = "shoppingLists";
    this.initialized = false;
  }

  async init() {
    if (this.initialized) return;
    
    try {
      await storage.init();
      this.initialized = true;
    } catch (error) {
      console.error("Failed to initialize shopping list service:", error);
      throw new Error("Unable to initialize shopping lists");
    }
  }

  async getWeekShoppingList(weekStart) {
    await this.init();
    await this.delay();
    
    try {
      const weekKey = formatDate(weekStart);
      const shoppingList = await storage.get(this.storeName, weekKey);
      
      if (!shoppingList) {
        return this.createEmptyShoppingList(weekStart);
      }
      
      return { ...shoppingList };
    } catch (error) {
      console.error("Failed to load shopping list:", error);
      throw new Error("Unable to load shopping list");
    }
  }

  async generateFromMealPlan(weekStart, meals) {
    await this.init();
    await this.delay();
    
    try {
      const ingredients = new Map();
      const recipeIds = Object.values(meals)
        .filter(meal => meal.recipeId)
        .map(meal => meal.recipeId);
      
      // Get all recipes for the week
      const recipes = await Promise.all(
        recipeIds.map(id => recipeService.getById(id))
      );
      
      // Aggregate ingredients
      recipes.forEach(recipe => {
        if (recipe && recipe.ingredients) {
          recipe.ingredients.forEach(ingredient => {
            const key = ingredient.toLowerCase().trim();
            if (ingredients.has(key)) {
              ingredients.set(key, ingredients.get(key) + 1);
            } else {
              ingredients.set(key, 1);
            }
          });
        }
      });
      
      // Convert to shopping list items
      const items = Array.from(ingredients.entries()).map(([ingredient, count], index) => ({
        id: String(index + 1),
        name: ingredient,
        category: this.categorizeIngredient(ingredient),
        quantity: count > 1 ? `${count}x` : "",
        isChecked: false,
        fromRecipeId: null
      }));
      
      const shoppingList = {
        weekStart: formatDate(weekStart),
        items,
        customItems: [],
        generatedAt: new Date().toISOString()
      };
      
      await storage.set(this.storeName, shoppingList);
      return { ...shoppingList };
    } catch (error) {
      console.error("Failed to generate shopping list:", error);
      throw new Error("Unable to generate shopping list");
    }
  }

  async updateItem(weekStart, itemId, updates) {
    await this.init();
    await this.delay();
    
    try {
      const shoppingList = await this.getWeekShoppingList(weekStart);
      const itemIndex = shoppingList.items.findIndex(item => item.id === itemId);
      
      if (itemIndex === -1) {
        throw new Error("Item not found");
      }
      
      shoppingList.items[itemIndex] = {
        ...shoppingList.items[itemIndex],
        ...updates
      };
      
      await storage.set(this.storeName, shoppingList);
      return { ...shoppingList };
    } catch (error) {
      console.error("Failed to update shopping item:", error);
      throw new Error("Unable to update item");
    }
  }

  async addCustomItem(weekStart, itemName, category = "other") {
    await this.init();
    await this.delay();
    
    try {
      const shoppingList = await this.getWeekShoppingList(weekStart);
      const maxId = Math.max(
        ...shoppingList.items.map(item => parseInt(item.id) || 0),
        ...shoppingList.customItems.map(item => parseInt(item.id) || 0),
        0
      );
      
      const newItem = {
        id: String(maxId + 1),
        name: itemName.trim(),
        category: category,
        quantity: "",
        isChecked: false,
        fromRecipeId: null,
        isCustom: true
      };
      
      shoppingList.customItems.push(newItem);
      
      await storage.set(this.storeName, shoppingList);
      return { ...shoppingList };
    } catch (error) {
      console.error("Failed to add custom item:", error);
      throw new Error("Unable to add item");
    }
  }

  async removeCustomItem(weekStart, itemId) {
    await this.init();
    await this.delay();
    
    try {
      const shoppingList = await this.getWeekShoppingList(weekStart);
      shoppingList.customItems = shoppingList.customItems.filter(
        item => item.id !== itemId
      );
      
      await storage.set(this.storeName, shoppingList);
      return { ...shoppingList };
    } catch (error) {
      console.error("Failed to remove custom item:", error);
      throw new Error("Unable to remove item");
    }
  }

  async getShoppingListText(weekStart) {
    await this.init();
    
    try {
      const shoppingList = await this.getWeekShoppingList(weekStart);
      const allItems = [...shoppingList.items, ...shoppingList.customItems];
      
      const categories = this.groupByCategory(allItems);
      let text = `Shopping List - Week of ${weekStart.toDateString()}\n\n`;
      
      Object.entries(categories).forEach(([category, items]) => {
        text += `${category.toUpperCase()}:\n`;
        items.forEach(item => {
          const checked = item.isChecked ? "✓" : "☐";
          const quantity = item.quantity ? `(${item.quantity}) ` : "";
          text += `${checked} ${quantity}${item.name}\n`;
        });
        text += "\n";
      });
      
      return text;
    } catch (error) {
      console.error("Failed to generate shopping list text:", error);
      throw new Error("Unable to generate list text");
    }
  }

  categorizeIngredient(ingredient) {
    const lowerIngredient = ingredient.toLowerCase();
    
    const categories = {
      produce: ["lettuce", "tomato", "onion", "garlic", "ginger", "cucumber", "bell pepper", "carrot", "broccoli", "spinach", "avocado", "lime", "lemon", "herb", "parsley", "dill", "basil", "cilantro", "mushroom", "zucchini", "snap pea"],
      dairy: ["cheese", "milk", "butter", "yogurt", "cream", "feta", "mozzarella", "parmesan", "cottage cheese"],
      meat: ["chicken", "beef", "pork", "salmon", "fish", "turkey", "bacon", "ham", "ground beef"],
      pantry: ["rice", "quinoa", "pasta", "bread", "flour", "sugar", "salt", "pepper", "oil", "vinegar", "soy sauce", "honey", "spice", "oregano", "cumin", "paprika"],
      condiments: ["sauce", "dressing", "mayo", "mustard", "ketchup", "tahini", "paste"],
      other: []
    };
    
    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => lowerIngredient.includes(keyword))) {
        return category;
      }
    }
    
    return "other";
  }

  groupByCategory(items) {
    return items.reduce((groups, item) => {
      const category = item.category || "other";
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(item);
      return groups;
    }, {});
  }

  createEmptyShoppingList(weekStart) {
    return {
      weekStart: formatDate(weekStart),
      items: [],
      customItems: [],
      createdAt: new Date().toISOString()
    };
  }

  delay() {
    return new Promise(resolve => setTimeout(resolve, 250));
  }
}

export const shoppingListService = new ShoppingListService();