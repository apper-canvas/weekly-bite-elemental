import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getDayName, formatDate } from "@/utils/dateUtils";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";

const DuplicateDayModal = ({ isOpen, onClose, onDuplicate, weekDays, getMealsForDay, sourceDay }) => {
  const [selectedDay, setSelectedDay] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleDaySelect = (day) => {
    const dayStr = formatDate(day);
    
    // Don't allow copying to the same day
    if (dayStr === sourceDay) return;
    
    setSelectedDay(dayStr);
    
    // Check if target day has existing meals
    const targetDayMeals = getMealsForDay(day);
    const hasExistingMeals = targetDayMeals.some(({ recipe }) => recipe);
    
    if (hasExistingMeals) {
      setShowConfirmation(true);
    } else {
      handleConfirm(dayStr);
    }
  };

  const handleConfirm = (targetDay = selectedDay) => {
    onDuplicate(sourceDay, targetDay);
    handleClose();
  };

  const handleClose = () => {
    setSelectedDay("");
    setShowConfirmation(false);
    onClose();
  };

  const sourceDayName = sourceDay ? getDayName(new Date(sourceDay)) : "";
  const selectedDayObj = selectedDay ? weekDays.find(day => formatDate(day) === selectedDay) : null;
  const selectedDayMeals = selectedDayObj ? getMealsForDay(selectedDayObj) : [];
  const selectedDayHasMeals = selectedDayMeals.some(({ recipe }) => recipe);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-xl shadow-modal w-full max-w-md">
              {!showConfirmation ? (
                <>
                  {/* Header */}
                  <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <div>
                      <h3 className="text-lg font-display font-semibold text-gray-800">
                        Duplicate Day
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Copy all meals from {sourceDayName} to another day
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon="X"
                      onClick={handleClose}
                      className="w-8 h-8 p-0"
                    />
                  </div>

                  {/* Day Selection */}
                  <div className="p-6">
                    <p className="text-sm font-medium text-gray-700 mb-4">
                      Select target day:
                    </p>
                    <div className="space-y-2">
                      {weekDays.map((day) => {
                        const dayStr = formatDate(day);
                        const dayMeals = getMealsForDay(day);
                        const hasMeals = dayMeals.some(({ recipe }) => recipe);
                        const isSourceDay = dayStr === sourceDay;
                        const mealCount = dayMeals.filter(({ recipe }) => recipe).length;

                        return (
                          <button
                            key={dayStr}
                            onClick={() => !isSourceDay && handleDaySelect(day)}
                            disabled={isSourceDay}
                            className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                              isSourceDay
                                ? "border-gray-200 bg-gray-50 cursor-not-allowed opacity-60"
                                : "border-gray-200 hover:border-primary bg-white hover:bg-primary/5 cursor-pointer"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-medium text-gray-800">
                                  {getDayName(day)}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {day.toLocaleDateString()}
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                {hasMeals && (
                                  <div className="flex items-center gap-1 text-xs text-primary">
                                    <ApperIcon name="Chef" size={12} />
                                    <span>{mealCount} meal{mealCount !== 1 ? 's' : ''}</span>
                                  </div>
                                )}
                                
                                {isSourceDay ? (
                                  <div className="flex items-center gap-1 text-xs text-gray-500">
                                    <ApperIcon name="Copy" size={12} />
                                    <span>Source</span>
                                  </div>
                                ) : (
                                  <ApperIcon name="ChevronRight" size={16} className="text-gray-400" />
                                )}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Confirmation Header */}
                  <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center">
                        <ApperIcon name="AlertTriangle" className="w-5 h-5 text-warning" />
                      </div>
                      <div>
                        <h3 className="text-lg font-display font-semibold text-gray-800">
                          Confirm Duplicate
                        </h3>
                        <p className="text-sm text-gray-600">
                          This will replace existing meals
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Confirmation Content */}
                  <div className="p-6">
                    <div className="mb-6">
                      <p className="text-gray-700 mb-4">
                        <span className="font-medium">{getDayName(selectedDayObj)}</span> already has{" "}
                        <span className="font-medium text-primary">
                          {selectedDayMeals.filter(({ recipe }) => recipe).length} meal(s)
                        </span>{" "}
                        planned. Copying from <span className="font-medium">{sourceDayName}</span>{" "}
                        will replace all existing meals.
                      </p>
                      
                      {selectedDayHasMeals && (
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs font-medium text-gray-600 mb-2">
                            Current meals on {getDayName(selectedDayObj)}:
                          </p>
                          <div className="space-y-1">
                            {selectedDayMeals
                              .filter(({ recipe }) => recipe)
                              .map(({ mealType, recipe }) => (
                                <div key={mealType} className="text-sm text-gray-700 flex items-center gap-2">
                                  <ApperIcon name="Utensils" size={12} />
                                  <span className="capitalize">{mealType}:</span>
                                  <span className="font-medium">{recipe.name}</span>
                                </div>
                              ))
                            }
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        onClick={() => setShowConfirmation(false)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={() => handleConfirm()}
                        className="flex-1"
                      >
                        Replace Meals
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default DuplicateDayModal;