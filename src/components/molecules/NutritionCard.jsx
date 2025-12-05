import { motion } from "framer-motion";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";

const NutritionCard = ({ 
  title, 
  calories, 
  macros, 
  target,
  className 
}) => {
  const calorieProgress = target ? (calories / target) * 100 : 0;
  const progressColor = calorieProgress > 100 ? "text-error" : "text-secondary";

  return (
    <motion.div
      className={cn(
        "bg-white rounded-xl shadow-card p-6",
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-semibold text-gray-800">
          {title}
        </h3>
        <ApperIcon name="TrendingUp" size={20} className="text-gray-400" />
      </div>

      {/* Calories */}
      <div className="mb-6">
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-3xl font-bold text-gray-800">
            {calories.toLocaleString()}
          </span>
          <span className="text-sm text-gray-500">calories</span>
          {target && (
            <span className={cn("text-sm font-medium", progressColor)}>
              / {target.toLocaleString()}
            </span>
          )}
        </div>
        
        {target && (
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={cn(
                "h-2 rounded-full transition-all duration-500",
                calorieProgress > 100 
                  ? "bg-gradient-to-r from-error to-red-600" 
                  : "bg-gradient-to-r from-secondary to-emerald-500"
              )}
              style={{ width: `${Math.min(calorieProgress, 100)}%` }}
            />
          </div>
        )}
      </div>

      {/* Macros */}
      {macros && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full" />
              <span className="text-sm text-gray-600">Protein</span>
            </div>
            <span className="text-sm font-medium text-gray-800">
              {Math.round(macros.protein)}g
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full" />
              <span className="text-sm text-gray-600">Carbs</span>
            </div>
            <span className="text-sm font-medium text-gray-800">
              {Math.round(macros.carbs)}g
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full" />
              <span className="text-sm text-gray-600">Fat</span>
            </div>
            <span className="text-sm font-medium text-gray-800">
              {Math.round(macros.fat)}g
            </span>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default NutritionCard;