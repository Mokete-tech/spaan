
import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { categories } from "@/data/services";
import { cn } from "@/lib/utils";

interface CategoryDropdownProps {
  onCategorySelect?: (category: string) => void;
  defaultCategory?: string;
}

const CategoryDropdown: React.FC<CategoryDropdownProps> = ({ 
  onCategorySelect, 
  defaultCategory = "All Categories" 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>(defaultCategory);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setIsOpen(false);
    if (onCategorySelect) {
      const categoryId = category === "All Categories" 
        ? "all"
        : categories.find(c => c.name === category)?.id || "all";
      onCategorySelect(categoryId);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full md:w-60 px-4 py-3 bg-white border border-gray-200 rounded-md text-left focus:outline-none focus:ring-2 focus:ring-spaan-primary/20"
      >
        <span className="block truncate">{selectedCategory}</span>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-gray-500" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-500" />
        )}
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto dropdown-animation">
          <div className="py-1">
            <button
              type="button"
              className={cn(
                "w-full px-4 py-2 text-left text-sm hover:bg-gray-100 focus:outline-none",
                selectedCategory === "All Categories" ? "font-medium text-spaan-primary" : ""
              )}
              onClick={() => handleCategorySelect("All Categories")}
            >
              All Categories
            </button>
            
            {categories.map((category) => (
              <div key={category.id}>
                <button
                  type="button"
                  className={cn(
                    "w-full px-4 py-2 text-left text-sm hover:bg-gray-100 focus:outline-none",
                    selectedCategory === category.name ? "font-medium text-spaan-primary" : ""
                  )}
                  onClick={() => handleCategorySelect(category.name)}
                >
                  {category.name}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryDropdown;
