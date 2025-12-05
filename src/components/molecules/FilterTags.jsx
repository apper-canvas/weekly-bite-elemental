import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";

const FilterTags = ({ 
  availableTags, 
  selectedTags, 
  onTagToggle,
  className 
}) => {
  const allTags = [
    { name: "vegetarian", color: "bg-green-100 text-green-800 border-green-200" },
    { name: "vegan", color: "bg-emerald-100 text-emerald-800 border-emerald-200" },
    { name: "gluten-free", color: "bg-blue-100 text-blue-800 border-blue-200" },
    { name: "dairy-free", color: "bg-purple-100 text-purple-800 border-purple-200" },
    { name: "keto", color: "bg-orange-100 text-orange-800 border-orange-200" },
    { name: "high-protein", color: "bg-red-100 text-red-800 border-red-200" },
    { name: "low-calorie", color: "bg-teal-100 text-teal-800 border-teal-200" },
    { name: "quick", color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
    { name: "mediterranean", color: "bg-indigo-100 text-indigo-800 border-indigo-200" },
    { name: "asian", color: "bg-pink-100 text-pink-800 border-pink-200" }
  ];

  const visibleTags = allTags.filter(tag => 
    availableTags.includes(tag.name)
  );

  if (visibleTags.length === 0) return null;

  return (
    <div className={cn("space-y-3", className)}>
      <h3 className="text-sm font-medium text-gray-700">Filter by diet:</h3>
      <div className="flex flex-wrap gap-2">
        {visibleTags.map((tag) => {
          const isSelected = selectedTags.includes(tag.name);
          
          return (
            <button
              key={tag.name}
              onClick={() => onTagToggle(tag.name)}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200",
                isSelected 
                  ? "bg-primary text-white border-primary shadow-md" 
                  : `${tag.color} hover:shadow-md`
              )}
            >
              {isSelected && (
                <ApperIcon name="Check" size={12} />
              )}
              {tag.name}
            </button>
          );
        })}
      </div>
      
      {selectedTags.length > 0 && (
        <button
          onClick={() => selectedTags.forEach(tag => onTagToggle(tag))}
          className="text-xs text-gray-500 hover:text-gray-700 transition-colors duration-200"
        >
          Clear all filters
        </button>
      )}
    </div>
  );
};

export default FilterTags;