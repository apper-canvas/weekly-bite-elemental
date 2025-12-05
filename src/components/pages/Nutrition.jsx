import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { getWeekStart, getWeekDays, getDayName, getWeekDateRange } from "@/utils/dateUtils";
import NutritionCard from "@/components/molecules/NutritionCard";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import ErrorView from "@/components/ui/ErrorView";
import Empty from "@/components/ui/Empty";
import { mealPlanService } from "@/services/api/mealPlanService";
import { recipeService } from "@/services/api/recipeService";
import { calculateDayCalories, calculateDayMacros } from "@/utils/nutritionUtils";
import { addDays, subDays, formatDate } from "date-fns";

const Nutrition = () => {
  const [currentWeek, setCurrentWeek] = useState(getWeekStart());
  const [weekMeals, setWeekMeals] = useState({});
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
  }, [currentWeek]);

  const loadData = async () => {
    if (!currentWeek) return;
    
    try {
      setLoading(true);
      setError("");
      
      // Load meal plan and recipes
      const [weekPlan, allRecipes] = await Promise.all([
        mealPlanService.getWeekPlan(currentWeek),
        recipeService.getAll()
      ]);
      
      setRecipes(allRecipes);
      
      // Build recipe lookup
      const recipeLookup = {};
      allRecipes.forEach(recipe => {
        recipeLookup[recipe.id] = recipe;
      });
      
      // Process meals by day
      const weekDays = getWeekDays(currentWeek);
      const dayMeals = {};
      
      weekDays.forEach(day => {
        const dayStr = formatDate(day);
        const mealTypes = ["breakfast", "lunch", "dinner", "snacks"];
        
        dayMeals[dayStr] = mealTypes.map(mealType => {
          const mealKey = `${dayStr}-${mealType}`;
          const meal = weekPlan.meals[mealKey];
          return {
            mealType,
            recipe: meal?.recipeId ? recipeLookup[meal.recipeId] : null
          };
        }).filter(meal => meal.recipe);
      });
      
      setWeekMeals(dayMeals);
    } catch (err) {
      setError(err.message);
      console.error("Failed to load nutrition data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePreviousWeek = () => {
    setCurrentWeek(prev => subDays(prev, 7));
  };

  const handleNextWeek = () => {
    setCurrentWeek(prev => addDays(prev, 7));
  };

  const handleThisWeek = () => {
    setCurrentWeek(getWeekStart());
  };

  const getWeekTotals = () => {
    const weekDays = getWeekDays(currentWeek);
    let totalCalories = 0;
    let totalMacros = { protein: 0, carbs: 0, fat: 0 };
    
    weekDays.forEach(day => {
      const dayStr = formatDate(day);
      const meals = weekMeals[dayStr] || [];
      
      totalCalories += calculateDayCalories(meals);
      const dayMacros = calculateDayMacros(meals);
      totalMacros.protein += dayMacros.protein;
      totalMacros.carbs += dayMacros.carbs;
      totalMacros.fat += dayMacros.fat;
    });
    
    return { totalCalories, totalMacros };
  };

  const getDailyAverages = () => {
    const { totalCalories, totalMacros } = getWeekTotals();
    const daysWithMeals = Object.values(weekMeals).filter(meals => meals.length > 0).length;
    
    if (daysWithMeals === 0) {
      return { avgCalories: 0, avgMacros: { protein: 0, carbs: 0, fat: 0 } };
    }
    
    return {
      avgCalories: Math.round(totalCalories / daysWithMeals),
      avgMacros: {
        protein: Math.round(totalMacros.protein / daysWithMeals),
        carbs: Math.round(totalMacros.carbs / daysWithMeals),
        fat: Math.round(totalMacros.fat / daysWithMeals)
      }
    };
  };

  const getMostCookedRecipes = () => {
    const recipeCounts = {};
    
    Object.values(weekMeals).forEach(meals => {
      meals.forEach(meal => {
        if (meal.recipe) {
          recipeCounts[meal.recipe.id] = (recipeCounts[meal.recipe.id] || 0) + 1;
        }
      });
    });
    
    return Object.entries(recipeCounts)
      .map(([recipeId, count]) => ({
        recipe: recipes.find(r => r.id === recipeId),
        count
      }))
      .filter(item => item.recipe)
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <ErrorView
        title="Failed to load nutrition data"
        message={error}
        onRetry={loadData}
      />
    );
  }

  const weekDays = getWeekDays(currentWeek);
  const weekTotals = getWeekTotals();
  const dailyAverages = getDailyAverages();
  const topRecipes = getMostCookedRecipes();
  const hasMeals = Object.values(weekMeals).some(meals => meals.length > 0);

  if (!hasMeals) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-3xl font-display font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Nutrition Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            {getWeekDateRange(currentWeek)}
          </p>
        </motion.div>

        <Empty
          title="No nutrition data available"
          message="Add meals to your weekly calendar to see nutrition insights and tracking."
          illustration="📊"
          action={() => window.location.href = "/"}
          actionText="Plan Meals"
          icon="Calendar"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <motion.div
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div>
          <h1 className="text-3xl font-display font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Nutrition Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            {getWeekDateRange(currentWeek)}
          </p>
        </div>

        {/* Week Navigation */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            icon="ChevronLeft"
            onClick={handlePreviousWeek}
          />
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleThisWeek}
            className="min-w-[100px]"
          >
            This Week
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            icon="ChevronRight"
            iconPosition="right"
            onClick={handleNextWeek}
          />
        </div>
      </motion.div>

      {/* Overview Cards */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
      >
        <NutritionCard
          title="Weekly Total"
          calories={weekTotals.totalCalories}
          macros={weekTotals.totalMacros}
        />
        
        <NutritionCard
          title="Daily Average"
          calories={dailyAverages.avgCalories}
          macros={dailyAverages.avgMacros}
          target={2000} // Standard daily calorie target
        />
        
        <div className="bg-white rounded-xl shadow-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-accent to-yellow-500 rounded-lg flex items-center justify-center">
              <ApperIcon name="TrendingUp" size={20} className="text-white" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-gray-800">
                Week Insights
              </h3>
              <p className="text-sm text-gray-600">
                Planning overview
              </p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Planned days</span>
              <span className="font-semibold text-gray-800">
                {Object.values(weekMeals).filter(meals => meals.length > 0).length} / 7
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total meals</span>
              <span className="font-semibold text-gray-800">
                {Object.values(weekMeals).reduce((total, meals) => total + meals.length, 0)}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Unique recipes</span>
              <span className="font-semibold text-gray-800">
                {new Set(Object.values(weekMeals).flat().map(meal => meal.recipe?.id).filter(Boolean)).size}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Daily Breakdown */}
      <motion.div
        className="bg-white rounded-xl shadow-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
        <div className="p-6 border-b border-gray-200">
          <h3 className="font-display font-semibold text-gray-800 text-lg">
            Daily Nutrition Breakdown
          </h3>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
            {weekDays.map((day) => {
              const dayStr = formatDate(day);
              const dayMeals = weekMeals[dayStr] || [];
              const dayCalories = calculateDayCalories(dayMeals);
              const dayMacros = calculateDayMacros(dayMeals);
              
              return (
                <motion.div
                  key={dayStr}
                  className="bg-gray-50 rounded-lg p-4 text-center"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="font-medium text-gray-800 mb-2">
                    {getDayName(day)}
                  </div>
                  <div className="text-xs text-gray-500 mb-3">
                    {day.getDate()}
                  </div>
                  
                  {dayMeals.length === 0 ? (
                    <div className="text-xs text-gray-400">
                      No meals planned
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="text-lg font-bold text-primary">
                        {dayCalories}
                      </div>
                      <div className="text-xs text-gray-500">calories</div>
                      
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-600">P:</span>
                          <span>{Math.round(dayMacros.protein)}g</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">C:</span>
                          <span>{Math.round(dayMacros.carbs)}g</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">F:</span>
                          <span>{Math.round(dayMacros.fat)}g</span>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Top Recipes */}
      {topRecipes.length > 0 && (
        <motion.div
          className="bg-white rounded-xl shadow-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
        >
          <div className="p-6 border-b border-gray-200">
            <h3 className="font-display font-semibold text-gray-800 text-lg">
              Most Cooked This Week
            </h3>
          </div>
          
          <div className="p-6">
            <div className="space-y-4">
              {topRecipes.map((item, index) => (
                <div key={item.recipe.id} className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {index + 1}
                    </span>
                  </div>
                  
                  <img
                    src={item.recipe.image}
                    alt={item.recipe.name}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-800">
                      {item.recipe.name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      Cooked {item.count} time{item.count !== 1 ? "s" : ""} • {item.recipe.calories} cal per serving
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-lg font-semibold text-primary">
                      {item.recipe.calories * item.count}
                    </div>
                    <div className="text-xs text-gray-500">total calories</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Mobile Spacing for Bottom Navigation */}
      <div className="h-20 md:h-0" />
    </div>
  );
};

export default Nutrition;