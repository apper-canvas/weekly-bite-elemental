import { useState } from "react";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";

const SearchBar = ({ 
  placeholder = "Search recipes...", 
  value = "",
  onChange,
  onClear,
  className 
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleClear = () => {
    onChange("");
    if (onClear) onClear();
  };

  return (
    <div className={cn("relative", className)}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <ApperIcon 
          name="Search" 
          size={18} 
          className={cn(
            "transition-colors duration-200",
            isFocused ? "text-primary" : "text-gray-400"
          )}
        />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        className={cn(
          "w-full pl-10 pr-10 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500",
          "focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary",
          "transition-all duration-200",
          isFocused && "shadow-md ring-2 ring-primary ring-opacity-20"
        )}
      />
      {value && (
        <button
          onClick={handleClear}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
        >
          <ApperIcon name="X" size={18} />
        </button>
      )}
    </div>
  );
};

export default SearchBar;