'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type SimpleCategoryFilterProps = {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
};

export default function SimpleCategoryFilter({ 
  categories, 
  selectedCategory, 
  onSelectCategory 
}: SimpleCategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => (
        <Button
          key={category}
          variant={selectedCategory === category ? "default" : "outline"}
          size="sm"
          className={cn(
            "transition-colors",
            selectedCategory === category 
              ? "bg-primary text-primary-foreground" 
              : "hover:bg-accent"
          )}
          onClick={() => onSelectCategory(category)}
        >
          {category}
        </Button>
      ))}
    </div>
  );
}