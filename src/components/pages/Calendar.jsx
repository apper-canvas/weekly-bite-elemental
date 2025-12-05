import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { getWeekStart, getWeekDateRange } from "@/utils/dateUtils";
import CalendarGrid from "@/components/organisms/CalendarGrid";
import FavoritesSidebar from "@/components/organisms/FavoritesSidebar";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import ErrorView from "@/components/ui/ErrorView";
import { recipeService } from "@/services/api/recipeService";
import { addDays, subDays } from "date-fns";

const Calendar = () => {
  const [currentWeek, setCurrentWeek] = useState(getWeekStart());
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);

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

  const handlePreviousWeek = () => {
    setCurrentWeek(prev => subDays(prev, 7));
  };

  const handleNextWeek = () => {
    setCurrentWeek(prev => addDays(prev, 7));
  };

  const handleThisWeek = () => {
    setCurrentWeek(getWeekStart());
  };

  if (loading) {
    return <Loading type="calendar" />;
  }

  if (error) {
    return (
      <ErrorView
        title="Failed to load calendar"
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
            Weekly Meal Plan
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

      {/* Quick Actions */}
      <motion.div
        className="flex flex-wrap items-center gap-3 p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl border border-orange-200"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
      >
        <div className="flex items-center gap-2 text-gray-700">
          <ApperIcon name="Lightbulb" size={18} className="text-accent" />
          <span className="font-medium text-sm">Quick tip:</span>
        </div>
        <span className="text-sm text-gray-600">
          Drag recipes from favorites or browse recipes to add meals
        </span>
        <div className="hidden sm:block text-gray-300">•</div>
        <span className="text-sm text-gray-600">
          Click empty slots to search and add recipes
        </span>
      </motion.div>

      {/* Calendar Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
        <CalendarGrid
          currentWeek={currentWeek}
          recipes={recipes}
          onWeekChange={setCurrentWeek}
        />
      </motion.div>

      {/* Favorites Sidebar */}
      <FavoritesSidebar
        isOpen={isFavoritesOpen}
        onToggle={() => setIsFavoritesOpen(!isFavoritesOpen)}
        className="lg:right-6"
      />

      {/* Mobile Spacing for Bottom Navigation */}
      <div className="h-20 md:h-0" />
    </div>
  );
};

export default Calendar;