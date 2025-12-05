import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getWeekStart, getWeekDateRange } from "@/utils/dateUtils";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Checkbox from "@/components/atoms/Checkbox";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import ErrorView from "@/components/ui/ErrorView";
import Empty from "@/components/ui/Empty";
import { shoppingListService } from "@/services/api/shoppingListService";
import { mealPlanService } from "@/services/api/mealPlanService";
import { toast } from "react-toastify";
import { addDays, subDays } from "date-fns";

const ShoppingList = () => {
  const [currentWeek, setCurrentWeek] = useState(getWeekStart());
  const [shoppingList, setShoppingList] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newItemName, setNewItemName] = useState("");
  const [addingItem, setAddingItem] = useState(false);
  const [generatingList, setGeneratingList] = useState(false);

  useEffect(() => {
    loadShoppingList();
  }, [currentWeek]);

  const loadShoppingList = async () => {
    if (!currentWeek) return;
    
    try {
      setLoading(true);
      setError("");
      const list = await shoppingListService.getWeekShoppingList(currentWeek);
      setShoppingList(list);
    } catch (err) {
      setError(err.message);
      console.error("Failed to load shopping list:", err);
    } finally {
      setLoading(false);
    }
  };

  const generateFromMealPlan = async () => {
    try {
      setGeneratingList(true);
      const weekPlan = await mealPlanService.getWeekPlan(currentWeek);
      const generatedList = await shoppingListService.generateFromMealPlan(currentWeek, weekPlan.meals);
      setShoppingList(generatedList);
      toast.success("Shopping list generated from meal plan");
    } catch (err) {
      toast.error("Failed to generate shopping list");
      console.error("Failed to generate shopping list:", err);
    } finally {
      setGeneratingList(false);
    }
  };

  const handleItemToggle = async (itemId) => {
    if (!shoppingList) return;
    
    try {
      const item = [...shoppingList.items, ...shoppingList.customItems].find(item => item.id === itemId);
      if (!item) return;

      const updatedList = await shoppingListService.updateItem(currentWeek, itemId, {
        isChecked: !item.isChecked
      });
      setShoppingList(updatedList);
    } catch (err) {
      toast.error("Failed to update item");
      console.error("Failed to update item:", err);
    }
  };

  const handleAddCustomItem = async (e) => {
    e.preventDefault();
    
    if (!newItemName.trim() || !shoppingList) return;
    
    try {
      setAddingItem(true);
      const updatedList = await shoppingListService.addCustomItem(currentWeek, newItemName, "other");
      setShoppingList(updatedList);
      setNewItemName("");
      toast.success("Item added to list");
    } catch (err) {
      toast.error("Failed to add item");
      console.error("Failed to add item:", err);
    } finally {
      setAddingItem(false);
    }
  };

  const handleRemoveCustomItem = async (itemId) => {
    if (!shoppingList) return;
    
    try {
      const updatedList = await shoppingListService.removeCustomItem(currentWeek, itemId);
      setShoppingList(updatedList);
      toast.success("Item removed");
    } catch (err) {
      toast.error("Failed to remove item");
      console.error("Failed to remove item:", err);
    }
  };

  const handleShareList = async () => {
    try {
      const listText = await shoppingListService.getShoppingListText(currentWeek);
      
      if (navigator.share) {
        await navigator.share({
          title: "Shopping List",
          text: listText
        });
      } else {
        await navigator.clipboard.writeText(listText);
        toast.success("Shopping list copied to clipboard");
      }
    } catch (err) {
      toast.error("Failed to share list");
      console.error("Failed to share list:", err);
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

  const groupItemsByCategory = () => {
    if (!shoppingList) return {};

    const allItems = [...shoppingList.items, ...shoppingList.customItems];
    const grouped = allItems.reduce((groups, item) => {
      const category = item.category || "other";
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(item);
      return groups;
    }, {});

    return grouped;
  };

  const getCategoryIcon = (category) => {
    const icons = {
      produce: "Leaf",
      dairy: "Milk",
      meat: "Beef",
      pantry: "Package",
      condiments: "Droplet",
      other: "ShoppingBag"
    };
    return icons[category] || icons.other;
  };

  const getCategoryDisplayName = (category) => {
    const names = {
      produce: "Produce",
      dairy: "Dairy",
      meat: "Meat & Seafood",
      pantry: "Pantry",
      condiments: "Condiments & Sauces",
      other: "Other Items"
    };
    return names[category] || "Other Items";
  };

  const getCompletionStats = () => {
    if (!shoppingList) return { completed: 0, total: 0, percentage: 0 };

    const allItems = [...shoppingList.items, ...shoppingList.customItems];
    const completed = allItems.filter(item => item.isChecked).length;
    const total = allItems.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { completed, total, percentage };
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <ErrorView
        title="Failed to load shopping list"
        message={error}
        onRetry={loadShoppingList}
      />
    );
  }

  const groupedItems = groupItemsByCategory();
  const stats = getCompletionStats();
  const hasItems = Object.keys(groupedItems).length > 0;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        className="space-y-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Shopping List
            </h1>
            <p className="text-gray-600 mt-1">
              {getWeekDateRange(currentWeek)}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              icon="RotateCcw"
              onClick={generateFromMealPlan}
              loading={generatingList}
              disabled={generatingList}
            >
              {generatingList ? "Generating..." : "Generate from Meals"}
            </Button>
            
            {hasItems && (
              <Button
                variant="ghost"
                icon="Share"
                onClick={handleShareList}
              >
                Share
              </Button>
            )}
          </div>
        </div>

        {/* Week Navigation */}
        <div className="flex items-center justify-center gap-3">
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

        {/* Progress Bar */}
        {hasItems && (
          <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Shopping Progress
              </span>
              <span className="text-sm text-gray-600">
                {stats.completed} of {stats.total} items
              </span>
            </div>
            <div className="w-full bg-green-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-secondary to-emerald-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${stats.percentage}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-lg font-semibold text-green-700">
                {stats.percentage}% Complete
              </span>
              {stats.percentage === 100 && (
                <span className="text-sm text-green-600">
                  🎉 All done!
                </span>
              )}
            </div>
          </div>
        )}
      </motion.div>

      {/* Add Item Form */}
      <motion.div
        className="bg-white rounded-xl shadow-card p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
      >
        <form onSubmit={handleAddCustomItem} className="flex gap-3">
          <Input
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            placeholder="Add custom item to shopping list..."
            className="flex-1"
          />
          <Button
            type="submit"
            icon="Plus"
            loading={addingItem}
            disabled={!newItemName.trim() || addingItem}
          >
            Add
          </Button>
        </form>
      </motion.div>

      {/* Shopping List Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
        {!hasItems ? (
          <Empty
            title="No items in your shopping list"
            message="Generate a shopping list from your meal plan or add custom items."
            illustration="🛒"
            action={generateFromMealPlan}
            actionText="Generate from Meals"
            icon="RotateCcw"
          />
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedItems).map(([category, items]) => (
              <motion.div
                key={category}
                className="bg-white rounded-xl shadow-card overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* Category Header */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                      <ApperIcon 
                        name={getCategoryIcon(category)} 
                        size={16} 
                        className="text-white" 
                      />
                    </div>
                    <div>
                      <h3 className="font-display font-semibold text-gray-800">
                        {getCategoryDisplayName(category)}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {items.length} item{items.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Category Items */}
                <div className="p-6">
                  <div className="space-y-3">
                    <AnimatePresence mode="popLayout">
                      {items.map((item) => (
                        <motion.div
                          key={item.id}
                          layout
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ duration: 0.2 }}
                          className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200 group"
                        >
                          <Checkbox
                            checked={item.isChecked}
                            onChange={() => handleItemToggle(item.id)}
                            label={
                              <div className="flex-1">
                                <span className={item.isChecked ? "line-through text-gray-500" : "text-gray-700"}>
                                  {item.quantity && (
                                    <span className="font-medium text-primary mr-2">
                                      {item.quantity}
                                    </span>
                                  )}
                                  {item.name}
                                </span>
                              </div>
                            }
                            className="flex-1"
                          />
                          
                          {item.isCustom && (
                            <button
                              onClick={() => handleRemoveCustomItem(item.id)}
                              className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:bg-red-50 rounded transition-all duration-200"
                            >
                              <ApperIcon name="X" size={16} />
                            </button>
                          )}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Mobile Spacing for Bottom Navigation */}
      <div className="h-20 md:h-0" />
    </div>
  );
};

export default ShoppingList;