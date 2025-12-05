import { NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";

const Navigation = () => {
  const location = useLocation();

  const navItems = [
    {
      name: "Calendar",
      href: "/",
      icon: "Calendar",
      description: "Plan your week"
    },
    {
      name: "Recipes", 
      href: "/recipes",
      icon: "BookOpen",
      description: "Recipe collection"
    },
    {
      name: "Shopping",
      href: "/shopping-list", 
      icon: "ShoppingCart",
      description: "Shopping list"
    },
    {
      name: "Nutrition",
      href: "/nutrition",
      icon: "BarChart3", 
      description: "Track nutrition"
    }
  ];

  return (
    <>
      {/* Desktop Navigation - Hidden on mobile */}
      <div className="hidden md:block fixed top-20 left-6 z-30">
        <nav className="bg-white/95 backdrop-blur-sm rounded-xl shadow-card border border-gray-200 p-2">
          <div className="space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href;
              
              return (
                <NavLink
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative",
                    isActive
                      ? "bg-gradient-to-r from-primary to-accent text-white shadow-md"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                  )}
                >
                  <ApperIcon 
                    name={item.icon} 
                    size={18}
                    className={isActive ? "text-white" : "text-gray-500 group-hover:text-gray-700"}
                  />
                  <div className="min-w-0">
                    <div className="font-medium text-sm">
                      {item.name}
                    </div>
                    <div className={cn(
                      "text-xs opacity-75",
                      isActive ? "text-white/90" : "text-gray-500"
                    )}>
                      {item.description}
                    </div>
                  </div>
                  
                  {isActive && (
                    <motion.div
                      className="absolute -right-1 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-white rounded-full"
                      layoutId="activeIndicator"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </NavLink>
              );
            })}
          </div>
        </nav>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-lg">
        <nav className="flex">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            
            return (
              <NavLink
                key={item.href}
                to={item.href}
                className={cn(
                  "flex-1 flex flex-col items-center gap-1 py-3 px-2 transition-all duration-200",
                  isActive
                    ? "text-primary"
                    : "text-gray-500"
                )}
              >
                <div className={cn(
                  "p-2 rounded-lg transition-all duration-200",
                  isActive && "bg-primary/10"
                )}>
                  <ApperIcon 
                    name={item.icon} 
                    size={20}
                  />
                </div>
                <span className="text-xs font-medium">
                  {item.name}
                </span>
                
                {isActive && (
                  <motion.div
                    className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-primary rounded-full"
                    layoutId="mobileActiveIndicator"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>
    </>
  );
};

export default Navigation;