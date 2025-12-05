
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