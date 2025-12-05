import { storage } from "@/utils/storage";
import { formatDate } from "@/utils/dateUtils";

class MealPlanService {
  constructor() {
    this.storeName = "mealPlans";
    this.initialized = false;
  }

  async init() {
    if (this.initialized) return;
    
    try {
      await storage.init();
      this.initialized = true;
    } catch (error) {
      console.error("Failed to initialize meal plan service:", error);
      throw new Error("Unable to initialize meal plans");
    }
  }

  async getWeekPlan(weekStart) {
    await this.init();
    await this.delay();
    
    try {
      const weekKey = formatDate(weekStart);
      const weekPlan = await storage.get(this.storeName, weekKey);
      
      if (!weekPlan) {
        return this.createEmptyWeekPlan(weekStart);
      }
      
      return { ...weekPlan };
    } catch (error) {
      console.error("Failed to load week plan:", error);
      throw new Error("Unable to load meal plan");
    }
  }

async saveWeekPlan(weekStart, meals) {
    await this.init();
    await this.delay();
    
    try {
      const weekKey = formatDate(weekStart);
      
      // Defensive validation: ensure meals is iterable
      let validatedMeals;
      if (meals == null) {
        validatedMeals = {};
      } else if (Array.isArray(meals)) {
        validatedMeals = [...meals];
      } else if (typeof meals === 'object' && meals[Symbol.iterator]) {
        // Handle other iterables (Set, Map, etc.)
        validatedMeals = [...meals];
      } else if (typeof meals === 'object') {
        // If meals is a plain object, preserve it as-is
        validatedMeals = { ...meals };
      } else {
        // For primitive values or other non-iterable types, default to empty object
        console.warn(`Expected meals to be iterable or object, got ${typeof meals}:`, meals);
        validatedMeals = {};
      }
      
      const weekPlan = {
        weekStart: weekKey,
        meals: validatedMeals,
        updatedAt: new Date().toISOString()
      };
      
      await storage.set(this.storeName, weekPlan);
      return { ...weekPlan };
    } catch (error) {
      console.error("Failed to save week plan:", error);
      throw new Error("Unable to save meal plan");
    }
  }

  async addMeal(weekStart, day, mealType, recipeId) {
    await this.init();
    
    try {
      const weekPlan = await this.getWeekPlan(weekStart);
      const mealKey = `${day}-${mealType}`;
      
      const updatedMeals = {
        ...weekPlan.meals,
        [mealKey]: {
          day,
          mealType,
          recipeId,
          addedAt: new Date().toISOString()
        }
      };
      
      return await this.saveWeekPlan(weekStart, updatedMeals);
    } catch (error) {
      console.error("Failed to add meal:", error);
      throw new Error("Unable to add meal");
    }
  }

  async removeMeal(weekStart, day, mealType) {
    await this.init();
    
    try {
      const weekPlan = await this.getWeekPlan(weekStart);
      const mealKey = `${day}-${mealType}`;
      
      const updatedMeals = { ...weekPlan.meals };
      delete updatedMeals[mealKey];
      
      return await this.saveWeekPlan(weekStart, updatedMeals);
    } catch (error) {
      console.error("Failed to remove meal:", error);
      throw new Error("Unable to remove meal");
    }
  }

  async copyDay(weekStart, fromDay, toDay) {
    await this.init();
    
    try {
      const weekPlan = await this.getWeekPlan(weekStart);
      const mealTypes = ["breakfast", "lunch", "dinner", "snacks"];
      
      const updatedMeals = { ...weekPlan.meals };
      
      // Clear existing meals for target day
      mealTypes.forEach(mealType => {
        const toKey = `${toDay}-${mealType}`;
        delete updatedMeals[toKey];
      });
      
      // Copy meals from source day
      mealTypes.forEach(mealType => {
        const fromKey = `${fromDay}-${mealType}`;
        const toKey = `${toDay}-${mealType}`;
        
        if (weekPlan.meals[fromKey]) {
          updatedMeals[toKey] = {
            ...weekPlan.meals[fromKey],
            day: toDay,
            addedAt: new Date().toISOString()
          };
        }
      });
      
      return await this.saveWeekPlan(weekStart, updatedMeals);
    } catch (error) {
      console.error("Failed to copy day:", error);
      throw new Error("Unable to copy meals");
    }
  }

  createEmptyWeekPlan(weekStart) {
    return {
      weekStart: formatDate(weekStart),
      meals: {},
      createdAt: new Date().toISOString()
    };
  }

  delay() {
    return new Promise(resolve => setTimeout(resolve, 200));
  }
}

export const mealPlanService = new MealPlanService();