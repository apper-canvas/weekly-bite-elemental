export const calculateMealCalories = (recipe) => {
  if (!recipe) return 0;
  return recipe.calories || 0;
};

export const calculateDayCalories = (meals) => {
  return meals.reduce((total, meal) => {
    if (meal.recipe) {
      return total + calculateMealCalories(meal.recipe);
    }
    return total;
  }, 0);
};

export const calculateWeekCalories = (weekMeals) => {
  return Object.values(weekMeals).reduce((total, dayMeals) => {
    return total + calculateDayCalories(dayMeals);
  }, 0);
};

export const calculateMacros = (recipe) => {
  if (!recipe) return { protein: 0, carbs: 0, fat: 0 };
  
  return {
    protein: recipe.protein || 0,
    carbs: recipe.carbs || 0,
    fat: recipe.fat || 0
  };
};

export const calculateDayMacros = (meals) => {
  return meals.reduce((total, meal) => {
    if (meal.recipe) {
      const macros = calculateMacros(meal.recipe);
      return {
        protein: total.protein + macros.protein,
        carbs: total.carbs + macros.carbs,
        fat: total.fat + macros.fat
      };
    }
    return total;
  }, { protein: 0, carbs: 0, fat: 0 });
};

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