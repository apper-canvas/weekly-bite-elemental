import { Outlet } from "react-router-dom";
import { useState } from "react";
import Header from "./Header";
import Navigation from "./Navigation";
import RecipeModal from "./RecipeModal";
import DuplicateDayModal from "./DuplicateDayModal";
const Layout = () => {
  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false);

  const handleAddRecipe = () => {
    setIsRecipeModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onAddRecipe={handleAddRecipe} />
      <Navigation />
      
      {/* Main Content */}
      <main className="md:pl-64 pb-20 md:pb-8">
        <div className="p-4 md:p-6">
          <Outlet />
        </div>
      </main>

      {/* Recipe Modal */}
      <RecipeModal 
        isOpen={isRecipeModalOpen}
        onClose={() => setIsRecipeModalOpen(false)}
      />
    </div>
  );
};

export default Layout;