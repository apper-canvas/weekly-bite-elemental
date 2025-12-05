import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { getWeekDays, getDayName, formatDate, getShortDayName } from "@/utils/dateUtils";
import { cn } from "@/utils/cn";
import MealSlot from "@/components/molecules/MealSlot";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import ErrorView from "@/components/ui/ErrorView";
import Empty from "@/components/ui/Empty";
import { mealPlanService } from "@/services/api/mealPlanService";
import { recipeService } from "@/services/api/recipeService";
import { toast } from "react-toastify";

const CalendarGrid = ({ 
  currentWeek, 
recipes = [],
  onWeekChange,
  onAddMeal
}) => {
  const [meals, setMeals] = useState({});
  const [loading, setLoading] = useState(true);
const [error, setError] = useState("");
  const [recipeLookup, setRecipeLookup] = useState({});
  const [duplicateModal, setDuplicateModal] = useState({
    isOpen: false,
    sourceDay: ""
  });
  const weekDays = getWeekDays(currentWeek);
  const mealTypes = ["breakfast", "lunch", "dinner", "snacks"];

useEffect(() => {
    if (currentWeek) {
      loadWeekPlan();
    }
  }, [currentWeek]);

  useEffect(() => {
    // Build recipe lookup for quick access
    const lookup = {};
    recipes.forEach(recipe => {
      lookup[recipe.id] = recipe;
    });
    setRecipeLookup(lookup);
  }, [recipes]);

  const loadWeekPlan = async () => {
    if (!currentWeek) return;
    
    try {
      setLoading(true);
      setError("");
      const weekPlan = await mealPlanService.getWeekPlan(currentWeek);
      setMeals(weekPlan.meals || {});
    } catch (err) {
      setError(err.message);
      console.error("Failed to load week plan:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = async (day, mealType, recipeId) => {
    try {
      await mealPlanService.addMeal(currentWeek, day, mealType, recipeId);
      
      const mealKey = `${day}-${mealType}`;
      setMeals(prev => ({
        ...prev,
        [mealKey]: {
          day,
          mealType,
          recipeId,
          addedAt: new Date().toISOString()
        }
      }));

      const recipe = recipeLookup[recipeId];
      toast.success(`Added ${recipe?.name} to ${mealType}`);
    } catch (err) {
      toast.error("Failed to add meal");
      console.error("Failed to add meal:", err);
    }
  };

  const handleRemoveMeal = async (day, mealType) => {
    try {
      await mealPlanService.removeMeal(currentWeek, day, mealType);
      
      const mealKey = `${day}-${mealType}`;
      setMeals(prev => {
        const updated = { ...prev };
        delete updated[mealKey];
        return updated;
      });

      toast.success("Meal removed");
    } catch (err) {
      toast.error("Failed to remove meal");
      console.error("Failed to remove meal:", err);
    }
  };

const handleDuplicateDay = (sourceDay) => {
    setDuplicateModal({
      isOpen: true,
      sourceDay
    });
  };
  const handleDuplicateConfirm = async (fromDay, toDay) => {
    try {
      await mealPlanService.copyDay(currentWeek, fromDay, toDay);
      await loadWeekPlan(); // Reload to get updated data
      toast.success(`Duplicated meals from ${getDayName(new Date(fromDay))} to ${getDayName(new Date(toDay))}`);
    } catch (err) {
      toast.error("Failed to duplicate day");
      console.error("Failed to duplicate day:", err);
    }
  };

  const handleCloseDuplicateModal = () => {
    setDuplicateModal({
      isOpen: false,
      sourceDay: ""
    });
  };

  const getMealsForDay = (day) => {
    const dayStr = formatDate(day);
    return mealTypes.map(mealType => {
      const mealKey = `${dayStr}-${mealType}`;
      const meal = meals[mealKey];
      const recipe = meal?.recipeId ? recipeLookup[meal.recipeId] : null;
      
      return {
        mealType,
        recipe
      };
    });
  };

  const getTotalDayCalories = (day) => {
    const dayMeals = getMealsForDay(day);
    return dayMeals.reduce((total, meal) => {
      return total + (meal.recipe?.calories || 0);
    }, 0);
  };

  const hasMealsForDay = (day) => {
    const dayMeals = getMealsForDay(day);
    return dayMeals.some(meal => meal.recipe);
  };

  if (loading) {
    return <Loading type="calendar" />;
  }

  if (error) {
    return (
      <ErrorView
        title="Failed to load meal plan"
        message={error}
        onRetry={loadWeekPlan}
      />
    );
  }

  const hasAnyMeals = Object.keys(meals).length > 0;

  if (!hasAnyMeals && recipes.length === 0) {
    return (
      <Empty
        title="Start planning your week"
        message="Add some recipes first, then drag them to your calendar to create your meal plan."
        illustration="📅"
        action={() => onWeekChange && onWeekChange("recipes")}
        actionText="Add Recipes"
        icon="BookOpen"
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Calendar Grid - Desktop */}
      <div className="hidden md:grid md:grid-cols-7 gap-4">
{weekDays.map((day, dayIndex) => {
          const dayStr = formatDate(day);
          const dayMeals = getMealsForDay(day);
          const totalCalories = getTotalDayCalories(day);
          const hasMeals = hasMealsForDay(day);

          return (
            <motion.div
              key={dayStr}
              className="bg-white rounded-xl shadow-card p-4 group"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: dayIndex * 0.1 }}
            >
              {/* Day Header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-display font-semibold text-gray-800">
                    {getDayName(day)}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {day.getDate()}
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  {hasMeals && (
                    <>
                      <div className="text-right">
                        <div className="text-xs text-gray-500">Total</div>
                        <div className="text-sm font-semibold text-primary">
                          {totalCalories} cal
                        </div>
                      </div>
                      
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="sm"
                          variant="ghost"
                          icon="Copy"
                          onClick={() => handleDuplicateDay(dayStr)}
                          className="w-8 h-8 p-0"
                          title="Duplicate day to another day"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Meal Slots */}
              <div className="space-y-3">
                {dayMeals.map(({ mealType, recipe }) => (
                  <MealSlot
                    key={`${dayStr}-${mealType}`}
                    day={dayStr}
                    mealType={mealType}
                    recipe={recipe}
onDrop={handleDrop}
                    onRemove={handleRemoveMeal}
                    onAdd={onAddMeal}
                  />
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Calendar - Mobile Stacked */}
      <div className="md:hidden space-y-4">
        {weekDays.map((day, dayIndex) => {
          const dayStr = formatDate(day);
          const dayMeals = getMealsForDay(day);
          const totalCalories = getTotalDayCalories(day);
          const hasMeals = hasMealsForDay(day);

          return (
            <motion.div
key={dayStr}
              className="bg-white rounded-xl shadow-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: dayIndex * 0.1 }}
            >
              {/* Mobile Day Header */}
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-display font-semibold text-gray-800">
                      {getDayName(day)}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {day.toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {hasMeals && (
                      <>
                        <div className="text-right">
                          <div className="text-xs text-gray-500">Total</div>
                          <div className="text-sm font-semibold text-primary">
                            {totalCalories} cal
                          </div>
                        </div>
                        
                        <Button
                          size="sm"
                          variant="ghost"
                          icon="Copy"
                          onClick={() => handleDuplicateDay(dayStr)}
                          className="w-8 h-8 p-0"
                          title="Duplicate day"
                        />
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Mobile Meal Slots */}
              <div className="p-4 space-y-3">
                {dayMeals.map(({ mealType, recipe }) => (
                  <MealSlot
                    key={`${dayStr}-${mealType}`}
                    day={dayStr}
                    mealType={mealType}
                    recipe={recipe}
onDrop={handleDrop}
                    onRemove={handleRemoveMeal}
                    onAdd={onAddMeal}
                  />
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarGrid;