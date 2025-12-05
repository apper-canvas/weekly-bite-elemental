import { forwardRef } from "react";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";

const Checkbox = forwardRef(({ 
  label,
  checked = false,
  onChange,
  className,
  labelClassName,
  ...props 
}, ref) => {
  return (
    <label className={cn("flex items-center gap-2 cursor-pointer group", className)}>
      <div className="relative">
        <input
          ref={ref}
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="sr-only"
          {...props}
        />
        <div className={cn(
          "w-5 h-5 border-2 rounded transition-all duration-150 flex items-center justify-center",
          checked 
            ? "bg-primary border-primary text-white" 
            : "bg-white border-gray-300 group-hover:border-primary"
        )}>
          {checked && (
            <ApperIcon name="Check" size={12} className="text-white" />
          )}
        </div>
      </div>
      {label && (
        <span className={cn(
          "text-sm text-gray-700 select-none",
          checked && "line-through text-gray-500",
          labelClassName
        )}>
          {label}
        </span>
      )}
    </label>
  );
});

Checkbox.displayName = "Checkbox";

export default Checkbox;