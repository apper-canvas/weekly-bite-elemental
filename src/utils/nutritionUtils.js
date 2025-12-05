export const getMealTypeColor = (mealType) => {
  const colors = {
    breakfast: "bg-gradient-to-r from-yellow-400 to-orange-400",
    lunch: "bg-gradient-to-r from-orange-500 to-red-400", 
    dinner: "bg-gradient-to-r from-red-600 to-orange-600",
    snacks: "bg-gradient-to-r from-green-400 to-emerald-500"
  };
  return colors[mealType] || colors.breakfast;
};

export const getMealTypeTextColor = (mealType) => {
  return "text-white";
};

// Helper function to get default nutritional values for a recipe
const getRecipeNutrition = (recipe) => {
  if (!recipe) return { calories: 0, protein: 0, carbs: 0, fat: 0 };
  
  return {
    calories: recipe.calories || 0,
    protein: recipe.protein || 0,
    carbs: recipe.carbs || 0,
    fat: recipe.fat || 0
  };
};

// Calculate total calories for a specific day
export const calculateDayCalories = (meals) => {
  if (!meals || !Array.isArray(meals)) return 0;
  
  return meals.reduce((total, meal) => {
    if (!meal || !meal.recipes || !Array.isArray(meal.recipes)) return total;
    
    const mealCalories = meal.recipes.reduce((mealTotal, recipe) => {
      const nutrition = getRecipeNutrition(recipe);
      return mealTotal + nutrition.calories;
    }, 0);
    
    return total + mealCalories;
  }, 0);
};

// Calculate macronutrients for a specific day
export const calculateDayMacros = (meals) => {
  if (!meals || !Array.isArray(meals)) {
    return { protein: 0, carbs: 0, fat: 0 };
  }
  
  return meals.reduce((totals, meal) => {
    if (!meal || !meal.recipes || !Array.isArray(meal.recipes)) return totals;
    
    const mealMacros = meal.recipes.reduce((mealTotals, recipe) => {
      const nutrition = getRecipeNutrition(recipe);
      return {
        protein: mealTotals.protein + nutrition.protein,
        carbs: mealTotals.carbs + nutrition.carbs,
        fat: mealTotals.fat + nutrition.fat
      };
    }, { protein: 0, carbs: 0, fat: 0 });
    
    return {
      protein: totals.protein + mealMacros.protein,
      carbs: totals.carbs + mealMacros.carbs,
      fat: totals.fat + mealMacros.fat
    };
  }, { protein: 0, carbs: 0, fat: 0 });
};

// Calculate trends for a week
export const calculateWeekTrends = (weekData) => {
  if (!weekData || !Array.isArray(weekData)) {
    return { avgCalories: 0, avgProtein: 0, avgCarbs: 0, avgFat: 0, dailyTrends: [] };
  }
  
  const dailyTrends = weekData.map(dayData => {
    const calories = calculateDayCalories(dayData.meals);
    const macros = calculateDayMacros(dayData.meals);
    
    return {
      date: dayData.date,
      calories,
      ...macros
    };
  });
  
  const totalDays = dailyTrends.length || 1;
  const totals = dailyTrends.reduce((acc, day) => ({
    calories: acc.calories + day.calories,
    protein: acc.protein + day.protein,
    carbs: acc.carbs + day.carbs,
    fat: acc.fat + day.fat
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
  
  return {
    avgCalories: Math.round(totals.calories / totalDays),
    avgProtein: Math.round(totals.protein / totalDays),
    avgCarbs: Math.round(totals.carbs / totalDays),
    avgFat: Math.round(totals.fat / totalDays),
    dailyTrends
  };
};

// Get historical nutrition data for a specific week
export const getHistoricalData = async (weekStart) => {
  try {
    // Get stored meal plans for the week
    const storedPlans = localStorage.getItem('mealPlans');
    const mealPlans = storedPlans ? JSON.parse(storedPlans) : {};
    
    const weekData = [];
    
    // Generate 7 days of data starting from weekStart
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(weekStart);
      currentDate.setDate(currentDate.getDate() + i);
      const dateKey = currentDate.toISOString().split('T')[0];
      
      const dayMeals = mealPlans[dateKey] || [];
      weekData.push({
        date: dateKey,
        meals: dayMeals
      });
    }
    
    return calculateWeekTrends(weekData);
  } catch (error) {
    console.error('Error loading historical nutrition data:', error);
    return { avgCalories: 0, avgProtein: 0, avgCarbs: 0, avgFat: 0, dailyTrends: [] };
  }
};